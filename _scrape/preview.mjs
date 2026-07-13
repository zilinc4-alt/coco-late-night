import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'http://127.0.0.1:5183/'
const OUT = resolve('./_preview')
await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const ctx = await browser.newContext({
  viewport: { width: 420, height: 900 },
  deviceScaleFactor: 2,
})
const page = await ctx.newPage()

// Route grid to capture
const routes = [
  ['home', '/#/home'],
  ['restaurants_bbq', '/#/restaurants/bbq'],
  ['restaurants_new', '/#/restaurants/new'],
  ['menu_bbq', '/#/menu/late-bbq-lab'],
  ['merchant_entry', '/#/merchant'],
  ['merchant_new', '/#/merchant/new'],
]

for (const [name, path] of routes) {
  console.log(`→ ${path}`)
  await page.goto(BASE + path.slice(1), { waitUntil: 'domcontentloaded', timeout: 15000 }).catch((e) => console.log('  err', e.message))
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${OUT}\\${name}.png`, fullPage: true })
}

// Interactive: add items, checkout, waiting
console.log('\n== full flow ==')
await page.goto(BASE + '#/menu/late-bbq-lab', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
// add 5 items to hit 25 yuan minimum
for (let i = 0; i < 5; i++) {
  const plus = page.locator('.plus').first()
  await plus.click().catch(() => {})
  await page.waitForTimeout(150)
}
await page.screenshot({ path: `${OUT}\\menu_with_items.png`, fullPage: true })

// go checkout
await page.locator('.ck-btn').click().catch(() => {})
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUT}\\checkout.png`, fullPage: true })

// place order
await page.locator('.sticky-cta').click().catch(() => {})
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}\\waiting_initial.png`, fullPage: true })

// wait 4s to see counter tick
await page.waitForTimeout(4000)
await page.screenshot({ path: `${OUT}\\waiting_t4s.png`, fullPage: true })

// click "我先去喝杯水" to trigger toast
await page.getByText('我先去喝杯水').click().catch(() => {})
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}\\waiting_toast.png`, fullPage: true })
await page.waitForTimeout(2500)

// click "我还是很想点" to show dialog
await page.getByText('我还是很想点').click().catch(() => {})
await page.waitForTimeout(600)
await page.screenshot({ path: `${OUT}\\waiting_dialog.png`, fullPage: true })

// Merchant flow: open a shop
console.log('\n== merchant flow ==')
await page.goto(BASE + '#/merchant/new', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)
await page.locator('input.field-input').first().fill('深夜可颂研究员')
await page.locator('textarea.field-textarea').fill('专治下班后那口空落落。')
await page.screenshot({ path: `${OUT}\\merch_new_filled.png`, fullPage: true })

await page.locator('button.primary-button').click()
await page.waitForTimeout(1200)
await page.screenshot({ path: `${OUT}\\merch_dashboard.png`, fullPage: true })

await page.locator('button.primary-button').click()
await page.waitForTimeout(1000)
await page.screenshot({ path: `${OUT}\\merch_new_dish.png`, fullPage: true })

console.log(`\n✓ captured → ${OUT}`)
await browser.close()
