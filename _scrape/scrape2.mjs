import { chromium } from 'playwright-core'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const BASE = 'https://enjoy.qszhiban.com/'
const OUT = resolve('./out2')

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
const apiCalls = new Map()
page.on('request', (r) => {
  const u = r.url()
  if (!u.startsWith('data:') && !u.match(/\.(png|jpg|webp|svg|css|woff|js)(\?|$)/) && !u.includes(BASE + 'assets')) {
    apiCalls.set(r.method() + ' ' + u, (apiCalls.get(r.method() + ' ' + u) || 0) + 1)
  }
})

async function goto(url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1600)
}

async function grab(label) {
  const name = `${captured.length.toString().padStart(2, '0')}_${label}`
  await page.screenshot({ path: `${OUT}\\${name}.png`, fullPage: true }).catch(() => {})
  const rawHtml = await page.content().catch(() => '')
  await writeFile(`${OUT}\\${name}.html`, rawHtml)
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '')
  await writeFile(`${OUT}\\${name}.txt`, bodyText)
  captured.push({ url: page.url(), file: name, textLen: bodyText.length })
  console.log(`  ✓ ${name} [${page.url()}] (${bodyText.length}b)`)
  return bodyText
}

// Click by matching text via evaluate (handles emoji+text tabs)
async function clickByPartialText(text) {
  const clicked = await page.evaluate((t) => {
    const walk = document.querySelectorAll('*')
    for (const el of walk) {
      const own = el.childNodes && [...el.childNodes]
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join('')
        .trim()
      const full = (el.innerText || '').trim()
      if ((own && own.includes(t)) || full === t) {
        // find the nearest clickable ancestor
        let node = el
        for (let i = 0; i < 6; i++) {
          if (!node) break
          const tag = node.tagName?.toLowerCase()
          const role = node.getAttribute?.('role')
          const cls = node.className || ''
          if (
            tag === 'button' || tag === 'a' || role === 'button' ||
            /btn|button|tab|card|item|shop|category/i.test(String(cls))
          ) {
            node.click()
            return { ok: true, tag, cls: String(cls).slice(0, 60) }
          }
          node = node.parentElement
        }
        el.click()
        return { ok: true, tag: el.tagName?.toLowerCase(), cls: (el.className || '').toString().slice(0, 60) }
      }
    }
    return { ok: false }
  }, text)
  if (clicked.ok) {
    await page.waitForTimeout(1200)
    console.log(`  · clicked "${text}" (${clicked.tag}.${clicked.cls})`)
  } else {
    console.log(`  x missed "${text}"`)
  }
  return clicked.ok
}

// ============ HOME ============
console.log('=== HOME ===')
await goto(BASE)
await grab('home')

// ============ CUSTOMER FLOW ============
console.log('\n=== CUSTOMER: START ORDER ===')
await clickByPartialText('开始点单')
await grab('cust_shop_list_default')

// Try each category using partial text matcher
for (const cat of ['新店', '烧烤', '炸鸡', '奶茶', '甜品', '麻辣烫', '汉堡薯条', '泡面夜宵', '随便来点重口的']) {
  if (await clickByPartialText(cat)) {
    await grab(`cust_cat_${cat}`)
  }
}

// enter a shop
await clickByPartialText('烧烤')
await page.waitForTimeout(600)
await clickByPartialText('深夜烧烤研究所')
await grab('cust_shop_detail')

// add items — click all "+" buttons on shop page
console.log('  · adding items...')
for (let i = 0; i < 8; i++) {
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button, [role="button"]')]
    const plus = btns.find((b) => {
      const t = (b.innerText || '').trim()
      return t === '+' || t === '加入' || /加\s*入/.test(t)
    })
    if (plus) {
      plus.click()
      return true
    }
    return false
  })
  if (!clicked) break
  await page.waitForTimeout(300)
}
await grab('cust_shop_after_add')

// go to checkout
await clickByPartialText('去结算')
await grab('cust_checkout')

// pay
for (const t of ['立即支付', '假装支付', '假装下单', '确认下单', '确认支付', '支付']) {
  if (await clickByPartialText(t)) {
    await grab(`cust_pay_${t}`)
    break
  }
}

// wait for delivery — snapshot every 3s for 30s
console.log('  · watching delivery animation...')
for (let i = 0; i < 10; i++) {
  await page.waitForTimeout(3000)
  await grab(`cust_delivery_t${(i + 1) * 3}s`)
}

// try click anything to trigger arrival / feedback
for (const t of ['已送达', '送达', '收货', '拆开看看', '再点一次', '评价', '完成']) {
  if (await clickByPartialText(t)) {
    await grab(`cust_after_${t}`)
  }
}

// ============ MERCHANT: OPEN SHOP ============
console.log('\n=== MERCHANT: OPEN SHOP ===')
await goto(BASE)
await clickByPartialText('我是店家')
await grab('merch_entry')

await clickByPartialText('开一家不会真的出餐的小店')
await grab('merch_step1')

// Try filling any inputs
console.log('  · filling merchant form...')
const inputs = await page.$$('input, textarea')
for (let i = 0; i < inputs.length; i++) {
  await inputs[i].fill(`测试店铺${i + 1}`).catch(() => {})
  await page.waitForTimeout(200)
}
await grab('merch_step1_filled')

// click next/save/create
for (const t of ['下一步', '继续', '保存', '开店', '创建', '完成', '确认']) {
  if (await clickByPartialText(t)) {
    await grab(`merch_next_${t}`)
    // continue clicking through
    for (const t2 of ['下一步', '继续', '保存', '开店', '创建', '完成', '确认', '添加菜品', '添加', '上传']) {
      if (await clickByPartialText(t2)) {
        await grab(`merch_next_${t2}`)
      }
    }
    break
  }
}

await writeFile(
  `${OUT}\\_summary.json`,
  JSON.stringify({ captured, apiCalls: [...apiCalls.entries()] }, null, 2),
)

console.log(`\n✓ ${captured.length} pages captured`)
console.log(`✓ API/data calls: ${apiCalls.size}`)
await browser.close()
