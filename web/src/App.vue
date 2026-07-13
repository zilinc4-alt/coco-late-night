<script setup>
import { onMounted } from 'vue'
import TopBar from './components/TopBar.vue'
import { useThemeStore } from './stores/theme.js'

const theme = useThemeStore()
onMounted(() => theme.init())
</script>

<template>
  <div class="app-shell">
    <TopBar />
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
