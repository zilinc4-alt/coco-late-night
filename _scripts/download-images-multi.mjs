// 双平台生图脚本（豆包 Ark + 腾讯 TokenHub），按新→旧/好→省 fallback。
//
// 用法：
//   ARK_API_KEY=xxx TOKENHUB_KEY=xxx node _scripts/download-images-multi.mjs
//   ARK_API_KEY=xxx TOKENHUB_KEY=xxx node _scripts/download-images-multi.mjs --force

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
const TOKENHUB_KEY = process.env.TOKENHUB_KEY
const DASHSCOPE_KEY = process.env.DASHSCOPE_KEY
if (!ARK_KEY && !TOKENHUB_KEY && !DASHSCOPE_KEY) {
  console.error('缺少 ARK_API_KEY / TOKENHUB_KEY / DASHSCOPE_KEY 至少一个')
  process.exit(1)
}

const ARK_ENDPOINT = 'https://ark.cn-beijing.volces.com/api/v3/images/generations'
const TH_ENDPOINT = 'https://tokenhub.tencentmaas.com/v1/images/generations'
const DS_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis'
const DS_TASK_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/tasks/'

// 模型 fallback 链：贵→省，新→旧
// ⚠ 阿里云 DashScope (dashscope) 已从链移除 —— wan 2.5 preview 有少量免费额度，wan 2.1 需要充值。默认不启用。
const MODEL_CHAIN = [
  // 腾讯混元
  { id: 'hy-image-v3.0', provider: 'tokenhub', size: '1024x1024' },
  // 豆包
  { id: 'doubao-seedream-5-0-pro-260628', provider: 'ark', size: '2048x2048' },
  { id: 'doubao-seedream-5-0-260128', provider: 'ark', size: '2048x2048' },
  { id: 'doubao-seedream-4-5-251128', provider: 'ark', size: '2048x2048' },
  { id: 'doubao-seedream-4-0-250828', provider: 'ark', size: '1024x1024' },
  // 兜底
  { id: 'hy-image-lite', provider: 'tokenhub', size: '1024x1024' },
]

const CONCURRENCY = 3
const TIMEOUT_MS = 120000
const FORCE = process.argv.includes('--force')
const CUTOFF_ENV = process.env.CUTOFF
const CUTOFF_MS = CUTOFF_ENV ? new Date(CUTOFF_ENV).getTime() : 0
const MIN_BYTES = 6000

let modelStartIdx = 0
const disabledModels = new Set()

