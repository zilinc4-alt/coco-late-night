// 修补 shops.js 里下载失败的图片 lock/关键词。
// 用法：node _scripts/patch-shops.mjs
// 效果：把失败的 (kw, lock) 替换成新组合，然后可以重新跑 download-images.mjs。

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SHOPS_FILE = path.join(ROOT, 'web', 'src', 'data', 'shops.js')

// 老 lock → { newLock, newKw }
const PATCH = {
  // 重口味
  312: { newLock: 512, newKw: 'braised-food' },
  313: { newLock: 513, newKw: 'duck-neck' },
  315: { newLock: 515, newKw: 'shrimp-dish' },
  316: { newLock: 516, newKw: 'sichuan-chili' },
  317: { newLock: 517, newKw: 'chinese-noodles' },
  318: { newLock: 518, newKw: 'spicy-noodles' },
  // 泰式
  140: { newLock: 540, newKw: 'asian-rice' },
  331: { newLock: 531, newKw: 'seafood-rice' },
  332: { newLock: 532, newKw: 'thai-soup' },
  333: { newLock: 533, newKw: 'curry-chicken' },
  334: { newLock: 534, newKw: 'coconut-drink' },
  335: { newLock: 535, newKw: 'iced-tea' },
  // 孤独啤酒角
  401: { newLock: 501, newKw: 'pub-interior' },
  411: { newLock: 611, newKw: 'beer-bottle' },
  412: { newLock: 612, newKw: 'craft-beer' },
  413: { newLock: 613, newKw: 'wheat-beer' },
  414: { newLock: 614, newKw: 'beer-can' },
  415: { newLock: 615, newKw: 'cold-beer-glass' },
  416: { newLock: 616, newKw: 'beer-lime-slice' },
  417: { newLock: 617, newKw: 'peanuts' },
  418: { newLock: 618, newKw: 'green-edamame' },
  419: { newLock: 619, newKw: 'dried-food-snack' },
  420: { newLock: 620, newKw: 'pork-dish' },
  421: { newLock: 621, newKw: 'fried-snack' },
  422: { newLock: 622, newKw: 'ginger-tea' },
  // 前任红酒馆
  402: { newLock: 502, newKw: 'wine-bar-interior' },
  431: { newLock: 631, newKw: 'red-wine' },
  432: { newLock: 632, newKw: 'wine-glass' },
  433: { newLock: 633, newKw: 'white-wine' },
  434: { newLock: 634, newKw: 'whisky' },
  435: { newLock: 635, newKw: 'whisky-ice' },
  436: { newLock: 636, newKw: 'orange-cocktail' },
  437: { newLock: 637, newKw: 'mint-cocktail' },
  438: { newLock: 638, newKw: 'ham-slice' },
  439: { newLock: 639, newKw: 'salmon-slice' },
  440: { newLock: 640, newKw: 'mushroom-dish' },
  // 今晚不醉小酒馆
  403: { newLock: 503, newKw: 'japanese-food' },
  451: { newLock: 651, newKw: 'sake-cup' },
  452: { newLock: 652, newKw: 'sake-bottle' },
  453: { newLock: 653, newKw: 'plum-wine' },
  454: { newLock: 654, newKw: 'japanese-beer' },
  455: { newLock: 655, newKw: 'draft-beer' },
  456: { newLock: 656, newKw: 'grilled-fish' },
  457: { newLock: 657, newKw: 'yakitori' },
  458: { newLock: 658, newKw: 'japanese-omelette' },
  459: { newLock: 659, newKw: 'japanese-snack' },
  460: { newLock: 660, newKw: 'japanese-drink' },
}

let src = await readFile(SHOPS_FILE, 'utf8')
let count = 0

// 匹配形如 img('keyword', 123) —— 关键词允许含 , 空格 - 等
src = src.replace(/img\(\s*'([^']+)'\s*,\s*(\d+)\s*\)/g, (m, kw, lockStr) => {
  const lock = Number(lockStr)
  const p = PATCH[lock]
  if (!p) return m
  count++
  return `img('${p.newKw}', ${p.newLock})`
})

await writeFile(SHOPS_FILE, src)
console.log(`[patched] ${count} img() calls updated in shops.js`)
console.log(`\n下一步：node _scripts/retry-images.mjs`)
