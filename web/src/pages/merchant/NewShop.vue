<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantStore } from '../../stores/merchant.js'
import { useOrderStore } from '../../stores/order.js'
import { SHOP_CATEGORIES } from '../../data/meta.js'

const router = useRouter()
const merchant = useMerchantStore()
const order = useOrderStore()

const form = ref({
  name: '',
  category: 'bbq',
  desc: '',
  cover: null,
})

const canSubmit = computed(() => form.value.name.trim() && form.value.desc.trim())

const remain = computed(() => {
  if (!order.current) return null
  const s = order.remainingSeconds
  return `${Math.floor(s / 60)} 分 ${String(s % 60).padStart(2, '0')} 秒`
})

function save() {
  if (!canSubmit.value) return
  merchant.createShop({
    name: form.value.name.trim(),
    category: form.value.category,
    desc: form.value.desc.trim(),
    cover: form.value.cover,
  })
  router.push('/merchant/dashboard')
}
</script>

<template>
  <div class="page">
    <div v-if="remain" class="pill-banner">
      <span>有一单夜宵正在路上</span>
      <span class="pill-time">{{ remain }}</span>
    </div>

    <div class="eyebrow">新开小店</div>
    <h1 class="page-title">今晚卖点什么？</h1>
    <p class="subhead">店铺分类会决定它出现在普通用户点单列表里的哪个口味 tab 下。</p>

    <div class="card">
      <div class="field">
        <label class="field-label">店铺名称</label>
        <input v-model="form.name" class="field-input" placeholder="例如 加班后烧烤档" />
      </div>

      <div class="field">
        <label class="field-label">店铺分类</label>
        <select v-model="form.category" class="field-select">
          <option v-for="c in SHOP_CATEGORIES" :key="c.slug" :value="c.slug">
            {{ c.emoji }} {{ c.name }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="field-label">店铺介绍</label>
        <textarea
          v-model="form.desc"
          class="field-textarea"
          placeholder="例如 专治下班后那口空落落。"
        ></textarea>
      </div>

      <div class="field">
        <label class="field-label">店铺封面</label>
        <div class="cover-placeholder">
          <div class="cover-thumb">🔥</div>
          <div>
            <div class="cover-title">上传店铺封面</div>
            <div class="cover-hint">从手机相册选择。会压缩后随店铺资料同步到服务器。</div>
          </div>
        </div>
      </div>
    </div>

    <button class="primary-button" :disabled="!canSubmit" @click="save">保存并开店</button>
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
.card {
  padding: 16px;
  margin-bottom: 20px;
}
.cover-placeholder {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px;
  background: linear-gradient(135deg, rgba(247, 181, 0, 0.15), rgba(255, 216, 130, 0.1));
  border: 1px dashed rgba(247, 181, 0, 0.5);
  border-radius: var(--radius-md);
}
.cover-thumb {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.cover-title {
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
}
.cover-hint {
  color: var(--fg-muted);
  font-size: 11px;
  line-height: 1.5;
}
</style>
