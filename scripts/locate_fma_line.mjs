// Map a 1-based line number in a crypt exam source to the problem number that
// contains it, so a typo report can name the problem rather than a byte offset.
//
// Usage: node scripts/locate_fma_line.mjs <docFile> <line> [<line> ...]

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { locate } from './show_fma_problem.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const [file, ...lines] = process.argv.slice(2)
const text = readFileSync(join(ROOT, 'work/crypt', file), 'utf8')
const probs = locate(text)

// Byte offset of the start of each line.
const lineStarts = [0]
for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineStarts.push(i + 1)

for (const l of lines) {
  const off = lineStarts[Number(l) - 1]
  const idx = probs.findIndex(p => off >= p.macroStart && off < p.end)
  if (idx === -1) { console.log(`line ${l}: outside any problem`); continue }
  const p = probs[idx]
  const part = off < p.c.start ? 'QUESTION' : off < p.s.start ? 'CHOICES' : 'SOLUTION'
  console.log(`line ${l}  ->  problem ${idx + 1}  (${part})`)
}