// -------- 风格模板池（按分类） --------
const STYLE_POOL = {
  bbq: [
    { angle: '俯拍 45°', bg: '生锈铁盘', light: '篝火橙红光', mood: '烟雾缭绕，炭火余烬', extra: '油亮反光，肉汁滴落' },
    { angle: '正面特写', bg: '油腻烧烤架', light: '暖黄灯泡光', mood: '街头夜市氛围', extra: '孜然辣椒面点缀' },
    { angle: '侧 15° 微距', bg: '烧焦竹签托盘', light: '强对比明暗', mood: '深夜大排档', extra: '一小撮盐花' },
    { angle: '桌面平拍', bg: '牛皮纸垫', light: '琥珀色暖光', mood: '啤酒摊调调', extra: '一根签子随意放置' },
  ],
  fried: [
    { angle: '斜上 30° 特写', bg: '白色瓷盘 + 蜡纸', light: '明亮工作室光', mood: '快餐店感', extra: '面衣颗粒清晰，蒸汽' },
    { angle: '俯拍', bg: '深棕木桌 + 番茄酱杯', light: '柔和顶光', mood: '深夜居家', extra: '洒落的胡椒粉' },
    { angle: '手持视角', bg: '红白格子纸', light: '街头霓虹光', mood: '外卖 vlog 风', extra: '一根还挂着热气' },
    { angle: '低角度英雄拍', bg: '黑色石板', light: '强侧光', mood: '广告级质感', extra: '金黄脆皮微焦' },
  ],
  tea: [
    { angle: '正侧', bg: '大理石台面', light: '柔和日光', mood: '茶饮店 ins 风', extra: '透明杯壁清晰，冰块折射' },
    { angle: '45° 俯拍', bg: '奶油色亚麻布', light: '晨光散射', mood: '少女心治愈', extra: '珍珠沉底可见' },
    { angle: '手托杯特写', bg: '模糊街景 bokeh', light: '午后柔光', mood: '奶茶店门口', extra: '杯身水珠凝结' },
    { angle: '正面对称', bg: '浅粉背景纸', light: '扁平软光', mood: '产品拍摄', extra: '插了一根粉色吸管' },
  ],
  dessert: [
    { angle: '俯拍', bg: '哑光黑色石板', light: '低角度侧光', mood: '高级西点店', extra: '糖粉薄薄一层' },
    { angle: '侧 20° 特写', bg: '木质切板', light: '窗边自然光', mood: '手作烘焙感', extra: '一叉切开露出内芯' },
    { angle: '手托盘', bg: '奶白桌布', light: '暖色台灯光', mood: '深夜咖啡馆', extra: '一小勺鲜奶油' },
    { angle: '正面切面', bg: '牛皮纸', light: '柔漫射光', mood: '文艺杂志封面', extra: '一片薄荷叶点缀' },
  ],
  malatang: [
    { angle: '俯拍', bg: '不锈钢大碗', light: '强顶光', mood: '街边麻辣烫店', extra: '汤面浮油发亮，红辣椒漂浮' },
    { angle: '45° 微距', bg: '木质大排档桌', light: '暖橙灯管', mood: '烟雾升腾', extra: '筷子夹起一撮，热气腾腾' },
    { angle: '正面特写', bg: '搪瓷花碗', light: '暖色射灯', mood: '怀旧食堂感', extra: '汤汁溅出碗边' },
    { angle: '斜俯拍', bg: '铁皮桌+塑料椅', light: '冷暖对比光', mood: '深夜路边摊', extra: '芝麻酱与葱花点缀' },
  ],
  burger: [
    { angle: '英雄拍 侧 15°', bg: '牛皮纸垫', light: '广告棚灯', mood: '美式快餐广告', extra: '肉饼汁水外溢，芝士拉丝' },
    { angle: '俯拍', bg: '深色石板 + 薯条', light: '强顶光', mood: '深夜快餐店', extra: '芝麻粒清晰' },
    { angle: '手持视角', bg: '模糊城市夜景', light: '霓虹倒影', mood: '街头 vlog', extra: '一半咬痕' },
    { angle: '切面剖视', bg: '白色瓷盘', light: '柔光箱', mood: '菜单摄影', extra: '层次分明' },
  ],
  noodle: [
    { angle: '俯拍', bg: '搪瓷碗 + 一次性桌布', light: '暖黄灯泡', mood: '深夜被窝', extra: '筷子挑起，蒸汽升腾' },
    { angle: '45° 特写', bg: '木质小方桌', light: '柔漫射光', mood: '家的温度', extra: '溏心蛋切开流心' },
    { angle: '侧俯', bg: '暗调桌面', light: '侧上聚光', mood: '深夜档感', extra: '汤面油光，红辣椒油' },
    { angle: '手持碗视角', bg: '模糊床头', light: '床头灯暖光', mood: '一个人吃', extra: '眼镜片起雾感' },
  ],
  heavy: [
    { angle: '俯拍', bg: '生锈铁盘', light: '强对比明暗', mood: '江湖菜馆', extra: '红油翻滚，花椒漂浮' },
    { angle: '45° 微距', bg: '粗糙木桌', light: '暖橙背光', mood: '重庆夜市', extra: '干辣椒堆叠' },
    { angle: '正面特写', bg: '搪瓷碗 + 竹筷', light: '强光高饱和', mood: '街头小吃', extra: '油光锃亮' },
    { angle: '斜上拍', bg: '青花瓷盘', light: '暖色氛围', mood: '大排档', extra: '一小撮香菜' },
  ],
  liquor: [
    { angle: '侧 20°', bg: '模糊酒吧背景 bokeh', light: '琥珀色射灯', mood: '深夜酒吧', extra: '冰球融化，杯壁凝水' },
    { angle: '俯拍', bg: '实木吧台', light: '暖黄壁灯', mood: '孤独感', extra: '一杯 + 一支香烟未点' },
    { angle: '正面特写', bg: '砖墙纹理', light: '侧逆光轮廓', mood: '爵士酒馆', extra: '柠檬皮螺旋装饰' },
    { angle: '手持视角', bg: '模糊夜景', light: '冷暖霓虹反射', mood: '一个人的夜', extra: '杯口气泡' },
  ],
  default: [
    { angle: '45° 特写', bg: '深色木桌', light: '暖橙打光', mood: '深夜食堂氛围', extra: '蒸汽感' },
  ],
}

