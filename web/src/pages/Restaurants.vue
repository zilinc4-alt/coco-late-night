<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CATEGORIES } from '../data/meta.js'
import { shopsByCategory, otherShops } from '../data/shops.js'
import Cover from '../components/Cover.vue'

const router = useRouter()
const route = useRoute()

const currentSlug = computed(() => route.params.category || 'bbq')
const currentCat = computed(() => CATEGORIES.find((c) => c.slug === currentSlug.value) || CATEGORIES[1])

const primaryShops = computed(() => shopsByCategory(currentSlug.value))
const secondaryShops = computed(() => otherShops(currentSlug.value))

function switchCategory(slug) {
  router.replace(`/restaurants/${slug}`)
}
function enterShop(shop) {
  router.push(`/menu/${shop.slug}`)
}
</script>

<template>
  <div class="page">
    <div class="eyebrow">附近夜宵</div>
    <h1 class="page-title">附近这些店还开着</h1>
    <p class="subhead">先选分类，再挑一家进店看看。</p>

    <!-- 分类横滑 -->
    <div class="tabs-wrap">
      <div class="tabs">
        <button
          v-for="c in CATEGORIES"
          :key="c.slug"
          class="tab"
          :class="{ active: c.slug === currentSlug }"
          @click="switchCategory(c.slug)"
        >
          <span class="tab-emoji">{{ c.emoji }}</span>
          <span>{{ c.name }}</span>
        </button>
      </div>
    </div>

    <!-- 当前分类店铺 -->
    <div v-if="primaryShops.length" class="hint">
      今晚已经有得选。先看看这几家，再决定要不要真的下手。
    </div>
    <div v-else class="hint">
      今晚这个口味先歇一歇。看看其他店？
    </div>

    <div class="shop-list">
      <button
        v-for="shop in primaryShops"
        :key="shop.slug"
        class="shop-card"
        @click="enterShop(shop)"
      >
        <Cover :gradient="shop.coverGradient" :emoji="shop.coverEmoji" :image="shop.image" size="88px" />
        <div class="shop-info">
          <div class="shop-row">
            <span class="shop-name">{{ shop.name }}</span>
            <span class="shop-eta">{{ shop.eta[0] }}-{{ shop.eta[1] }} 分钟</span>
          </div>
          <div class="shop-meta">
            {{ shop.rating }} 分 · 月售 {{ shop.monthSold }} · 人均 ¥{{ shop.avgPrice }}
          </div>
          <div class="shop-tags">
            <span v-for="t in shop.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>
      </button>
    </div>

    <!-- 其他分类推荐 -->
    <div v-if="secondaryShops.length" class="divider-label">以下为其他类别店铺</div>
    <div class="shop-list">
      <button
        v-for="shop in secondaryShops"
        :key="shop.slug"
        class="shop-card"
        @click="enterShop(shop)"
      >
        <Cover :gradient="shop.coverGradient" :emoji="shop.coverEmoji" :image="shop.image" size="88px" />
        <div class="shop-info">
          <div class="shop-row">
            <span class="shop-name">{{ shop.name }}</span>
            <span class="shop-eta">{{ shop.eta[0] }}-{{ shop.eta[1] }} 分钟</span>
          </div>
          <div class="shop-meta">
            {{ shop.rating }} 分 · 月售 {{ shop.monthSold }} · 人均 ¥{{ shop.avgPrice }}
          </div>
          <div class="shop-tags">
            <span v-for="t in shop.tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tabs-wrap {
  margin: 0 -16px 16px;
  padding: 0 16px;
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs-wrap::-webkit-scrollbar { display: none; }
.tabs {
  display: inline-flex;
  gap: 8px;
  padding-bottom: 4px;
}
.tab {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  color: var(--fg-muted);
  border-radius: var(--radius-pill);
  font-size: 13px;
  white-space: nowrap;
  font-weight: 600;
}
.tab.active {
  background: linear-gradient(90deg, var(--primary-1), var(--primary-2));
  color: #3a2a15;
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(247, 181, 0, 0.32);
}
.tab-emoji {
  font-size: 14px;
}

.hint {
  color: var(--fg-dim);
  font-size: 12px;
  margin-bottom: 12px;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.shop-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  text-align: left;
  transition: transform 0.12s ease, border-color 0.15s;
  width: 100%;
  box-shadow: 0 1px 2px rgba(107, 76, 30, 0.05);
}
.shop-card:active {
  transform: scale(0.99);
  border-color: rgba(247, 181, 0, 0.45);
}
.shop-info {
  flex: 1;
  min-width: 0;
}
.shop-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.shop-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--fg);
}
.shop-eta {
  font-size: 11px;
  color: var(--fg-dim);
}
.shop-meta {
  font-size: 11px;
  color: var(--fg-muted);
  margin-bottom: 8px;
}
.shop-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
