// Render the [asy] figures from the parsed PhysicsWOOT practice exams to PNG.
//
// Uses the STANDALONE Asymptote (C:\Program Files\Asymptote\asy.exe), not the
// MiKTeX shim -- the shim's label pipeline is broken and silently drops text.
//
// Asymptote is driven asy -> PDF -> PNG (via pdftoppm) rather than asy's own
// -f png, because the direct PNG path rasterises labels at the wrong DPI and
// gives fuzzy text. Rendering at 200 DPI from vector PDF keeps labels sharp.
//
// Usage:
//   node scripts/render_fma_asy.mjs [--exam <key>] [--only <n>] [--dpi 200]

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'fs'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PARSED = join(ROOT, 'work/crypt/parsed')
const OUT = join(ROOT, 'work/crypt/figures')
const TMP = join(ROOT, 'work/crypt/_asytmp')

const ASY = 'C:\\Program Files\\Asymptote\\asy.exe'
const PDFTOPPM = 'pdftoppm'

const args = process.argv.slice(2)
const argVal = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d }
const DPI = Number(argVal('--dpi', 200))
const ONLY_EXAM = argVal('--exam', null)
const ONLY_N = argVal('--only', null)

// Asymptote needs a size directive or it emits a tiny/huge canvas. Most AoPS
// figures already call size(); for those that don't, impose a sane default.
function wrap(code) {
  const hasSize = /(^|\n)\s*(size|unitsize)\s*\(/.test(code)
  const preamble = [
    'import graph;',
    'import geometry;',
    hasSize ? '' : 'size(300);',
  ].filter(Boolean).join('\n')
  return `${preamble}\n${code}\n`
}

function renderOne(code, outPng) {
  mkdirSync(TMP, { recursive: true })
  const base = 'fig'
  const asyPath = join(TMP, `${base}.asy`)
  writeFileSync(asyPath, wrap(code), 'utf8')

  // asy -> PDF
  execFileSync(ASY, ['-f', 'pdf', '-noView', '-o', base, `${base}.asy`], {
    cwd: TMP, stdio: 'pipe', timeout: 120000,
  })
  const pdf = join(TMP, `${base}.pdf`)
  if (!existsSync(pdf)) throw new Error('asy produced no PDF')

  // PDF -> PNG at DPI, cropped to the drawing
  execFileSync(PDFTOPPM, ['-png', '-r', String(DPI), '-singlefile', pdf, join(TMP, base)], {
    stdio: 'pipe', timeout: 120000,
  })
  const png = join(TMP, `${base}.png`)
  if (!existsSync(png)) throw new Error('pdftoppm produced no PNG')

  // Trim the uniform white border. This only removes empty margin, so relative
  // positions inside the figure are untouched -- several AoPS figures draw on a
  // large sparse canvas and would otherwise display as mostly whitespace.
  execFileSync('python', [join(__dirname, 'trim_png.py'), png, outPng, '12'], {
    stdio: 'pipe', timeout: 60000,
  })
  for (const f of readdirSync(TMP)) rmSync(join(TMP, f), { force: true })
  return statSync(outPng).size
}

function main() {
  mkdirSync(OUT, { recursive: true })
  const results = []
  for (const file of readdirSync(PARSED).filter(f => f.endsWith('.json'))) {
    const exam = JSON.parse(readFileSync(join(PARSED, file), 'utf8'))
    if (ONLY_EXAM && exam.key !== ONLY_EXAM) continue
    exam.questions.forEach((q, i) => {
      const n = i + 1
      if (ONLY_N && Number(ONLY_N) !== n) return
      const groups = [
        ['q', q.statement_figures || []],
        ['c', q.choice_figures || []],
        ['s', q.solution_figures || []],
      ]
      for (const [tag, figs] of groups) {
        figs.forEach((code, k) => {
          const name = `${exam.key}-q${String(n).padStart(2, '0')}-${tag}${k + 1}.png`
          const dest = join(OUT, name)
          try {
            const bytes = renderOne(code, dest)
            results.push({ name, bytes, ok: bytes > 1000 })
          } catch (e) {
            const msg = (e.stderr?.toString() || e.message || '').split('\n').filter(Boolean).slice(-2).join(' | ')
            results.push({ name, bytes: 0, ok: false, error: msg.slice(0, 160) })
          }
        })
      }
    })
  }
  const bad = results.filter(r => !r.ok)
  console.log(`rendered ${results.length - bad.length}/${results.length} figures`)
  if (bad.length) {
    console.log('\nFAILURES / SUSPICIOUS:')
    for (const b of bad) console.log(` ${b.name}  ${b.bytes}B  ${b.error || 'suspiciously small'}`)
  }
  writeFileSync(join(ROOT, 'work/crypt/figure_report.json'), JSON.stringify(results, null, 1))
}

main()
