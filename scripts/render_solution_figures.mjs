// Renders the Asymptote diagrams that appear inside AoPS worked solutions and
// uploads them, so the admin's problem preview can show the picture instead of
// a "diagram not shown" note. Run this BEFORE seed_problem_solutions.mjs, which
// links whatever has been uploaded.
//
// A solution's diagram is a bare "#asymptote <name>" node in master.json; the
// source lives in EigenNode/asy_code_store.json keyed by that node's id, so the
// storage path is keyed by node id too and re-running is idempotent.
//
// Toolchain (same as render_fma_asy.mjs, and the same reasons):
//   standalone Asymptote -> PDF -> pdftoppm at 200 DPI -> trim_png.py
// The MiKTeX asy shim silently drops labels, and asy's own -f png rasterises
// them at the wrong DPI.
//
// Usage:
//   node scripts/render_solution_figures.mjs [--force] [--limit N] [--dpi 200]

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'fs'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import {
  loadMaster, loadBankProblems, serviceKey,
  SUPABASE_URL, FIGURE_BUCKET, FIGURE_PREFIX, figurePath,
} from './lib/eigennode_master.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const TMP = join(ROOT, 'work/_solution_asy')

const ASY = 'C:\\Program Files\\Asymptote\\asy.exe'
const args = process.argv.slice(2)
const argVal = (flag, dflt) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : dflt }
const DPI = Number(argVal('--dpi', 200))
const LIMIT = Number(argVal('--limit', 0))
const FORCE = args.includes('--force')

const { nodes, asyStore, childrenOf, childNamed, nodeFor, partNodes } = loadMaster()

// Every #asymptote node inside a bank problem's solution, in reading order.
function solutionDiagrams(problemNode) {
  const found = []
  const walk = node => {
    for (const c of childrenOf(node)) {
      if (String(c.content ?? '').trim().toLowerCase().startsWith('#asymptote')) {
        found.push(c.id)
        continue
      }
      walk(c)
    }
  }
  const parts = partNodes(problemNode)
  for (const owner of parts.length ? parts : [problemNode]) {
    const solution = childNamed(owner, 'solution')
    if (solution) walk(solution)
  }
  return found
}

const wanted = new Map() // node id -> a label for logging
for (const p of loadBankProblems(ROOT)) {
  const node = nodeFor(p)
  if (!node) continue
  for (const id of solutionDiagrams(node)) {
    if (asyStore[id]) wanted.set(id, `${p.label} ${p.set_label}`)
  }
}
console.log(`${wanted.size} solution diagrams to render`)

const supabase = createClient(SUPABASE_URL, serviceKey(ROOT), { auth: { persistSession: false } })

const { data: existing, error: listErr } = await supabase.storage
  .from(FIGURE_BUCKET).list(FIGURE_PREFIX, { limit: 2000 })
if (listErr) { console.error('could not list storage:', listErr.message); process.exit(1) }
const alreadyUp = new Set((existing || []).map(f => f.name.replace(/\.png$/, '')))
console.log(`${alreadyUp.size} already uploaded${FORCE ? ' (--force: re-rendering anyway)' : ''}`)

// Asymptote needs a size directive or it emits a tiny/huge canvas; most AoPS
// figures call size() themselves.
//
// graph and geometry only, matching render_fma_asy.mjs. Adding olympiad to the
// preamble looks harmless and is not: it shadows graph's xaxis/yaxis overloads,
// and eight otherwise-fine figures failed with "no matching variable 'xaxis'"
// until it came back out. A figure that wants olympiad imports it itself.
function wrap(code) {
  const body = code.replace(/^\s*;?\s*\[asy\]/i, '').replace(/\[\/asy\]\s*$/i, '').trim()
  const hasSize = /(^|\n)\s*(size|unitsize)\s*\(/.test(body)
  return [
    'import graph;',
    'import geometry;',
    // Labels are typeset by LaTeX, whose default preamble here has no amsmath —
    // so a label containing \dfrac (which the AoPS sources use constantly) dies
    // as "Undefined control sequence" and asy reports only "shipout failed".
    'usepackage("amsmath");',
    'usepackage("amssymb");',
    // CR() is from cse5, part of the preamble AoPS's own editor supplies and
    // not of a standalone Asymptote install. It is just an arc, so it is
    // shimmed rather than dragging in the whole module.
    /\bCR\s*\(/.test(body) && !/\b(path\s+CR|import\s+cse5)\b/.test(body)
      ? 'path CR(pair O, real r) { return circle(O, r); }\n' +
        'path CR(pair O, real r, real a1, real a2) { return arc(O, r, a1, a2); }'
      : '',
    hasSize ? '' : 'size(300);',
    body,
    '',
  ].filter(Boolean).join('\n')
}

function renderOne(code, outPng) {
  mkdirSync(TMP, { recursive: true })
  const base = 'fig'
  writeFileSync(join(TMP, `${base}.asy`), wrap(code), 'utf8')
  execFileSync(ASY, ['-f', 'pdf', '-noView', '-o', base, `${base}.asy`],
    { cwd: TMP, stdio: 'pipe', timeout: 120000 })
  const pdf = join(TMP, `${base}.pdf`)
  if (!existsSync(pdf)) throw new Error('asy produced no PDF')
  execFileSync('pdftoppm', ['-png', '-r', String(DPI), '-singlefile', pdf, join(TMP, base)],
    { stdio: 'pipe', timeout: 120000 })
  const png = join(TMP, `${base}.png`)
  if (!existsSync(png)) throw new Error('pdftoppm produced no PNG')
  // Trim the uniform white margin only — several AoPS figures draw on a large
  // sparse canvas and would otherwise display as mostly whitespace.
  execFileSync('python', [join(__dirname, 'trim_png.py'), png, outPng, '12'],
    { stdio: 'pipe', timeout: 60000 })
  for (const f of readdirSync(TMP)) if (f !== 'out.png') rmSync(join(TMP, f), { force: true })
}

let done = 0, skipped = 0
const failures = []
let n = 0
for (const [id, label] of wanted) {
  n++
  if (LIMIT && n > LIMIT) break
  if (!FORCE && alreadyUp.has(id)) { skipped++; continue }
  const out = join(TMP, 'out.png')
  try {
    renderOne(String(asyStore[id]), out)
    const bytes = readFileSync(out)
    if (bytes.length < 1000) throw new Error(`suspiciously small PNG (${bytes.length}B)`)
    const { error } = await supabase.storage.from(FIGURE_BUCKET)
      .upload(figurePath(id), bytes, { contentType: 'image/png', upsert: true })
    if (error) throw new Error(`upload: ${error.message}`)
    rmSync(out, { force: true })
    done++
    process.stdout.write(`\rrendered ${done}, skipped ${skipped}, failed ${failures.length}   `)
  } catch (e) {
    const msg = (e.stderr?.toString() || e.message || '').split('\n').filter(Boolean).slice(-2).join(' | ')
    failures.push({ id, label, error: msg.slice(0, 200) })
  }
}
console.log(`\n\nrendered ${done}, already present ${skipped}, failed ${failures.length}`)
if (failures.length) {
  console.log('\nfailures (these keep the "diagram not shown" note):')
  for (const f of failures) console.log(`  ${f.label.padEnd(28)} ${f.id}  ${f.error}`)
}
