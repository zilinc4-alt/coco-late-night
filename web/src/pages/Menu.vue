<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { findShop } from '../data/shops.js'
import { useCartStore } from '../stores/cart.js'
import { useMerchantStore } from '../stores/merchant.js'
import Cover from '../components/Cover.vue'

const router = useRouter()
const route = useRoute()
const cart = useCartStore()
const merchant = useMerchantStore()

const slug = route.params.shopSlug

// Look up in seed shops first, then user-created merchant shops
function loadShop() {
  const seed = findShop(slug)
  if (seed) return seed
  const own = merchant.shops.find((s) => s.code.toLowerCase() === slug.toLowerCase())
  if (own) {
    return {
      slug: own.code,
      name: own.name,
      category: own.category,
      desc: own.desc,
      tags: ['今夜新店'],
      rating: 5.0,
      monthSold: '新店开张',
      avgPrice: 0,
      eta: [18, 35],
      coverGradient: ['#7b2b1a', '#d16637'],
      coverEmoji: '🔥',
      dishes: (own.dishes || []).map((d) => ({
        g: d.subCategory || '招牌',
        name: d.name,
        desc: d.desc,
        price: d.price,
        sold: 0,
      })),
    }
  }
  return null
}

const shop = ref(loadShop())
onMounted(() => {
  if (!shop.value) router.replace('/home')
  // 追踪店家访问
  if (shop.value) {
    const own = merchant.shops.find((s) => s.code.toLowerCase() === slug.toLowerCase())
    if (own) merchant.trackVisit(own.code)
  }
})

// 按 g 分组
const grouped = computed(() => {
  if (!shop.value) return []
  const map = new Map()
  for (const d of shop.value.dishes) {
    if (!map.has(d.g)) map.set(d.g, [])
    map.get(d.g).push(d)
  }
  return [...map.entries()].map(([g, list]) => ({ g, list }))
})

const MIN_ORDER = 25

function add(dish) {
  cart.add(shop.value.slug, dish)
  // 追踪"被馋"
  const own = merchant.shops.find((s) => s.code.toLowerCase() === slug.toLowerCase())
  if (own) merchant.trackCrave(own.code)
}
function remove(dish) {
  cart.remove(shop.value.slug, dish)
}
function qtyOf(dish) {
  return cart.qtyOf(shop.value.slug, dish.name)
}

function goCheckout() {
  if (cart.count === 0 || cart.total < MIN_ORDER) return
  router.push('/checkout')
}
</script>

<template>
  <div v-if="shop" class="page menu-page">
    <!-- 店头 -->
    <div class="shop-head">
      <div class="shop-head-top">
        <div>
          <div class="shop-name">{{ shop.name }}</div>
          <div class="shop-sub">
            {{ shop.rating }} 分 · 月售 {{ shop.monthSold }} · {{ shop.eta[0] }}-{{ shop.eta[1] }} 分钟
          </div>
        </div>
      </div>
      <div class="shop-tags">
        <span v-for="t in shop.tags" :key="t" class="tag">{{ t }}</span>
      </div>
      <div class="shop-desc">{{ shop.desc }}</div>
    </div>

    <!-- 菜品分组 -->
    <div v-for="group in grouped" :key="group.g" class="dish-group">
      <div class="group-head">
        <span class="group-name">{{ group.g }}</span>
        <span class="group-count">{{ group.list.length }} 款</span>
      </div>

      <div class="dish-list">
        <div v-for="dish in group.list" :key="dish.name" class="dish-card">
          <Cover
            :gradient="shop.coverGradient"
            :emoji="shop.coverEmoji"
            :image="dish.image"
            size="72px"
            radius="10px"
          />
          <div class="dish-info">
            <div class="dish-name">{{ dish.name }}</div>
            <div class="dish-desc">{{ dish.desc }}</div>
            <div class="dish-foot">
              <span class="dish-sold">月售 {{ dish.sold }}</span>
              <span class="dish-price">¥{{ dish.price }}</span>
            </div>
          </div>
          <div class="qty-ctrl">
            <button v-if="qtyOf(dish) > 0" class="minus" @click="remove(dish)">−</button>
            <span v-if="qtyOf(dish) > 0" class="qty">{{ qtyOf(dish) }}</span>
            <button class="plus" @click="add(dish)">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部购物车 -->
    <div class="sticky-cart">
      <div class="cart-summary">
        <span class="cart-icon">🛒</span>
        <span class="cart-count">{{ cart.count }}</span>
        <span class="cart-total">¥{{ cart.total }}</span>
        <span v-if="cart.total < MIN_ORDER" class="cart-tip">
          还差 ¥{{ MIN_ORDER - cart.total }} 起送
        </span>
        <span v-else class="cart-tip ok">今晚不点券可用</span>
      </div>
      <button
        class="primary-button ck-btn"
        :disabled="cart.count === 0 || cart.total < MIN_ORDER"
        @click="goCheckout"
      >
        去结算
      </button>
    </div>
  </div>
</template>

<style scoped>
.menu-page {
  padding-bottom: 120px;
}

.shop-head {
  padding: 8px 4px 20px;
  border-bottom: 1px solid var(--border-soft);
  margin-bottom: 20px;
}
.shop-name {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}
.shop-sub {
  font-size: 12px;
  color: var(--fg-muted);
  margin-bottom: 10px;
}
.shop-tags {
  margin-bottom: 12px;
}
.shop-desc {
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.6;
}

.dish-group {
  margin-bottom: 24px;
}
.group-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
  padding-left: 4px;
}
.group-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--fg);
}
.group-count {
  font-size: 11px;
  color: var(--fg-dim);
}
.dish-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dish-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  align-items: flex-start;
}
.dish-info {
  flex: 1;
  min-width: 0;
}
.dish-name {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
}
.dish-desc {
  color: var(--fg-muted);
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 8px;
  min-height: 32px;
}
.dish-foot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.dish-sold {
  color: var(--fg-dim);
  font-size: 11px;
}
.dish-price {
  color: var(--accent);
  font-weight: 700;
  font-size: 16px;
}
.qty-ctrl {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-top: 40px;
  min-width: 68px;
  justify-content: flex-end;
}
.plus,
.minus {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  color: #3a2a15;
  font-weight: 800;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(247, 181, 0, 0.32);
}
.minus {
  background: var(--bg-card-2);
  color: var(--fg);
  border: 1px solid var(--border-strong);
  box-shadow: none;
}
.qty {
  font-size: 14px;
  font-weight: 700;
  min-width: 12px;
  text-align: center;
}

.sticky-cart {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 16px;
  width: calc(100% - 32px);
  max-width: 428px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-input);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-pill);
  padding: 6px 6px 6px 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
}
.cart-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.cart-icon {
  font-size: 18px;
}
.cart-count {
  min-width: 18px;
  text-align: center;
  background: var(--primary-1);
  color: #3a2a15;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-pill);
}
.cart-total {
  font-size: 17px;
  font-weight: 800;
  color: var(--primary-1);
}
.cart-tip {
  font-size: 11px;
  color: var(--fg-dim);
  white-space: nowrap;
}
.cart-tip.ok {
  color: var(--fg-muted);
}
.ck-btn {
  width: auto;
  padding: 12px 22px;
  font-size: 14px;
  flex: 0 0 auto;
}
</style>
