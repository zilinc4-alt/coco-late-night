// 种子店铺聚合模块。数据按分类拆分到 shops/ 目录下各文件，
// 此处仅负责汇总和查询。

import { bbq } from './shops/bbq.js'
import { fried } from './shops/fried.js'
import { tea } from './shops/tea.js'
import { dessert } from './shops/dessert.js'
import { malatang } from './shops/malatang.js'
import { burger } from './shops/burger.js'
import { noodle } from './shops/noodle.js'
import { heavy } from './shops/heavy.js'
import { liquor } from './shops/liquor.js'
import { crawfish } from './shops/crawfish.js'

export const SHOPS = [
  ...bbq,
  ...fried,
  ...tea,
  ...dessert,
  ...malatang,
  ...burger,
  ...noodle,
  ...heavy,
  ...liquor,
  ...crawfish,
]

/** 按分类聚合（含"新店"聚合） */
export function shopsByCategory(category) {
  if (category === 'new') {
    return SHOPS.filter((s) => s.isNew)
  }
  return SHOPS.filter((s) => s.category === category)
}

/** 取非当前分类的店铺（跨分类推荐） */
export function otherShops(category) {
  if (category === 'new') return SHOPS.filter((s) => !s.isNew).slice(0, 10)
  return SHOPS.filter((s) => s.category !== category).slice(0, 10)
}

/** 按 slug 查找 */
export function findShop(slug) {
  return SHOPS.find((s) => s.slug === slug)
}
