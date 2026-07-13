// 多轮智能重试脚本：扫描 web/public/dishes/ 里的图，
// 找出"图小到一定阈值以下 = 疑似失败 or 老兜底图" 的 lock，
// 用 pollinations.ai 重生成。多轮策略，每轮换更简单关键词。
//
// 用法：
//   node _scripts/retry-images.mjs
//   node _scripts/retry-images.mjs --only-missing   只重试完全不存在的
//   node _scripts/retry-images.mjs --min-bytes=6000

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

const args = process.argv.slice(2)
const ONLY_MISSING = args.includes('--only-missing')
const MIN_BYTES = Number((args.find((a) => a.startsWith('--min-bytes=')) || '=6000').split('=')[1]) || 6000

const TIMEOUT_MS = 90000
const DELAY_MS = 700
const COOLDOWN_MS = 30000
const MAX_ROUNDS = 5

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const src = await readFile(SHOPS_FILE, 'utf8')
const urlRe = /img\(\s*'([^']+)'\s*,\s*(\d+)\s*\)/g
const all = []
const seen = new Set()
let m
while ((m = urlRe.exec(src))) {
  const kw = m[1]
  const lock = m[2]
  if (seen.has(lock)) continue
  seen.add(lock)
  all.push({ kw, lock })
}

// filter to what needs retry
const toRetry = []
for (const t of all) {
  const outPath = path.join(OUT_DIR, `${t.lock}.webp`)
  if (!existsSync(outPath)) {
    toRetry.push(t)
    continue
  }
  if (ONLY_MISSING) continue
  try {
    const st = await stat(outPath)
    if (st.size < MIN_BYTES) toRetry.push(t)
  } catch {
    toRetry.push(t)
  }
}

console.log(`[extract] total=${all.length}, need retry=${toRetry.length} (threshold=${MIN_BYTES} bytes, only-missing=${ONLY_MISSING})`)
if (toRetry.length === 0) {
  console.log('[done] nothing to retry')
  process.exit(0)
}

await mkdir(OUT_DIR, { recursive: true })

function buildPrompt(kw) {
  const clean = kw.replace(/[,-]/g, ' ')
  return `${clean}, close up food photography, dark restaurant table background, appetizing, professional, no text`
}

// 逐轮化简 keyword：完整 → 3 词 → 2 词 → 1 词 → 兜底 food
function simplifyKeyword(kw, round) {
  const tokens = kw.replace(/,/g, '-').split('-').filter(Boolean)
  if (round === 0) return kw
  if (round === 1) return tokens.slice(-3).join(' ')
  if (round === 2) return tokens.slice(-2).join(' ')
  if (round === 3) return tokens[tokens.length - 1] || 'food'
  return 'delicious food dish'
}

async function tryOne(kw, lock) {
  const prompt = buildPrompt(kw)
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=400&nologo=true&seed=${lock}`
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    if (!res.ok) throw new Error(`http ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 3000) throw new Error('too small')
    const webp = await sharp(buf).resize(400, 400, { fit: 'cover' }).webp({ quality: 75 }).toBuffer()
    await writeFile(path.join(OUT_DIR, `${lock}.webp`), webp)
    return true
  } catch {
    return false
  } finally {
    clearTimeout(t)
  }
}

let remaining = [...toRetry]
for (let r = 0; r < MAX_ROUNDS && remaining.length > 0; r++) {
  console.log(`\n[round ${r + 1}/${MAX_ROUNDS}] retrying ${remaining.length} items (strategy ${r})`)
  const stillFailing = []
  let idx = 0
  for (const item of remaining) {
    idx++
    const kw = simplifyKeyword(item.kw, r)
    const ok = await tryOne(kw, item.lock)
    if (!ok) stillFailing.push(item)
    if (idx % 5 === 0) {
      console.log(`  ${idx}/${remaining.length}  still-failing=${stillFailing.length}`)
    }
    await sleep(DELAY_MS)
  }
  console.log(`[round ${r + 1}] done, ok=${remaining.length - stillFailing.length}, still-failing=${stillFailing.length}`)
  remaining = stillFailing
  if (remaining.length > 0 && r < MAX_ROUNDS - 1) {
    console.log(`[round ${r + 1}] cooling down ${COOLDOWN_MS / 1000}s...`)
    await sleep(COOLDOWN_MS)
  }
}

console.log(`\n[final] ${remaining.length} still failing after ${MAX_ROUNDS} rounds`)
for (const f of remaining) console.log(`  ${f.lock}: ${f.kw}`)
