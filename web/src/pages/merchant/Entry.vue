<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMerchantStore } from '../../stores/merchant.js'

const router = useRouter()
const merchant = useMerchantStore()

const codeInput = ref('')
const error = ref('')

function goCreate() {
  router.push('/merchant/new')
}
function login() {
  const code = codeInput.value.trim()
  if (!code) return
  if (merchant.loginByCode(code)) {
    router.push('/merchant/dashboard')
  } else {
    error.value = '这个口令没对上，检查一下大小写。'
  }
}
</script>

<template>
  <div class="page">
    <div class="eyebrow">我是店家</div>
    <h1 class="page-title">开一家只负责让人馋的小店。</h1>
    <p class="subhead">
      第一版不做登录，也没有真实经营、收款或配送。小店会保存在服务器上，店铺口令就是你的找回凭证。
    </p>

    <div class="card">
      <div class="card-title">新店家</div>
      <p class="card-body">
        给这家夜宵小店取个名字、选个分类，再上传几道菜，就能在普通点单列表里看到它。
      </p>
      <button class="primary-button" @click="goCreate">开一家不会真的出餐的小店</button>
    </div>

    <div class="card">
      <div class="card-title">找回已有小店</div>
      <p class="card-body">输入店铺口令，从服务器找回你的店铺和菜单。</p>
      <div class="field">
        <label class="field-label">店铺口令</label>
        <input
          v-model="codeInput"
          class="field-input"
          placeholder="例如 NIGHT-ABC123"
          @keyup.enter="login"
        />
      </div>
      <button class="secondary-button" @click="login">找回小店</button>
      <div v-if="error" class="err">{{ error }}</div>
    </div>
  </div>
</template>

<style scoped>
.card {
  margin-bottom: 16px;
  padding: 20px 18px;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}
.card-body {
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 16px;
}
.err {
  margin-top: 10px;
  color: #ff9666;
  font-size: 12px;
}
</style>