function buildPrompt(kw, chineseName, category, lock) {
  const clean = kw.replace(/[,-]/g, ' ')
  const pool = STYLE_POOL[category] || STYLE_POOL.default
  const style = pool[Number(lock) % pool.length]
  const namePart = chineseName ? `，${chineseName}` : ''
  return (
    `${clean}${namePart}，美食摄影，` +
    `构图：${style.angle}；` +
    `背景：${style.bg}；` +
    `灯光：${style.light}；` +
    `氛围：${style.mood}；` +
    `细节：${style.extra}；` +
    `逼真质感，无文字水印`
  )
}

// -------- 解析 shops.js --------
const src = await readFile(SHOPS_FILE, 'utf8')
const shopBlocks = src.split(/\{\s*slug:/).slice(1)
const tasks = []
const seen = new Set()
for (const block of shopBlocks) {
  const cat = (block.match(/category:\s*'([^']+)'/) || [, 'default'])[1]
  const shopImg = block.match(/^\s*[\s\S]*?image:\s*img\(\s*'([^']+)'\s*,\s*(\d+)\s*\)/)
  if (shopImg && !seen.has(shopImg[2])) {
    seen.add(shopImg[2])
    tasks.push({ chineseName: '', kw: shopImg[1], lock: shopImg[2], category: cat })
  }
  const dishRe = /name:\s*'([^']+)'[^{}]*?image:\s*img\(\s*'([^']+)'\s*,\s*(\d+)\s*\)/g
  let dm
  while ((dm = dishRe.exec(block))) {
    if (seen.has(dm[3])) continue
    seen.add(dm[3])
    tasks.push({ chineseName: dm[1], kw: dm[2], lock: dm[3], category: cat })
  }
}

console.log(`[extract] ${tasks.length} unique images`)
console.log(`[chain] ${MODEL_CHAIN.length} models:`)
for (const s of MODEL_CHAIN) console.log(`  - [${s.provider}] ${s.id} (${s.size})`)
await mkdir(OUT_DIR, { recursive: true })

let done = 0, ok = 0, skip = 0, fail = 0
const failures = []

// 混元 hy-image 有 1 个并发上限：每个 provider 分配一个"信号量"，同时只能有一个 tokenhub 请求
// 用 Promise chain 实现串行锁
let tokenhubLock = Promise.resolve()
function withTokenhubLock(fn) {
  const prev = tokenhubLock
  tokenhubLock = prev.then(() => fn(), () => fn())
  return tokenhubLock
}

