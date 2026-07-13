<script setup>
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/home')
}
function goHome() {
  router.push('/home')
}
</script>

<template>
  <header class="topbar">
    <button v-if="route.path !== '/home' && route.path !== '/'" class="ico-btn" @click="goBack">
      ‹
    </button>
    <span v-else class="ico-btn ghost">‹</span>

    <div class="brand">
      <span class="logo">C</span>
      <span class="brand-name">COCO 的深夜食堂</span>
    </div>

    <button class="ico-btn" @click="goHome" aria-label="首页">⌂</button>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(251, 247, 239, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-soft);
}
.ico-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-input);
  border: 1px solid var(--border-soft);
  color: var(--fg);
  font-size: 20px;
  line-height: 38px;
  text-align: center;
  transition: background 0.15s;
}
.ico-btn:active {
  background: rgba(247, 181, 0, 0.18);
}
.ico-btn.ghost {
  opacity: 0;
  pointer-events: none;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 17px;
  font-weight: 800;
  color: var(--fg);
}
.logo {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, var(--primary-1), var(--primary-2));
  color: #3a2a15;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 2px 6px rgba(247, 181, 0, 0.35);
}
</style>
