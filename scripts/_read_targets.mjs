import { readFileSync } from 'fs'
import { locateUsapho } from './check_usapho_style.mjs'

const strip = s => s.replace(/\[asy\][\s\S]*?\[\/asy\]/g, '[ASY-FIG]')
function show(doc, part, num, what = 'both', trunc = 2600) {
  const t = readFileSync('work/crypt/usapho-fixed/' + doc + '.tex', 'utf8')
  const items = locateUsapho(t)
  for (const it of items) {
    if (it.part === part && it.num === String(num)) {
      if (what === 'both' || what === it.kind) {
        console.log(`\n######## ${doc} ${part}${num} ${it.kind} ########`)
        console.log(strip(it.body).slice(0, trunc))
      }
    }
  }
}
const which = process.argv[2]
if (which === '1') {
  show('175-9209', 'A', 1)
} else if (which === '2') {
  show('175-9211', 'B', 3, 'problem')
  show('175-9211', 'B', 4, 'problem', 3200)
} else if (which === '3') {
  show('191-11215', 'A', 5, 'problem', 4200)
} else if (which === '4') {
  show('191-11215', 'A', 2, 'problem')
} else if (which === '5') {
  show('191-11426', 'B', 4, 'both', 5200)
}
