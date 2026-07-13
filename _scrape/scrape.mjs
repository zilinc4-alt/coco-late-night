import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'https://enjoy.qszhiban.com/'
const OUT = resolve('./out')

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME, headless: true })
const ctx = await browser.newContext({
  viewport: { width: 420, height: 900 },
  deviceScaleFactor: 2,
  userAgent:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
})
const page = await ctx.newPage()

const captured = []
const apiCalls = new Set()
page.on('request', (r) => {
  const u = r.url()
  if (u.includes('/api') || u.match(/\.(json|graphql)/)) apiCalls.add(`${r.method()} ${u}`)
})

async function goto(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1800)
}

async function grab(label) {
  const name = `${captured.length.toString().padStart(2, '0')}_${label}`
  const shot = `${OUT}\\${name}.png`
  const html = `${OUT}\\${name}.html`
  const txt = `${OUT}\\${name}.txt`
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {})
  const rawHtml = await page.content().catch(() => '')
  await writeFile(html, rawHtml)
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '')
  await writeFile(txt, bodyText)
  captured.push({ url: page.url(), file: name, textLen: bodyText.length })
  console.log(`  ✓ ${name}  [${page.url()}]  (${bodyText.length}b text)`)
}

async function clickText(text, opts = {}) {
  try {
    const el = page.getByText(text, { exact: opts.exact ?? false }).first()
    await el.waitFor({ state: 'visible', timeout: 4000 })
    await el.click({ timeout: 4000 })
    await page.waitForTimeout(1500)
    return true
  } catch (e) {
    console.log(`  ! click "${text}" fail: ${e.message.split('\n')[0]}`)
    return false
  }
}

// ============ HOME ============
console.log('\n=== HOME ===')
await goto(BASE)
await grab('home')

// ============ CUSTOMER FLOW ============
console.log('\n=== CUSTOMER FLOW ===')
await clickText('开始点单')
await grab('cust_01_shop_list')

// try each category
for (const cat of ['新店', '烧烤', '炸鸡', '奶茶', '甜品', '麻辣烫', '汉堡薯条', '泡面夜宵', '随便来点重口的']) {
  const ok = await clickText(cat, { exact: true })
  if (ok) await grab(`cust_cat_${cat}`)
}

// go into a shop
await clickText('烧烤', { exact: true })
await clickText('深夜烧烤研究所')
await grab('cust_02_shop_detail')

// try adding items — look for + or 加入 or ¥ buttons
try {
  const plusBtns = await page.$$('button, [role="button"], [class*="add"], [class*="plus"]')
  console.log(`  found ${plusBtns.length} buttons on shop page`)
  for (let i = 0; i < Math.min(plusBtns.length, 5); i++) {
    await plusBtns[i].click({ timeout: 1500 }).catch(() => {})
    await page.waitForTimeout(400)
  }
  await grab('cust_03_shop_after_add')
} catch {}

// try to go to cart / checkout
for (const t of ['去结算', '结算', '去下单', '下单', '去支付', '购物车', '选好了']) {
  const ok = await clickText(t)
  if (ok) {
    await grab(`cust_04_${t}`)
    break
  }
}

// try paying
for (const t of ['立即支付', '支付', '确认支付', '假装支付', '假装下单']) {
  const ok = await clickText(t)
  if (ok) {
    await grab(`cust_05_${t}`)
    break
  }
}

// wait for delivery animation / arrival
await page.waitForTimeout(4000)
await grab('cust_06_delivering')
await page.waitForTimeout(6000)
await grab('cust_07_delivering_later')
await page.waitForTimeout(6000)
await grab('cust_08_delivering_later2')

// try clicking common "arrived" / feedback prompts
for (const t of ['送达', '已送达', '评价', '再点一次', '完成', '收货', '拆开']) {
  const ok = await clickText(t)
  if (ok) await grab(`cust_09_${t}`)
}

// ============ MERCHANT FLOW ============
console.log('\n=== MERCHANT FLOW ===')
await goto(BASE)
await grab('home_2')

await clickText('我是店家')
await grab('merch_01')

for (const t of ['开店', '创建店铺', '注册', '登录', '进入店家', '开始']) {
  const ok = await clickText(t)
  if (ok) {
    await grab(`merch_02_${t}`)
    break
  }
}

// try common merchant back-office paths
for (const p of ['#/merchant', '#/shop/admin', '#/admin', '#/store', '#/dashboard']) {
  await goto(BASE + p)
  await grab(`merch_route_${p.replace(/[^a-z]/gi, '_')}`)
}

// ============ MISC HASH ROUTES ============
console.log('\n=== MISC ROUTES ===')
for (const p of [
  '#/home',
  '#/restaurants',
  '#/restaurants/bbq',
  '#/restaurants/friedchicken',
  '#/restaurants/milktea',
  '#/restaurants/dessert',
  '#/restaurants/hotpot',
  '#/restaurants/burger',
  '#/restaurants/instant',
  '#/cart',
  '#/order',
  '#/orders',
  '#/checkout',
  '#/pay',
  '#/delivering',
  '#/arrived',
  '#/about',
  '#/me',
  '#/profile',
]) {
  await goto(BASE + p)
  await grab(`route_${p.replace(/[^a-z]/gi, '_')}`)
}

await writeFile(
  `${OUT}\\_summary.json`,
  JSON.stringify({ captured, apiCalls: [...apiCalls] }, null, 2),
)

console.log(`\n✓ ${captured.length} pages captured`)
console.log(`✓ API calls: ${apiCalls.size}`)
await browser.close()
