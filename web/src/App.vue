<script setup>
import { computed, onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import { useThemeStore } from './stores/theme.js'

const theme = useThemeStore()
onMounted(() => theme.init())

const version = computed(() => {
  const ver = __APP_VERSION__
  const build = __BUILD_TIME__
  return `v${ver} · ${build}`
})
</script>

<template>
  <div class="app-shell">
    <TopBar />
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
    <div class="version-tag">{{ version }}</div>
  </div>
</template>

<style scoped>
.app-shell {
  max-width: 460px;
  margin: 0 auto;
  min-height: 100vh;
  position: relative;
  padding-bottom: 40px;
}
.version-tag {
  position: fixed;
  bottom: 6px;
  right: 12px;
  font-size: 10px;
  color: var(--fg-dim);
  opacity: 0.35;
  pointer-events: none;
  z-index: 200;
  letter-spacing: 0.3px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
