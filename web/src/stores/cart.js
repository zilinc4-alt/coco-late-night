import { defineStore } from 'pinia'

// key: `${shopSlug}::${dishName}`
export const useCartStore = defineStore('cart', {
  state: () => ({
    shopSlug: null,
    items: {}, // { key: { shopSlug, name, price, qty } }
  }),
  getters: {
    count(state) {
      return Object.values(state.items).reduce((n, i) => n + i.qty, 0)
    },
    total(state) {
      return Object.values(state.items).reduce((n, i) => n + i.qty * i.price, 0)
    },
    lineItems(state) {
      return Object.values(state.items).filter((i) => i.qty > 0)
    },
  },
  actions: {
    add(shopSlug, dish) {
      // switching shops clears cart
      if (this.shopSlug && this.shopSlug !== shopSlug) {
        this.items = {}
      }
      this.shopSlug = shopSlug
      const key = `${shopSlug}::${dish.name}`
      if (!this.items[key]) {
        this.items[key] = { shopSlug, name: dish.name, price: dish.price, qty: 0 }
      }
      this.items[key].qty += 1
    },
    remove(shopSlug, dish) {
      const key = `${shopSlug}::${dish.name}`
      if (!this.items[key]) return
      this.items[key].qty -= 1
      if (this.items[key].qty <= 0) delete this.items[key]
      if (this.count === 0) this.shopSlug = null
    },
    clear() {
      this.items = {}
      this.shopSlug = null
    },
    qtyOf(shopSlug, dishName) {
      const key = `${shopSlug}::${dishName}`
      return this.items[key]?.qty || 0
    },
  },
})
