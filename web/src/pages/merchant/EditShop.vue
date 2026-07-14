<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantStore } from '../../stores/merchant.js'
import { SHOP_CATEGORIES } from '../../data/meta.js'

const router = useRouter()
const merchant = useMerchantStore()

onMounted(() => {
  if (!merchant.activeShop) { router.replace('/merchant'); return }
  const s = merchant.activeShop
  form.value.name = s.name
  form.value.category = s.category
  form.value.desc = s.desc
  coverPreview.value = s.cover || ''
})

const canSubmit = computed(() => form.value.name.trim() && form.value.desc.trim())

const fileInput = ref(null)
function triggerUpload() {
  fileInput.value?.click()
}
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB，请压缩后再上传。')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    coverPreview.value = reader.result
  }
  reader.readAsDataURL(file)
}

function save() {
  if (!canSubmit.value) return
  merchant.updateShop({
    name: form.value.name.trim(),
    category: form.value.category,
    desc: form.value.desc.trim(),
    cover: coverPreview.value || shop.value?.cover || null,
  })
  router.push('/merchant/dashboard')
}
</script>

<template>
  <div v-if="shop" class="page">
    <div class="eyebrow">编辑店铺信息</div>
    <h1 class="page-title">修改小店</h1>
    <p class="subhead">修改后保存即可，店铺口令不变。</p>

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
        <textarea v-model="form.desc" class="field-textarea" placeholder="例如 专治下班后那口空落落。" />
      </div>

      <div class="field">
        <label class="field-label">店铺封面</label>
        <div class="cover-placeholder" @click="triggerUpload">
          <div class="cover-thumb" v-if="coverPreview">
            <img :src="coverPreview" alt="preview" class="cover-preview-img" />
          </div>
          <div class="cover-thumb" v-else>{{ shop.category ? SHOP_CATEGORIES.find(c => c.slug === shop.category)?.emoji || '🔥' : '🔥' }}</div>
          <div>
            <div class="cover-title">更换封面图片</div>
            <div class="cover-hint">最大 2MB。</div>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
      </div>
    </div>

    <button class="primary-button" :disabled="!canSubmit" @click="save">保存修改</button>
    <div style="height:10px" />
    <button class="secondary-button" @click="router.push('/merchant/dashboard')">返回后台</button>
  </div>
</template>

<style scoped>
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
  cursor: pointer;
}
.cover-placeholder:hover {
  border-color: rgba(247, 181, 0, 0.8);
}
.cover-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
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
  overflow: hidden;
  flex-shrink: 0;
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
