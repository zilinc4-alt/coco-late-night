import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'https://enjoy.qszhiban.com/'
const OUT = resolve('./out3')
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

async function goto(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1600)
}
async function grab(label) {
  const name = `${captured.length.toString().padStart(2, '0')}_${label}`
  await page.screenshot({ path: `${OUT}\\${name}.png`, fullPage: true }).catch(() => {})
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '')
  await writeFile(`${OUT}\\${name}.txt`, bodyText)
  captured.push({ url: page.url(), file: name })
  console.log(`  ✓ ${name} [${page.url()}]`)
  return bodyText
}
async function clickText(text) {
  const ok = await page.evaluate((t) => {
    for (const el of document.querySelectorAll('*')) {
      const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim()
      const full = (el.innerText || '').trim()
      if (own === t || full === t || (own && own.includes(t))) {
        let node = el
        for (let i = 0; i < 6; i++) {
          if (!node) break
          const tag = node.tagName?.toLowerCase()
          const cls = String(node.className || '')
          if (tag === 'button' || tag === 'a' || node.getAttribute?.('role') === 'button' || /btn|button|tab|card|item/i.test(cls)) {
            node.click(); return true
          }
          node = node.parentElement
        }
        el.click(); return true
      }
    }
    return false
  }, text)
  if (ok) await page.waitForTimeout(1200)
  console.log(`  · ${ok ? '✓' : 'x'} "${text}"`)
  return ok
}

// 1. Open a shop (fill form properly)
await goto(BASE + '#/merchant/new')
await grab('01_new_shop_empty')

// fill by placeholder
await page.evaluate(() => {
  const inputs = document.querySelectorAll('input, textarea, select')
  const values = {
    '店铺名称': '深夜情绪炸物',
    '例如 加班后烧烤档': '深夜情绪炸物',
    '例如 专治下班后那口空落落。': '专治下班后那口空落落。今晚不吃真的对不起自己。',
  }
  for (const el of inputs) {
    const ph = el.getAttribute('placeholder') || ''
    for (const [k, v] of Object.entries(values)) {
      if (ph.includes(k) || ph === k) {
        const setter = Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value').set
        setter.call(el, v)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        break
      }
    }
  }
})
await page.waitForTimeout(500)
await grab('02_new_shop_filled')

await clickText('保存并开店')
await grab('03_after_save')

// 2. Try to add a menu item
await clickText('新增一道不会真的送来的菜')
await grab('04_add_dish_page')

// fill dish form
await page.evaluate(() => {
  const inputs = document.querySelectorAll('input, textarea')
  const map = ['深夜炸鸡块', '被 KPI 追到出汗，先来一口脆的', '18', '128']
  let i = 0
  for (const el of inputs) {
    if (i >= map.length) break
    if (el.type === 'file' || el.type === 'hidden') continue
    const setter = Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value').set
    setter.call(el, map[i++])
    el.dispatchEvent(new Event('input', { bubbles: true }))
  }
})
await page.waitForTimeout(500)
await grab('05_add_dish_filled')

for (const t of ['保存', '添加到菜单', '添加', '完成', '确认']) {
  if (await clickText(t)) { await grab(`06_dish_saved_${t}`); break }
}
await grab('07_after_dish_saved')

// 3. Preview shop
await clickText('预览我的店铺')
await grab('08_preview_shop')

// 4. Look at "shop code" — try loading it back
await goto(BASE + '#/merchant')
await grab('09_merch_login_page')

// 5. Any bottom-nav / cart / me routes I missed
for (const p of ['#/waiting', '#/order/completed', '#/order/done', '#/arrived', '#/settled', '#/received', '#/complete']) {
  await goto(BASE + p)
  await grab(`route${p.replace(/[^a-z]/gi, '_')}`)
}

// 6. Look at cart state after adding
await goto(BASE + '#/menu/late-bbq-lab')
await page.waitForTimeout(1500)
// add multiple items
for (let i = 0; i < 5; i++) {
  const done = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')]
    const plus = btns.find((b) => (b.innerText || '').trim() === '+')
    if (plus) { plus.click(); return true }
    return false
  })
  if (!done) break
  await page.waitForTimeout(300)
}
await grab('10_menu_with_items')

// hover/expand cart summary
await page.evaluate(() => {
  const cart = document.querySelector('[class*="cart"]')
  if (cart) cart.click()
})
await page.waitForTimeout(1000)
await grab('11_cart_expanded')

// 7. Complete order and reach settled/rating
await clickText('去结算')
await grab('12_checkout')

// change address dropdown
await page.evaluate(() => {
  const sel = document.querySelector('select')
  if (sel && sel.options.length > 1) {
    sel.selectedIndex = 1
    sel.dispatchEvent(new Event('change', { bubbles: true }))
  }
})
await page.waitForTimeout(500)
await grab('13_checkout_changed_addr')

await clickText('确认下单')
// Now wait full duration to see arrival — but skip via clicking "我先去喝杯水" etc
await grab('14_waiting_start')
await page.waitForTimeout(2000)

// Try each waiting-page button
for (const t of ['我先去喝杯水', '我去刷个牙', '我还是很想点']) {
  await goto(page.url()) // return to waiting
  await page.waitForTimeout(1500)
  if (await clickText(t)) { await grab(`15_waiting_${t}`) }
}

console.log(`\n✓ ${captured.length} pages`)
await browser.close()
