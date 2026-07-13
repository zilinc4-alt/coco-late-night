<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantStore } from '../../stores/merchant.js'

const router = useRouter()
const merchant = useMerchantStore()

onMounted(() => {
  if (!merchant.activeShop) router.replace('/merchant')
})

const shop = computed(() => merchant.activeShop)

// 每个店铺类目对应的子分类
const SUBCATS = {
  bbq: ['烤串', '烤肉', '烤海鲜', '烤蔬菜', '凉菜', '主食', '小吃', '饮品', '套餐', '加料'],
  fried: ['招牌', '汉堡', '鸡翅', '小食', '套餐', '加料', '饮品'],
  tea: ['招牌', '轻负担', '果茶', '奶盖', '小食', '加料'],
  liquor: ['招牌酒', '瓶装啤酒', '精酿', '洋酒', '鸡尾酒', '下酒菜', '小食', '不喝的选项'],
  malatang: ['荤菜', '素菜', '主食', '汤底', '加料'],
  burger: ['招牌', '双层', '套餐', '小吃', '饮品'],
  dessert: ['招牌', '轻甜', '慕斯', '布丁', '饮品'],
  noodle: ['招牌', '汤面', '干拌', '加料', '饮品'],
  heavy: ['招牌', '重口', '拌菜', '主食', '饮品'],
  mixed: ['招牌', '素一点', '加一点', '套餐', '饮品', '主食'],
}
const subcats = computed(() => SUBCATS[shop.value?.category] || SUBCATS.mixed)

const form = ref({
  name: '',
  desc: '',
  price: '',
  calories: '',
  subCategory: '',
})

const dishImage = ref(null)
const dishImagePreview = ref('')
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
    dishImage.value = reader.result
    dishImagePreview.value = reader.result
  }
  reader.readAsDataURL(file)
}

const canSubmit = computed(
  () => form.value.name.trim() && form.value.desc.trim() && Number(form.value.price) > 0,
)

const toast = ref('')

function save() {
  if (!canSubmit.value) return
  merchant.addDish({
    ...form.value,
    subCategory: form.value.subCategory || subcats.value[0],
    image: dishImage.value,
  })
  toast.value = '菜品已上新，返回后台查看'
  setTimeout(() => router.push('/merchant/dashboard'), 900)
}
</script>

<template>
  <div v-if="shop" class="page">
    <div class="eyebrow">新增菜品</div>
    <h1 class="page-title">上新一道菜</h1>
    <p class="subhead">
      {{ shop.category === 'bbq' ? '烧烤店' : '本店' }}会显示对应的店内分类，外部分类仍由店铺类型决定。
    </p>

    <div class="card">
      <div class="field">
        <label class="field-label">菜品名称</label>
        <input v-model="form.name" class="field-input" placeholder="例如 明天会后悔炸鸡桶" />
      </div>
      <div class="field">
        <label class="field-label">菜品描述</label>
        <textarea
          v-model="form.desc"
          class="field-textarea"
          placeholder="例如 外酥里嫩，专治深夜空虚。"
        ></textarea>
      </div>
      <div class="row-2">
        <div class="field">
          <label class="field-label">价格（元）</label>
          <input
            v-model="form.price"
            class="field-input"
            type="number"
            inputmode="decimal"
            placeholder="28"
          />
        </div>
        <div class="field">
          <label class="field-label">热量（千卡，可选）</label>
          <input
            v-model="form.calories"
            class="field-input"
            type="number"
            inputmode="decimal"
            placeholder="不填按分类估算"
          />
        </div>
      </div>
      <div class="field">
        <label class="field-label">菜品分类</label>
        <select v-model="form.subCategory" class="field-select">
          <option v-for="c in subcats" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <div class="field">
        <label class="field-label">菜品图片</label>
        <div class="cover-placeholder" @click="triggerUpload">
          <div class="cover-thumb" v-if="dishImagePreview">
            <img :src="dishImagePreview" alt="preview" class="cover-preview-img" />
          </div>
          <div class="cover-thumb" v-else>🔥</div>
          <div>
            <div class="cover-title">上传菜品图片</div>
            <div class="cover-hint">从手机相册选择。会压缩后随菜品同步。最大 2MB。</div>
          </div>
        </div>
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
      </div>
    </div>

    <button class="primary-button" :disabled="!canSubmit" @click="save">保存菜品</button>
    <div style="height: 10px"></div>
    <button class="secondary-button" @click="router.push('/merchant/dashboard')">返回后台</button>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>

<style scoped>
.card {
  padding: 16px;
  margin-bottom: 20px;
}
.row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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