async function callArk(model, prompt, seed, size) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(ARK_ENDPOINT, {
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

async function callTokenhub(model, prompt, size) {
  return withTokenhubLock(async () => {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(TH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKENHUB_KEY}` },
        body: JSON.stringify({ model, prompt, size }),
        signal: controller.signal,
      })
      const txt = await res.text()
      if (!res.ok) return { error: { status: res.status, body: txt } }
      const data = JSON.parse(txt)
      // 检查是否是 error 结构
      if (data?.error) return { error: { status: 200, body: txt } }
      const url = data?.data?.[0]?.url
      if (!url) return { error: { status: 0, body: txt.slice(0, 200) } }
      return { url }
    } finally {
      clearTimeout(t)
    }
  })
}

async function callDashscope(model, prompt, size) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(DS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DASHSCOPE_KEY}`,
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({ model, input: { prompt }, parameters: { size, n: 1 } }),
      signal: controller.signal,
    })
    const txt = await res.text()
    if (!res.ok) return { error: { status: res.status, body: txt } }
    const data = JSON.parse(txt)
    if (data?.code) return { error: { status: 200, body: txt } }
    const taskId = data?.output?.task_id
    if (!taskId) return { error: { status: 0, body: txt.slice(0, 200) } }
    const pollStart = Date.now()
    while (Date.now() - pollStart < 60000) {
      await new Promise((r) => setTimeout(r, 3000))
      const pres = await fetch(DS_TASK_ENDPOINT + taskId, {
        headers: { Authorization: `Bearer ${DASHSCOPE_KEY}` },
      })
      const ptxt = await pres.text()
      if (!pres.ok) return { error: { status: pres.status, body: ptxt } }
      const pdata = JSON.parse(ptxt)
      const st = pdata?.output?.task_status
      if (st === 'SUCCEEDED') {
        const url = pdata?.output?.results?.[0]?.url
        if (!url) return { error: { status: 0, body: 'no url in result' } }
        return { url }
      }
      if (st === 'FAILED' || st === 'CANCELED') {
        return { error: { status: 0, body: JSON.stringify(pdata?.output || {}).slice(0, 200) } }
      }
    }
    return { error: { status: 0, body: 'poll timeout' } }
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
    lc.includes('balance') || lc.includes('safe experience mode') || lc.includes('inference limit') ||
    lc.includes('not_authorized') || lc.includes('invalid_api_key') ||
    lc.includes('trial quota') || lc.includes('quota has been exhausted') ||
    lc.includes('quota exhausted') || lc.includes('exhausted') ||
    lc.includes('免费额度') || lc.includes('额度已用') || lc.includes('余额不足')
  )
}

// 判断是不是"暂时的并发/限流错误"（不应禁用模型，稍后重试即可）
function isTransientError(status, body) {
  const lc = (body || '').toLowerCase()
  return (
    lc.includes('已达到') && lc.includes('任务上限') ||
    lc.includes('code:1002') ||
    lc.includes('concurrent') ||
    lc.includes('too many') ||
    (status === 429)
  )
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function processOne({ kw, lock, chineseName, category }) {
  const outPath = path.join(OUT_DIR, `${lock}.webp`)
  if (!FORCE && existsSync(outPath)) {
    try {
      const st = await stat(outPath)
      // 如果设了 CUTOFF：只跳过 mtime >= CUTOFF 的图（即已经是新图）
      // 否则：只要文件大于 MIN_BYTES 就跳过
      if (st.size > MIN_BYTES && (!CUTOFF_MS || st.mtimeMs >= CUTOFF_MS)) {
        skip++
        done++
        return
      }
    } catch {}
  }
  const prompt = buildPrompt(kw, chineseName, category, lock)
  const seed = Number(lock) || 100

  let lastErr = null
  for (let i = modelStartIdx; i < MODEL_CHAIN.length; i++) {
    const spec = MODEL_CHAIN[i]
    if (disabledModels.has(spec.id)) continue
    if (spec.provider === 'ark' && !ARK_KEY) continue
    if (spec.provider === 'tokenhub' && !TOKENHUB_KEY) continue
    if (spec.provider === 'dashscope' && !DASHSCOPE_KEY) continue

    const r = spec.provider === 'ark'
      ? await callArk(spec.id, prompt, seed, spec.size)
      : spec.provider === 'tokenhub'
        ? await callTokenhub(spec.id, prompt, spec.size)
        : await callDashscope(spec.id, prompt, spec.size)

    if (r.url) {
      try {
        const buf = await downloadUrl(r.url)
        const webp = await sharp(buf).resize(400, 400, { fit: 'cover' }).webp({ quality: 78 }).toBuffer()
        await writeFile(outPath, webp)
        ok++
        done++
        if (done % 5 === 0 || done === tasks.length) {
          console.log(`[progress] ${done}/${tasks.length}  ok=${ok} skip=${skip} fail=${fail}  [${spec.provider}/${spec.id}]`)
        }
        return
      } catch (e) {
        lastErr = e
        break
      }
    }
    lastErr = new Error(`${spec.id}: ${r.error.status} ${(r.error.body || '').slice(0, 140)}`)
    // 暂时错误（并发上限/限流）：等待再重试同一个模型，不 disable
    if (isTransientError(r.error.status, r.error.body)) {
      await sleep(1500)
      i-- // 停留在同一个模型
      continue
    }
    if (isQuotaOrPermError(r.error.status, r.error.body)) {
      if (!disabledModels.has(spec.id)) {
        disabledModels.add(spec.id)
        console.log(`  ⚠ [${spec.provider}] ${spec.id} 用完/无权限，切下一个`)
        if (i === modelStartIdx) modelStartIdx = i + 1
      }
      continue
    }
    console.log(`  ⚠ [${spec.provider}] ${spec.id} 参数错，尝试下一个（${(r.error.body || '').slice(0, 80)}）`)
    continue
  }
  fail++
  failures.push({ kw, lock, err: lastErr?.message || 'unknown' })
  done++
  if (done % 5 === 0 || done === tasks.length) {
    console.log(`[progress] ${done}/${tasks.length}  ok=${ok} skip=${skip} fail=${fail}`)
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

console.log(`[start] downloading ${tasks.length} images (concurrency=${CONCURRENCY})`)
const t0 = Date.now()
await runPool(tasks, CONCURRENCY, processOne)
console.log(`[done] ok=${ok} skip=${skip} fail=${fail}  ${((Date.now() - t0) / 1000).toFixed(1)}s`)
if (disabledModels.size) console.log(`[models disabled] ${[...disabledModels].join(', ')}`)
if (failures.length) {
  console.log('\n[failures]')
  for (const f of failures.slice(0, 30)) console.log(`  ${f.lock} (${f.kw}): ${f.err}`)
  if (failures.length > 30) console.log(`  ... ${failures.length - 30} more`)
}
