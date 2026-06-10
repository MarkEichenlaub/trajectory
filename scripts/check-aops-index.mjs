// Sanity check: data/aops-index.json must list course files that exist in
// data/ (fetchJSON serves them from raw.githubusercontent.com at the same
// relative paths). Prints record counts per file.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const index = JSON.parse(readFileSync(join(root, 'data', 'aops-index.json'), 'utf8'))

let total = 0
let failed = 0
for (const file of index.files) {
  try {
    const records = JSON.parse(readFileSync(join(root, 'data', file), 'utf8'))
    if (!Array.isArray(records)) throw new Error('not an array')
    total += records.length
    const courses = [...new Set(records.map(r => r.contest))]
    console.log(`${file.padEnd(24)} ${String(records.length).padStart(4)} records  (${courses.join(', ')})`)
  } catch (e) {
    failed++
    console.error(`${file.padEnd(24)} FAILED: ${e.message}`)
  }
}
console.log(`\n${index.files.length} files, ${total} records total${failed ? `, ${failed} FAILED` : ''}`)
process.exit(failed ? 1 : 0)
