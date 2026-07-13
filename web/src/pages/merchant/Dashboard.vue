<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantStore } from '../../stores/merchant.js'
import { useOrderStore } from '../../stores/order.js'
import { SHOP_CATEGORIES } from '../../data/meta.js'

const router = useRouter()
const merchant = useMerchantStore()
const order = useOrderStore()

onMounted(() => {
  if (!merchant.activeShop) {
    router.replace('/merchant')
  }
})

const shop = computed(() => merchant.activeShop)
const stats = computed(() => merchant.activeStats)
const catInfo = computed(() =>
  SHOP_CATEGORIES.find((c) => c.slug === shop.value?.category) || SHOP_CATEGORIES[0],
)

const remain = computed(() => {
  if (!order.current) return null
  const s = order.remainingSeconds
  return `${Math.floor(s / 60)} 分 ${String(s % 60).padStart(2, '0')} 秒`
})

const toast = ref('')
function copyCode() {
  if (!shop.value) return
  navigator.clipboard?.writeText(shop.value.code).catch(() => {})
  toast.value = '店铺口令已复制'
  setTimeout(() => (toast.value = ''), 2200)
}
function copyLink() {
  if (!shop.value) return
  const url = `${location.origin}${location.pathname}#/menu/${shop.value.code}`
  navigator.clipboard?.writeText(url).catch(() => {})
  toast.value = '店铺地址已复制'
  setTimeout(() => (toast.value = ''), 2200)
}
function preview() {
  router.push(`/menu/${shop.value.code}`)
}
function addDish() {
  router.push('/merchant/dish/new')
}
</script>

<template>
  <div v-if="shop" class="page">
    <div v-if="remain" class="pill-banner">
      <span>有一单夜宵正在路上</span>
      <span class="pill-time">{{ remain }}</span>
    </div>

    <div class="eyebrow">店家后台</div>
    <p class="subhead">这家店只营业在想象里。店铺资料和菜单会用口令同步到服务器。</p>

    <div v-if="shop.dishes.length === 0" class="sync-hint">小店开好了，口令已经同步到服务器。</div>

    <!-- 店铺卡 -->
    <div class="card shop-card">
      <div class="shop-top">
        <div class="cover">
          <span>{{ catInfo.emoji }}</span>
        </div>
        <div class="shop-meta">
          <div class="shop-name">{{ shop.name }}</div>
          <div class="shop-sub">{{ catInfo.name }} · {{ shop.desc.slice(0, 12) }}</div>
        </div>
      </div>
      <div class="code-row">
        <span class="code-label">店铺口令：</span>
        <span class="code-value">{{ shop.code }}</span>
      </div>
      <div class="btn-grid">
        <button class="minor" @click="$router.push('/merchant/new')">编辑店铺信息</button>
        <button class="minor" @click="copyCode">复制店铺口令</button>
        <button class="minor" @click="copyLink">复制店铺地址</button>
        <button class="minor accent" @click="preview">预览我的店铺</button>
      </div>
    </div>

    <!-- 数据卡 -->
    <div class="stats-block">
      <div class="stats-head">
        <span class="stats-title">今日营业数据</span>
      </div>
      <p v-if="stats.orders === 0 && stats.visits === 0" class="stats-empty">
        今天还在等第一位客人
      </p>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-label">今日访问</div>
          <div class="stat-value">{{ stats.visits }}</div>
          <div class="stat-hint">今日有 {{ stats.visits }} 人路过你的小店。</div>
        </div>
        <div class="stat">
          <div class="stat-label">今日下单</div>
          <div class="stat-value">{{ stats.orders }}</div>
          <div class="stat-hint">今天有 {{ stats.orders }} 单不会真的送达。</div>
        </div>
        <div class="stat">
          <div class="stat-label">今日幻想收入</div>
          <div class="stat-value">¥{{ stats.virtualIncome }}</div>
          <div class="stat-hint">虚拟收入，不会到账。</div>
        </div>
        <div class="stat">
          <div class="stat-label">今日被馋</div>
          <div class="stat-value">{{ stats.cravedCount }}</div>
          <div class="stat-hint">你的菜今天被馋了 {{ stats.cravedCount }} 次。</div>
        </div>
      </div>
    </div>

    <!-- 菜品管理 -->
    <div class="menu-block">
      <div class="menu-head">
        <span class="menu-title">菜品管理</span>
        <span class="menu-count">{{ shop.dishes.length }} 款</span>
      </div>

      <div v-if="shop.dishes.length === 0" class="empty-menu card">
        <div class="empty-title">先上新一道菜</div>
        <p class="empty-body">
          菜单还是空的。普通用户进店后需要看到菜品，才能加购和完成等待。
        </p>
        <button class="primary-button" @click="addDish">新增一道不会真的送来的菜</button>
      </div>

      <div v-else>
        <div v-for="d in shop.dishes" :key="d.id" class="dish-row">
          <div>
            <div class="dish-name">{{ d.name }}</div>
            <div class="dish-desc">{{ d.desc }}</div>
          </div>
          <div class="dish-price">¥{{ d.price }}</div>
        </div>
        <button class="secondary-button" @click="addDish">再上一道菜</button>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.pill-banner {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(247, 181, 0, 0.12);
  border: 1px solid rgba(247, 181, 0, 0.32);
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  color: var(--fg-muted);
  font-size: 13px;
}
.pill-time {
  color: var(--accent);
  font-weight: 700;
}
.sync-hint {
  padding: 10px 14px;
  background: rgba(247, 181, 0, 0.09);
  color: var(--fg-muted);
  border-radius: var(--radius-md);
  font-size: 12px;
  margin-bottom: 16px;
}

