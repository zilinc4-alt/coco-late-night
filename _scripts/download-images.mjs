// 从 web/src/data/shops.js 提取所有图片 URL，
// 下载 → sharp 压 WebP 400×400 → 保存到 web/public/dishes/{lock}.webp
//
// 用法：
//   node _scripts/download-images.mjs
//   node _scripts/download-images.mjs --force  # 覆盖已存在的图
//
// 依赖：sharp（已装在 web/node_modules）

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SHOPS_FILE = path.join(ROOT, 'web', 'src', 'data', 'shops.js')
const OUT_DIR = path.join(ROOT, 'web', 'public', 'dishes')

// sharp 装在 web/ 下
const sharpPath = path.join(ROOT, 'web', 'node_modules', 'sharp', 'dist', 'index.mjs')
const { default: sharp } = await import(pathToFileURL(sharpPath).href)

const CONCURRENCY = 6
const TIMEOUT_MS = 20000
const FORCE = process.argv.includes('--force')

// ---------- 提取所有 (lock, keyword) ----------
const src = await readFile(SHOPS_FILE, 'utf8')
const urlRe = /img\(\s*'([^']+)'\s*,\s*(\d+)\s*\)/g
const tasks = []
const seen = new Set()
let m
while ((m = urlRe.exec(src))) {
  const kw = m[1]
  const lock = m[2]
  if (seen.has(lock)) continue
  seen.add(lock)
  tasks.push({ kw, lock })
}
console.log(`[extract] ${tasks.length} unique images from shops.js`)

await mkdir(OUT_DIR, { recursive: true })

// ---------- 并发下载 + 压缩 ----------
let done = 0
let ok = 0
let skip = 0
let fail = 0
const failures = []

async function processOne({ kw, lock }) {
  const outPath = path.join(OUT_DIR, `${lock}.webp`)
  if (!FORCE && existsSync(outPath)) {
    const st = await stat(outPath)
    if (st.size > 0) {
      skip++
      done++
      return
    }
  }
  const url = `https://loremflickr.com/400/400/${encodeURIComponent(kw)}?lock=${lock}`
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    clearTimeout(t)
    if (!res.ok) throw new Error(`http ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 500) throw new Error('too small')
    const webp = await sharp(buf)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 75 })
      .toBuffer()
    await writeFile(outPath, webp)
    ok++
  } catch (e) {
    fail++
    failures.push({ kw, lock, err: e.message })
  } finally {
    done++
    if (done % 10 === 0 || done === tasks.length) {
      console.log(`[progress] ${done}/${tasks.length}  ok=${ok} skip=${skip} fail=${fail}`)
    }
  }
}

// simple concurrency pool
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

console.log(`[start] downloading ${tasks.length} images (concurrency=${CONCURRENCY})`)
const t0 = Date.now()
await runPool(tasks, CONCURRENCY, processOne)
console.log(`[done] ok=${ok} skip=${skip} fail=${fail}  ${(Date.now() - t0) / 1000}s`)
if (failures.length) {
  console.log('\n[failures]')
  for (const f of failures) console.log(`  ${f.lock} (${f.kw}): ${f.err}`)
  console.log('\n提示：失败的图 Cover 组件会自动兜底 emoji，可稍后再跑 --force 重试。')
}
