import { defineStore } from 'pinia'

const LS_KEY = 'ddj_merchant_shops'

// 生成 NIGHT-ABC123 风格口令
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `NIGHT-${s}`
}

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}
function saveAll(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list))
}

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    activeCode: null, // 当前登录/活跃的店铺口令
    shops: loadAll(), // [{ code, name, category, desc, cover, createdAt, dishes:[] }]
    stats: {}, // { code: { visits, orders, virtualIncome, cravedCount } }
  }),
  getters: {
    activeShop(state) {
      return state.shops.find((s) => s.code === state.activeCode) || null
    },
    activeStats(state) {
      return (
        state.stats[state.activeCode] || {
          visits: 0,
          orders: 0,
          virtualIncome: 0,
          cravedCount: 0,
        }
      )
    },
  },
  actions: {
    createShop({ name, category, desc, cover }) {
      const code = generateCode()
      const shop = {
        code,
        name,
        category,
        desc,
        cover: cover || null,
        createdAt: Date.now(),
        dishes: [],
      }
      this.shops.push(shop)
      saveAll(this.shops)
      this.activeCode = code
      return shop
    },
    updateShop(patch) {
      const s = this.activeShop
      if (!s) return
      Object.assign(s, patch)
      saveAll(this.shops)
    },
    addDish(dish) {
      const s = this.activeShop
      if (!s) return
      s.dishes.push({
        name: dish.name,
        desc: dish.desc,
        price: Number(dish.price) || 0,
        calories: dish.calories ? Number(dish.calories) : null,
        subCategory: dish.subCategory || '招牌',
        image: dish.image || null,
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      })
      saveAll(this.shops)
    },
    findByCode(code) {
      return this.shops.find((s) => s.code === code.toUpperCase()) || null
    },
    loginByCode(code) {
      const s = this.findByCode(code)
      if (s) {
        this.activeCode = s.code
        return true
      }
      return false
    },
    logout() {
      this.activeCode = null
    },
  },
})
