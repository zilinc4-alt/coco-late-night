import { defineStore } from 'pinia'
import { RIDER_NAMES, ADDRESSES, COUPON_NAME, ORDER_REMARK } from '../data/meta.js'

function randomOrderId() {
  return String(Math.floor(10000 + Math.random() * 90000))
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const useOrderStore = defineStore('order', {
  state: () => ({
    current: null,
    // { id, shopName, items:[{name,qty,price}], total, address, coupon, remark,
    //   etaSeconds, elapsedSeconds, riderName, createdAt }
  }),
  getters: {
    remainingSeconds(state) {
      if (!state.current) return 0
      return Math.max(0, state.current.etaSeconds - state.current.elapsedSeconds)
    },
    progressPct(state) {
      if (!state.current) return 0
      return Math.min(
        99,
        Math.floor((state.current.elapsedSeconds / state.current.etaSeconds) * 100),
      )
    },
    savedMoney(state) {
      return state.current ? state.current.total : 0
    },
    savedCalories(state) {
      // 一口一口估算：每份菜大约 200-300 kcal
      if (!state.current) return [0, 0]
      const qty = state.current.items.reduce((n, i) => n + i.qty, 0)
      return [qty * 200, qty * 300]
    },
  },
  actions: {
    createFrom(shop, items, addressIdx = 0) {
      const total = items.reduce((n, i) => n + i.qty * i.price, 0)
      const etaMin = Math.floor(Math.random() * 8) + 12 // 12-20 min
      this.current = {
        id: randomOrderId(),
        shopName: shop.name,
        items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
        total,
        address: ADDRESSES[addressIdx] || ADDRESSES[0],
        coupon: COUPON_NAME,
        remark: ORDER_REMARK,
        etaSeconds: etaMin * 60,
        elapsedSeconds: 0,
        riderName: pick(RIDER_NAMES),
        createdAt: Date.now(),
      }
    },
    tick(seconds = 1) {
      if (this.current) this.current.elapsedSeconds += seconds
    },
    clear() {
      this.current = null
    },
  },
})
