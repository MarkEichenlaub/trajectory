/**
 * One-time setup: save Miro login so ai-server.mjs can take automatic
 * board screenshots without you having to click anything.
 *
 * Run once:  node scripts/miro-auth-setup.mjs
 *
 * A browser window opens. Log in to Miro as usual. As soon as you reach
 * the Miro dashboard the auth state is saved to .miro-auth.json and the
 * window closes. After that, the AI server takes screenshots automatically.
 */
import { chromium } from 'playwright'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const AUTH_PATH = resolve(__dirname, '..', '.miro-auth.json')

// Use real Chrome with automation flags stripped so Google's OAuth doesn't block
// the sign-in. Without ignoreDefaultArgs + disable-blink-features, Playwright
// passes --enable-automation and sets navigator.webdriver, both of which Google
// detects and rejects.
console.log('Opening Chrome — log in to Miro, then wait.\n')
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--disable-blink-features=AutomationControlled'],
  ignoreDefaultArgs: ['--enable-automation'],
})
const context = await browser.newContext()
// Clear the JS-visible webdriver flag too
await context.addInitScript(() => {
  Object.defineProperty(navigator, 'webdriver', { get: () => undefined })
})
const page = await context.newPage()
await page.goto('https://miro.com/login/')

await page.waitForURL('https://miro.com/app/**', { timeout: 120_000 })
console.log('Logged in! Saving auth state...')
await context.storageState({ path: AUTH_PATH })
await browser.close()
console.log(`Auth saved to ${AUTH_PATH}`)
console.log('The AI server will now capture board screenshots automatically.')
