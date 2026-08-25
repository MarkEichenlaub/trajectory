// Build the crypt write-back plan.
//
// The crypt stores a document as blank-line-separated "lines" joined by \n\n,
// and the only content-edit API is replace_document_line (a replacement is
// re-split server-side, so one line may become several). The plan therefore
// partitions each fixed document into exactly n_old chunks whose \n\n-join
// equals the new document; chunk i replaces old line i positionally. Surplus
// blocks are folded into the first chunk. A chunk equal to the line's current
// text is skipped by the runner.
//
// Also emits a targeted single-line fix: exam shell 175-9201's printed answer
// key says "1. d", but the solution (and the choices) give 2.07 m/s = (b);
// 4.07 (d) is the add-instead-of-subtract distractor.
//
// Output: work/crypt/writeback-plan.json  { docs: {key: [chunk,...]},
//          lineOps: [{key, matchContains, replaceWith}] }
//
// Usage: node scripts/build_writeback_plan.mjs

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const N_OLD = { '175-9207': 53, '175-9208': 47, '191-11108': 116, '191-11254': 181, '190-10427': 146 }

const plan = { docs: {}, lineOps: [] }

for (const [doc, nOld] of Object.entries(N_OLD)) {
  const text = readFileSync(join(ROOT, 'work/crypt/fixed', doc + '.tex'), 'utf8')
  const blocks = text.split('\n\n')
  if (blocks.length < nOld) throw new Error(`${doc}: ${blocks.length} blocks < ${nOld} lines`)
  const extra = blocks.length - nOld
  const chunks = [blocks.slice(0, extra + 1).join('\n\n'), ...blocks.slice(extra + 1)]
  if (chunks.length !== nOld) throw new Error(`${doc}: chunk math wrong`)
  if (chunks.some(c => c.trim() === '')) throw new Error(`${doc}: empty chunk`)
  if (chunks.join('\n\n') !== text) throw new Error(`${doc}: join mismatch`)
  plan.docs[doc] = chunks
}

plan.lineOps.push({
  key: '175-9201',
  matchContains: '1. d & 6. a & 11. d & 16. c & 21. e',
  replaceWith: (line) => null, // placeholder; runner does string replace below
  find: '1. d &',
  replace: '1. b &',
})
// keep lineOps JSON-serialisable
plan.lineOps = [{ key: '175-9201', matchContains: '1. d & 6. a & 11. d & 16. c & 21. e', find: '1. d &', replace: '1. b &' }]

writeFileSync(join(ROOT, 'work/crypt/writeback-plan.json'), JSON.stringify(plan))
console.log('plan written:', Object.entries(plan.docs).map(([k, v]) => k + ':' + v.length + ' chunks').join('  '), '+', plan.lineOps.length, 'lineOp')
