import { readFileSync, writeFileSync, mkdirSync } from 'fs'
const p = 'C:/Users/markd/.claude/projects/C--Users-markd-github-trajectory/6057324b-34d0-4228-b85e-fe6f2405d8a4/tool-results/toolu_01L6Db7pBpZAuBCtnEDP9DaG.json'
let t = JSON.parse(readFileSync(p, 'utf8')).map(x => x.text).join('')
t = t.slice(t.indexOf('@@@DOC:'))
const parts = t.split(/@@@DOC:([\w-]+)@@@\n/)
mkdirSync('work/crypt/usapho', { recursive: true })
let n = 0
for (let i = 1; i < parts.length; i += 2) {
  const content = parts[i + 1].replace(/\n@@@ENDALL@@@[\s\S]*$/, '').replace(/\n$/, '')
  writeFileSync('work/crypt/usapho/' + parts[i] + '.tex', content)
  n++
}
console.log('wrote', n, 'files')
const probs = ['175-9209', '175-9210', '175-9211', '175-9212', '191-11215', '191-11408', '191-11426', '191-11427']
for (const d of probs) {
  const c = readFileSync('work/crypt/usapho/' + d + '.tex', 'utf8')
  const macros = [...new Set((c.match(/\\[A-Za-z]+problem\s*[{[]/gi) || []))]
  const secs = (c.match(/\\(section|subsection)\b/g) || []).length
  const boxes = (c.match(/\\boxed/g) || []).length
  console.log(d.padEnd(10), String(c.length).padStart(6) + 'b', 'macros:', macros.join(','), 'sections:', secs, 'boxed:', boxes)
}
