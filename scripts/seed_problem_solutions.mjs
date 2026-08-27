// Loads worked solutions for the AoPS course problems into public.problem_solutions,
// which the admin's problem preview shows under the statement.
//
// Source is EigenNode's master.json on Google Drive -- the same tree
// eigennode/scripts/export_course_index.py reads to write data/aops-*.json.
// That export deliberately drops the Solution and Answer nodes, because data/
// is a public repo (see supabase/migrations/20260827120000_problem_solutions.sql);
// this script carries them the other way, into a table only is_admin() can read.
//
// The solution prose is EigenNode-flavored -- \[..\] display math, **bold**,
// bbcode leftovers, [asy] diagrams, stray literal \t -- so it is normalized into
// the portal's convention on the way in: $$..$$ for all math, __text__ for bold,
// blank lines between paragraphs (cf. scripts/fma_solutions_extracted.mjs).
//
// Run scripts/render_solution_figures.mjs FIRST: it renders the Asymptote
// diagrams a solution refers to, and this script links whatever it finds
// uploaded (anything missing keeps a "diagram not shown" note instead).
//
// Usage:
//   node scripts/seed_problem_solutions.mjs --dry-run     # report coverage only
//   node scripts/seed_problem_solutions.mjs --emit-json   # print the rows, don't write
//   node scripts/seed_problem_solutions.mjs               # upsert + prune orphans

import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  loadMaster, loadBankProblems, serviceKey,
  SUPABASE_URL, FIGURE_BUCKET, FIGURE_PREFIX, figureUrl,
} from './lib/eigennode_master.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DRY_RUN = process.argv.includes('--dry-run')
const EMIT_JSON = process.argv.includes('--emit-json')
const log = (...a) => { if (!EMIT_JSON) console.log(...a) }

const { childrenOf, childNamed, nodeFor, partNodes } = loadMaster()

// Which Asymptote diagrams render_solution_figures.mjs has actually uploaded.
// A solution that references one we don't have says so rather than showing a
// broken image, so the two scripts can be run in either order (or not at all).
const supabase = createClient(SUPABASE_URL, serviceKey(ROOT), { auth: { persistSession: false } })
const renderedFigures = new Set()
{
  const { data, error } = await supabase.storage
    .from(FIGURE_BUCKET).list(FIGURE_PREFIX, { limit: 2000 })
  if (error) log(`warning: could not list rendered figures (${error.message})`)
  for (const f of data || []) renderedFigures.add(f.name.replace(/\.png$/, ''))
}

// ---- text normalization ---------------------------------------------------
const IMG_MD = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g
const IMG_BB = /\[img[^\]]*\](https?:\/\/[^\][]+)\[\/img\]/gi
const ASY_BLOCK = /\[asy\][\s\S]*?\[\/asy\]/gi
const DIAGRAM_NOTE = '__[diagram not shown — open the problem in EigenNode]__'

// Apply a prose-only transform to the parts of `text` that are not math. An
// unprotected bbcode strip would eat things like $$[x]$$, and markdown rules
// have no business inside a formula.
function outsideMath(text, fn) {
  return text
    .split(/(\$\$[\s\S]*?\$\$)/g)
    .map(seg => (seg.startsWith('$$') ? seg : fn(seg)))
    .join('')
}

