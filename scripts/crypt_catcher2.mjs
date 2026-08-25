// Catcher v2 for pulling data out of the authenticated AoPS browser session.
//
// v1 (fetch -> POST) died on Chrome Private Network Access: an https page may
// not fetch() http://127.0.0.1. But a top-level FORM NAVIGATION to a private
// address is still allowed, so the browser page builds a <form method="POST"
// enctype="text/plain"> with one field and submits it here. text/plain encoding
// sends `name=value` with the value unescaped, so the payload is base64 (no
// newlines) and we split on the first '='.
//
// Field format:  d=<name>|<base64 payload>
// Writes work/crypt/incoming/<name> (name sanitised), decoded from base64.
//
// Usage: node scripts/crypt_catcher2.mjs   (listens on 127.0.0.1:8899)

import { createServer } from 'http'
import { mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../work/crypt/incoming')
mkdirSync(OUT, { recursive: true })

createServer((req, res) => {
  if (req.method !== 'POST') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end('catcher2 alive') }
  const chunks = []
  req.on('data', c => chunks.push(c))
  req.on('end', () => {
    try {
      const body = Buffer.concat(chunks).toString('utf8')
      const eq = body.indexOf('=')
      if (eq === -1 || !body.startsWith('d')) throw new Error('no d= field')
      const val = body.slice(eq + 1).replace(/[\r\n]+$/, '')
      const bar = val.indexOf('|')
      if (bar === -1) throw new Error('no name|payload separator')
      const name = val.slice(0, bar)
      if (!/^[\w.-]+$/.test(name)) throw new Error(`bad name: ${name}`)
      const payload = Buffer.from(val.slice(bar + 1), 'base64')
      writeFileSync(join(OUT, name), payload)
      console.log(`wrote ${name} (${payload.length} bytes)`)
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(`<title>ok ${name}</title>ok ${name} ${payload.length}b`)
    } catch (e) {
      console.error('FAIL', e.message)
      res.writeHead(400, { 'Content-Type': 'text/html' })
      res.end(`<title>err</title>err ${e.message}`)
    }
  })
}).listen(8899, '127.0.0.1', () => console.log('catcher2 on http://127.0.0.1:8899'))
