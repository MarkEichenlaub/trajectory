// Diagnostic: screenshot a Miro board the same way ai-server.mjs does, save it to
// a file so we can eyeball whether a board the summarizer called "blank" is really
// blank or whether the capture is missing content.
//   node scripts/diag-screenshot.mjs <boardId> <outPath>
import { chromium } from 'playwright'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIRO_AUTH_STATE = resolve(__dirname, '..', '.miro-auth.json')
const boardId = process.argv[2]
const out = process.argv[3]
const boardUrl = `https://miro.com/app/board/${boardId}/`

const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader'] })
const context = await browser.newContext({ storageState: MIRO_AUTH_STATE })
const page = await context.newPage()
try {
  await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
  await page.waitForTimeout(12_000)
  await page.keyboard.press('Control+Shift+H')
  await page.waitForTimeout(1_500)
  await page.screenshot({ path: out, type: 'jpeg', quality: 80, fullPage: false })
  console.log('saved', out)
} finally {
  await browser.close()
}