function cleanParagraph(text, figures) {
  let t = text
  let diagrams = 0

  t = t.replace(ASY_BLOCK, () => { diagrams++; return ' ' })
  for (const m of t.matchAll(IMG_MD)) figures.push(m[1])
  for (const m of t.matchAll(IMG_BB)) figures.push(m[1].trim())
  // Images stay where they are -- a solution says "looks like this:" and then
  // shows one -- but the alt text goes, since the bbcode strip below would eat
  // "[Figure 1]" out of the middle and leave the rest as debris.
  t = t.replace(IMG_MD, (_, url) => ` ![](${url}) `)
       .replace(IMG_BB, (_, url) => ` ![](${url.trim()}) `)

  // Stray literal \t and \r (an AoPS import artifact -- eigennode strips \t
  // too). The negative lookahead keeps \theta, \times, \tan, \rho intact.
  t = t.replace(/\\[tr](?![a-zA-Z])/g, ' ')

  // Markdown bold before the math is split off, since a heading like
  // "**Solution by finding $$\alpha$$**" wraps its markers around a formula and
  // the two halves would never meet again once the segments are separated.
  t = t.replace(/\*\*([\s\S]+?)\*\*/g, '__$1__')

  // A few macros the source picked up from LaTeX proper that KaTeX has no
  // definition for; without this they render as red error text.
  // \Aboxed{m & = 3} is mathtools' align-aware box: the alignment marker lives
  // inside the braces, which plain \boxed rejects, so the marker is lifted out.
  t = t
    .replace(/\\Aboxed\s*\{([^&}]*)&([^}]*)\}/g, '$1 & \\boxed{$2}')
    .replace(/\\Aboxed\b/g, '\\boxed')
    .replace(/\\mbox\b/g, '\\text')
    .replace(/\\vspace\s*\{[^}]*\}/g, '')

  // Display math into the portal's one math delimiter. The lookbehinds keep the
  // row break in "\\[6pt]" from being read as the start of a display block; the
  // aligned/cases pass runs outside existing $$..$$ so a block already wrapped
  // isn't wrapped twice.
  t = t.replace(/(?<!\\)\\\[([\s\S]*?)(?<!\\)\\\]/g, (_, body) => `$$${body.trim()}$$`)
  t = outsideMath(t, seg =>
    seg.replace(/\\begin\{(aligned|align\*?|gather\*?|cases|array)\}[\s\S]*?\\end\{\1\}/g,
      block => `$$${block}$$`))

  // [size=60] [/size] [quote=..] [hide] -- only outside math, where [x] and
  // [\omega] are dimension brackets, not bbcode.
  t = outsideMath(t, seg => seg.replace(/\[\/?[a-zA-Z][^\]]*\]/g, ' '))

  return { text: t.replace(/\s+/g, ' ').trim(), diagrams }
}

// Flatten a Solution / Answer container into normalized paragraphs.
function collect(container) {
  const paras = []
  const figures = []
  let diagrams = 0
  if (!container) return { text: '', figures, diagrams }

  const walk = node => {
    for (const c of childrenOf(node)) {
      const raw = String(c.content ?? '').trim()
      if (raw.toLowerCase().startsWith('#asymptote')) {
        // A diagram, drawn in Asymptote. render_solution_figures.mjs renders it
        // to a PNG keyed by this node's id; if that hasn't run (or the figure
        // failed to render) the prose still refers to a picture, so say it's
        // missing rather than leaving a broken image or silence.
        if (renderedFigures.has(c.id)) {
          figures.push(figureUrl(c.id))
          paras.push(`![](${figureUrl(c.id)})`)
        } else {
          diagrams++
          paras.push(DIAGRAM_NOTE)
        }
        continue // the subtree below is Asymptote source, not prose
      }
      if (raw.startsWith('#')) {  // #hide / #image markers: drop the label, keep the content
        for (const m of raw.matchAll(IMG_MD)) figures.push(m[1])
        walk(c)
        continue
      }
      if (raw) {
        const cleaned = cleanParagraph(raw, figures)
        diagrams += cleaned.diagrams
        if (cleaned.text) paras.push(cleaned.text)
      }
      walk(c)
    }
  }
  walk(container)

  const deduped = paras.filter((p, i) => !(p === DIAGRAM_NOTE && paras[i - 1] === DIAGRAM_NOTE))
  return { text: deduped.join('\n\n'), figures: [...new Set(figures)], diagrams }
}

