// 只重跑指定时间之前的图（视为需要重生成）
// 用法：ARK_API_KEY=xxx CUTOFF="2026-07-13 15:20:00" node _scripts/regen-old-images.mjs

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SHOPS_FILE = path.join(ROOT, 'web', 'src', 'data', 'shops.js')
const OUT_DIR = path.join(ROOT, 'web', 'public', 'dishes')

const sharpPath = path.join(ROOT, 'web', 'node_modules', 'sharp', 'dist', 'index.mjs')
const { default: sharp } = await import(pathToFileURL(sharpPath).href)

const ARK_KEY = process.env.ARK_API_KEY
if (!ARK_KEY) {
  console.error('缺少 ARK_API_KEY')
  process.exit(1)
}
const CUTOFF_MS = new Date(process.env.CUTOFF || '2026-07-13 15:20:00').getTime()

const MODEL_CHAIN = [
  { id: 'doubao-seedream-5-0-pro-260628', size: '2048x2048' },
  { id: 'doubao-seedream-5-0-260128', size: '2048x2048' },
  { id: 'doubao-seedream-4-5-251128', size: '2048x2048' },
  { id: 'doubao-seedream-4-0-250828', size: '1024x1024' },
]
const ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
const CONCURRENCY = 3
const TIMEOUT_MS = 90000

let modelStartIdx = 0
const disabledModels = new Set()

function buildPrompt(kw, chineseName) {
  const clean = kw.replace(/[,-]/g, ' ')
  const namePart = chineseName ? `，${chineseName}` : ''
  return `${clean}${namePart}，深夜食堂氛围的美食摄影，深色木质桌面背景，暖色调打光，蒸汽感，食物特写，逼真质感，无文字水印`
}

const src = await readFile(SHOPS_FILE, 'utf8')
const dishRe = /name:\s*'([^']+)'[^{}]*?image:\s*img\(\s*'([^']+)'\s*,\s*(\d+)\s*\)/g
const shopImageRe = /image:\s*img\(\s*'([^']+)'\s*,\s*(\d+)\s*\)/g

const all = []
const seen = new Set()
let m
while ((m = dishRe.exec(src))) {
  if (seen.has(m[3])) continue
  seen.add(m[3])
  all.push({ chineseName: m[1], kw: m[2], lock: m[3] })
}
while ((m = shopImageRe.exec(src))) {
  if (seen.has(m[2])) continue
  seen.add(m[2])
  all.push({ chineseName: '', kw: m[1], lock: m[2] })
}

// 过滤出需要重生成的：不存在 or mtime < CUTOFF
const tasks = []
for (const t of all) {
  const p = path.join(OUT_DIR, `${t.lock}.webp`)
  if (!existsSync(p)) {
    tasks.push(t)
    continue
  }
  try {
    const st = await stat(p)
    if (st.mtimeMs < CUTOFF_MS) tasks.push(t)
  } catch {
    tasks.push(t)
  }
}

console.log(`[extract] total=${all.length}, need regen=${tasks.length} (cutoff=${new Date(CUTOFF_MS).toISOString()})`)
console.log(`[chain]`)
for (const s of MODEL_CHAIN) console.log(`  - ${s.id} (${s.size})`)

if (tasks.length === 0) {
  console.log('[done] nothing to do')
  process.exit(0)
}

await mkdir(OUT_DIR, { recursive: true })

let done = 0, ok = 0, fail = 0
const failures = []

async function callArk(model, prompt, seed, size) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ARK_KEY}` },
      body: JSON.stringify({ model, prompt, size, seed, response_format: 'url', watermark: false }),
      signal: controller.signal,
    })
    const txt = await res.text()
    if (!res.ok) return { error: { status: res.status, body: txt } }
    const data = JSON.parse(txt)
    const url = data?.data?.[0]?.url
    if (!url) return { error: { status: 0, body: 'no url' } }
    return { url }
  } finally {
    clearTimeout(t)
  }
}

async function downloadUrl(url) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    if (!res.ok) throw new Error(`download http ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 3000) throw new Error('too small')
    return buf
  } finally {
    clearTimeout(t)
  }
}

function isQuotaOrPermError(status, body) {
  if (status === 401 || status === 403 || status === 404) return true
  const lc = (body || '').toLowerCase()
  return (
    lc.includes('quotaexceeded') || lc.includes('setlimitexceeded') ||
    (lc.includes('rate') && lc.includes('exceed')) ||
    lc.includes('permission') || (lc.includes('access') && lc.includes('deny')) ||
    lc.includes('endpointormodel.notfound') || lc.includes('insufficient') ||
    lc.includes('balance') || lc.includes('safe experience mode') || lc.includes('inference limit')
  )
}

async function processOne({ kw, lock, chineseName }) {
  const outPath = path.join(OUT_DIR, `${lock}.webp`)
  const prompt = buildPrompt(kw, chineseName)
  const seed = Number(lock) || 100

  let lastErr = null
  for (let i = modelStartIdx; i < MODEL_CHAIN.length; i++) {
    const spec = MODEL_CHAIN[i]
    if (disabledModels.has(spec.id)) continue
    const r = await callArk(spec.id, prompt, seed, spec.size)
    if (r.url) {
      try {
        const buf = await downloadUrl(r.url)
        const webp = await sharp(buf).resize(400, 400, { fit: 'cover' }).webp({ quality: 78 }).toBuffer()
        await writeFile(outPath, webp)
        ok++
        done++
        if (done % 5 === 0 || done === tasks.length) {
          console.log(`[progress] ${done}/${tasks.length}  ok=${ok} fail=${fail}  [model=${spec.id}]`)
        }
        return
      } catch (e) {
        lastErr = e
        break
      }
    }
    lastErr = new Error(`${spec.id}: ${r.error.status} ${(r.error.body || '').slice(0, 140)}`)
    if (isQuotaOrPermError(r.error.status, r.error.body)) {
      if (!disabledModels.has(spec.id)) {
        disabledModels.add(spec.id)
        console.log(`  ⚠ ${spec.id} 用完/无权限，切下一个`)
        if (i === modelStartIdx) modelStartIdx = i + 1
      }
      continue
    }
    // InvalidParameter 等：换下个模型试
    console.log(`  ⚠ ${spec.id} 参数错，尝试下一个（${(r.error.body || '').slice(0, 80)}）`)
    continue
  }
  fail++
  failures.push({ kw, lock, err: lastErr?.message || 'unknown' })
  done++
  if (done % 5 === 0 || done === tasks.length) {
    console.log(`[progress] ${done}/${tasks.length}  ok=${ok} fail=${fail}`)
  }
}

async function runPool(items, limit, fn) {
  let i = 0
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++
      await fn(items[idx])
    }
  })
  await Promise.all(workers)
}

console.log(`[start] regenerating ${tasks.length} old images (concurrency=${CONCURRENCY})`)
const t0 = Date.now()
await runPool(tasks, CONCURRENCY, processOne)
console.log(`[done] ok=${ok} fail=${fail}  ${((Date.now() - t0) / 1000).toFixed(1)}s`)
if (disabledModels.size) console.log(`[models disabled] ${[...disabledModels].join(', ')}`)
if (failures.length) {
  console.log('\n[failures]')
  for (const f of failures.slice(0, 30)) console.log(`  ${f.lock} (${f.kw}): ${f.err}`)
  if (failures.length > 30) console.log(`  ... ${failures.length - 30} more`)
}
