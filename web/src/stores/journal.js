import { defineStore } from 'pinia'

const STORAGE_KEY = 'coco-journal-v1'
const MAX_ENTRIES = 200

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function save(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {}
}

const CATEGORY_LABELS = {
  bbq: '烧烤',
  fried: '炸鸡',
  tea: '奶茶',
  dessert: '甜品',
  malatang: '麻辣烫',
  burger: '汉堡',
  noodle: '泡面夜宵',
  heavy: '重口味',
  liquor: '深夜小酒',
  new: '新店',
}

export const useJournalStore = defineStore('journal', {
  state: () => ({
    entries: load(),
    // { id, shopName, category, total, qty, createdAt (ms), hour (0-23) }
  }),
  getters: {
    total(state) {
      return state.entries.length
    },
    monthTotal(state) {
      const now = Date.now()
      const monthMs = 30 * 24 * 60 * 60 * 1000
      return state.entries.filter((e) => now - e.createdAt < monthMs).length
    },
    totalMoney(state) {
      return state.entries.reduce((n, e) => n + (e.total || 0), 0)
    },
    totalCalories(state) {
      // 每份菜 200-300 kcal，取中位 250
      return state.entries.reduce((n, e) => n + (e.qty || 0) * 250, 0)
    },
    topCategory(state) {
      if (!state.entries.length) return null
      const counter = {}
      for (const e of state.entries) {
        counter[e.category] = (counter[e.category] || 0) + 1
      }
      let best = null
      let max = 0
      for (const c in counter) {
        if (counter[c] > max) {
          max = counter[c]
          best = c
        }
      }
      return best ? { key: best, label: CATEGORY_LABELS[best] || best, count: max } : null
    },
    topHour(state) {
      if (!state.entries.length) return null
      const counter = new Array(24).fill(0)
      for (const e of state.entries) counter[e.hour || 0]++
      let best = 0
      let max = 0
      for (let i = 0; i < 24; i++) {
        if (counter[i] > max) {
          max = counter[i]
          best = i
        }
      }
      const range = describeHour(best)
      return { hour: best, label: range, count: max }
    },
  },
  actions: {
    add(order, shop) {
      const now = new Date()
      const qty = (order.items || []).reduce((n, i) => n + (i.qty || 0), 0)
      const entry = {
        id: order.id,
        shopName: order.shopName,
        category: shop?.category || 'unknown',
        total: order.total || 0,
        qty,
        createdAt: order.createdAt || Date.now(),
        hour: now.getHours(),
      }
      this.entries.unshift(entry)
      if (this.entries.length > MAX_ENTRIES) {
        this.entries = this.entries.slice(0, MAX_ENTRIES)
      }
      save(this.entries)
    },
    clear() {
      this.entries = []
      save(this.entries)
    },
  },
})

function describeHour(h) {
  if (h >= 0 && h < 5) return '凌晨'
  if (h >= 5 && h < 9) return '清晨'
  if (h >= 9 && h < 12) return '上午'
  if (h >= 12 && h < 14) return '中午'
  if (h >= 14 && h < 18) return '下午'
  if (h >= 18 && h < 21) return '傍晚'
  if (h >= 21 && h < 24) return '深夜'
  return '深夜'
}
