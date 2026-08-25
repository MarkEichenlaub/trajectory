import { readFileSync } from 'fs'
const showAll = (file, pat, n = 170) => {
  const t = readFileSync('work/crypt/fixed/' + file, 'utf8')
  let i = -1, k = 0
  while ((i = t.indexOf(pat, i + 1)) !== -1 && k < 6) {
    k++
    console.log(`=== ${file} [${pat.slice(0, 40)}] #${k}`)
    console.log(t.slice(Math.max(0, i - n), i + n).replace(/\n/g, ' | '))
    console.log()
  }
  if (!k) console.log(`=== ${file} [${pat}] NOT FOUND\n`)
}
showAll('190-10427.tex', '\\lambda x_1')
showAll('190-10427.tex', '\\sqrt{0.1')
showAll('190-10427.tex', '0.1 \\;\\mathrm{cm')
showAll('190-10427.tex', 'uncertainty in the area')
showAll('191-11108.tex', '\\rho g h')
showAll('191-11108.tex', '\\rho g \\ell')