// The Answer node holds whatever AoPS's grader accepts, which for a written
// answer is a machine spec -- alternates separated by blank lines, tolerance
// bands as s-expressions ("e: (and (>= a 65) (<= a 120))"). None of that is
// worth showing, so keep the multiple-choice letter or a short plain value and
// otherwise nothing; the worked solution boxes its own answer anyway.
function cleanAnswer(text) {
  const first = (text || '').split(/\n\s*\n/)[0].trim()
  if (/^[a-eA-E]$/.test(first)) return first.toLowerCase()
  const plain = first.replace(/\be:\s*\([\s\S]*$/, '').trim()
  if (!plain || plain.startsWith('(')) return null
  return plain.length <= 60 ? plain : null
}

// Multi-part problems ("Problem 6 (Parts A–B)") keep a Problem/Answer/Solution
// under each part container, and the exported statement concatenates the parts
// with __(a)__ labels -- so the solution is stitched together the same way.
function solutionFor(problemNode) {
  const parts = partNodes(problemNode)
  if (!parts.length) {
    const sol = collect(childNamed(problemNode, 'solution'))
    return { ...sol, answer: cleanAnswer(collect(childNamed(problemNode, 'answer')).text) }
  }
  const chunks = []
  const answers = []
  const figures = []
  let diagrams = 0
  parts.forEach((part, i) => {
    const letter = String.fromCharCode(97 + i)
    const sol = collect(childNamed(part, 'solution'))
    const ans = cleanAnswer(collect(childNamed(part, 'answer')).text)
    diagrams += sol.diagrams
    figures.push(...sol.figures)
    if (sol.text) chunks.push(`__(${letter})__ ${sol.text}`)
    if (ans) answers.push(`(${letter}) ${ans}`)
  })
  return {
    text: chunks.join('\n\n'),
    figures: [...new Set(figures)],
    diagrams,
    answer: answers.join('   '),
  }
}

// ---- the portal's problem bank -------------------------------------------
const problems = loadBankProblems(ROOT)

const rows = []
const stats = { total: problems.length, matched: 0, withSolution: 0, withAnswer: 0, diagrams: 0, figures: 0 }
for (const p of problems) {
  const node = nodeFor(p)
  if (!node) continue
  stats.matched++
  const { text, figures, diagrams, answer } = solutionFor(node)
  if (!text && !answer) continue
  if (text) stats.withSolution++
  if (answer) stats.withAnswer++
  stats.diagrams += diagrams
  stats.figures += figures.length
  rows.push({
    problem_id: p.id,
    aops_id: p.aops_id ? String(p.aops_id) : null,
    answer: answer || null,
    solution: text || null,
    figure_urls: figures,
    diagram_count: diagrams,
    updated_at: new Date().toISOString(),
  })
}

log(`${stats.total} problems in the bank`)
log(`${stats.matched} found in master.json`)
log(`${rows.length} rows: ${stats.withSolution} with a solution, ${stats.withAnswer} with an answer`)
log(`${stats.figures} figures shown inline, ${stats.diagrams} diagrams still missing a render`)

if (EMIT_JSON) {
  process.stdout.write(JSON.stringify(rows))
  process.exit(0)
}

if (DRY_RUN) {
  const sample = rows.find(r => r.aops_id === '32628') || rows[0]
  console.log('\n--- sample row ---')
  console.log('answer:', sample.answer)
  console.log((sample.solution || '').slice(0, 900))
  process.exit(0)
}

// ---- upsert ---------------------------------------------------------------
for (let i = 0; i < rows.length; i += 200) {
  const batch = rows.slice(i, i + 200)
  const { error } = await supabase.from('problem_solutions').upsert(batch, { onConflict: 'problem_id' })
  if (error) { console.error('\nupsert failed:', error.message); process.exit(1) }
  process.stdout.write(`\rupserted ${Math.min(i + 200, rows.length)}/${rows.length}`)
}
console.log()

// A problem that left the bank -- or whose id changed in a re-export -- would
// otherwise keep its stale solution here forever.
const keep = new Set(rows.map(r => r.problem_id))
const { data: existing, error: readErr } = await supabase.from('problem_solutions').select('problem_id')
if (readErr) { console.error('read-back failed:', readErr.message); process.exit(1) }
const orphans = existing.map(r => r.problem_id).filter(id => !keep.has(id))
if (orphans.length) {
  const { error } = await supabase.from('problem_solutions').delete().in('problem_id', orphans)
  if (error) { console.error('prune failed:', error.message); process.exit(1) }
  console.log(`pruned ${orphans.length} solution${orphans.length === 1 ? '' : 's'} whose problem is no longer in the bank`)
}
console.log(`done — ${rows.length} solutions in problem_solutions`)