.shop-card {
  padding: 16px;
  margin-bottom: 16px;
}
.shop-top {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.cover {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex: 0 0 auto;
}
.shop-name {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}
.shop-sub {
  color: var(--fg-muted);
  font-size: 12px;
}
.code-row {
  padding: 10px 12px;
  background: var(--bg-input);
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}
.code-label {
  color: var(--fg-muted);
}
.code-value {
  color: var(--accent);
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
}
.btn-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.minor {
  padding: 10px 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-soft);
  color: var(--fg);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}
.minor.accent {
  background: rgba(247, 181, 0, 0.18);
  color: #8f5a1a;
  border-color: rgba(247, 181, 0, 0.45);
}
.minor:active {
  background: rgba(247, 181, 0, 0.14);
}

.stats-block {
  margin-bottom: 24px;
}
.stats-head {
  padding: 0 4px;
  margin-bottom: 12px;
}
.stats-title {
  font-weight: 700;
  font-size: 15px;
}
.stats-empty {
  padding: 12px 14px;
  background: rgba(247, 181, 0, 0.12);
  color: #8f5a1a;
  border-radius: 8px;
  font-size: 12px;
  margin: 0 0 12px;
}
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.stat {
  padding: 12px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
}
.stat-label {
  color: var(--fg-muted);
  font-size: 11px;
  margin-bottom: 4px;
}
.stat-value {
  color: var(--accent);
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 4px;
}
.stat-hint {
  color: var(--fg-dim);
  font-size: 11px;
  line-height: 1.4;
}

.menu-block {
  margin-bottom: 24px;
}
.menu-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 4px 8px;
}
.menu-title {
  font-weight: 700;
  font-size: 15px;
}
.menu-count {
  color: var(--fg-dim);
  font-size: 12px;
}
.empty-menu {
  padding: 20px 16px;
  text-align: center;
}
.empty-title {
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 8px;
}
.empty-body {
  color: var(--fg-muted);
  font-size: 12px;
  line-height: 1.6;
  margin: 0 0 16px;
}
.dish-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}
.dish-name {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}
.dish-desc {
  color: var(--fg-muted);
  font-size: 12px;
  line-height: 1.4;
}
.dish-price {
  color: var(--accent);
  font-weight: 700;
  font-size: 15px;
  flex: 0 0 auto;
}
</style>
