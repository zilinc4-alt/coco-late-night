// 只重试尚未下载的图。慢速：并发 1，每张间隔 2 秒。
// 用法：node _scripts/retry-images.mjs

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

const TIMEOUT_MS = 20000
const DELAY_MS = 2200

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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

// filter to only missing
const missing = []
for (const t of tasks) {
  const out = path.join(OUT_DIR, `${t.lock}.webp`)
  if (existsSync(out)) {
    const st = await stat(out)
    if (st.size > 500) continue
  }
  missing.push(t)
}
console.log(`[extract] total=${tasks.length}, missing=${missing.length}`)

await mkdir(OUT_DIR, { recursive: true })

let ok = 0
let fail = 0
const failures = []

for (let i = 0; i < missing.length; i++) {
  const { kw, lock } = missing[i]
  const outPath = path.join(OUT_DIR, `${lock}.webp`)
  const url = `https://loremflickr.com/400/400/${encodeURIComponent(kw)}?lock=${lock}`
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    clearTimeout(t)
    if (!res.ok) throw new Error(`http ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length < 500) throw new Error('too small')
    const webp = await sharp(buf).resize(400, 400, { fit: 'cover' }).webp({ quality: 75 }).toBuffer()
    await writeFile(outPath, webp)
    ok++
    console.log(`  [${i + 1}/${missing.length}] OK  ${lock}.webp (${kw})`)
  } catch (e) {
    fail++
    failures.push({ kw, lock, err: e.message })
    console.log(`  [${i + 1}/${missing.length}] FAIL ${lock} (${kw}): ${e.message}`)
  }
  if (i < missing.length - 1) await sleep(DELAY_MS)
}

console.log(`\n[done] ok=${ok} fail=${fail}`)
if (failures.length) {
  console.log('\n[remaining failures]')
  for (const f of failures) console.log(`  ${f.lock} (${f.kw}): ${f.err}`)
}
