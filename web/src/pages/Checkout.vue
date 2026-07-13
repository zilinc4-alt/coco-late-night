<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart.js'
import { useOrderStore } from '../stores/order.js'
import { useJournalStore } from '../stores/journal.js'
import { findShop } from '../data/shops.js'
import { ADDRESSES, COUPON_NAME, ORDER_REMARK } from '../data/meta.js'

const router = useRouter()
const cart = useCartStore()
const order = useOrderStore()
const journal = useJournalStore()

onMounted(() => {
  if (cart.count === 0) router.replace('/home')
})

const shop = computed(() => findShop(cart.shopSlug))
const addressIdx = ref(0)

const savedCalories = computed(() => {
  const qty = cart.count
  return [qty * 200, qty * 300]
})

function placeOrder() {
  if (!shop.value || cart.count === 0) return
  order.createFrom(shop.value, cart.lineItems, addressIdx.value)
  journal.add(order.current, shop.value)
  cart.clear()
  router.push('/waiting')
}
</script>

<template>
  <div v-if="shop" class="page checkout-page">
    <div class="eyebrow">确认订单</div>
    <h1 class="page-title">确认今晚这单</h1>
    <p class="subhead">不用填写真实地址，系统已为你准备好{{ COUPON_NAME }}。</p>

    <!-- 订单摘要 -->
    <div class="card summary-card">
      <div class="shop-line">{{ shop.name }}</div>
      <div v-for="i in cart.lineItems" :key="i.name" class="line">
        <span class="line-name">{{ i.name }} × {{ i.qty }}</span>
        <span class="line-price">¥{{ i.qty * i.price }}</span>
      </div>
      <div class="line total-line">
        <span>合计</span>
        <span class="total-num">¥{{ cart.total }}</span>
      </div>
    </div>

    <!-- 配送信息 -->
    <div class="card info-card">
      <div class="card-title">配送信息</div>
      <div class="field">
        <label class="field-label">配送地址</label>
        <select v-model="addressIdx" class="field-select">
          <option v-for="(a, idx) in ADDRESSES" :key="a" :value="idx">{{ a }}</option>
        </select>
      </div>
      <div class="row">
        <span class="row-label">支付方式</span>
        <span class="row-value accent">{{ COUPON_NAME }}</span>
      </div>
      <div class="row">
        <span class="row-label">预计送达</span>
        <span class="row-value">12-20 分钟后</span>
      </div>
      <div class="remark">订单备注：{{ ORDER_REMARK }}</div>
    </div>

    <div class="bene">
      <div>预计省下 ¥{{ cart.total }}</div>
      <div>大约少摄入 {{ savedCalories[0] }}-{{ savedCalories[1] }} 千卡</div>
    </div>

    <button class="primary-button sticky-cta" @click="placeOrder">确认下单</button>
  </div>
</template>

<style scoped>
.checkout-page {
  padding-bottom: 100px;
}
.card {
  margin-bottom: 16px;
}
.summary-card .shop-line {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 12px;
}
.line {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--fg-muted);
  margin-bottom: 6px;
}
.line-name {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.line-price {
  color: var(--fg);
}
.total-line {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-soft);
  color: var(--fg);
  font-size: 15px;
  font-weight: 700;
}
.total-num {
  color: var(--accent);
  font-size: 20px;
}
.info-card .card-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 12px;
}
.row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-soft);
  font-size: 13px;
}
.row:last-of-type {
  border-bottom: none;
}
.row-label {
  color: var(--fg-muted);
}
.row-value {
  font-weight: 600;
}
.row-value.accent {
  color: var(--accent);
}
.remark {
  margin-top: 10px;
  padding: 8px 12px;
  background: rgba(247, 181, 0, 0.12);
  color: #8f5a1a;
  font-size: 12px;
  border-radius: 8px;
}
.bene {
  display: flex;
  justify-content: space-between;
  color: var(--fg-dim);
  font-size: 11px;
  padding: 0 4px;
  margin-bottom: 16px;
  gap: 12px;
}
.sticky-cta {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 428px;
}
</style>
