<script setup>
import { ref } from 'vue'

const props = defineProps({
  gradient: { type: Array, default: () => ['#ffd100', '#ffc300'] },
  emoji: { type: String, default: '🍽️' },
  size: { type: String, default: '72px' },
  radius: { type: String, default: '12px' },
  image: { type: String, default: '' },
})

const failed = ref(false)
const loaded = ref(false)

function onError() {
  failed.value = true
  loaded.value = true
}
function onLoad() {
  loaded.value = true
}
</script>

<template>
  <div
    class="cover"
    :style="{
      background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      width: size,
      height: size,
      borderRadius: radius,
    }"
  >
    <!-- 骨架屏脉冲（图片加载中时显示） -->
    <span v-if="image && !loaded && !failed" class="skeleton" aria-hidden="true"></span>

    <img
      v-if="image && !failed"
      class="img"
      :class="{ loaded: loaded }"
      :src="image"
      :alt="emoji"
      loading="lazy"
      decoding="async"
      @error="onError"
      @load="onLoad"
    />
    <span v-else class="emoji">{{ emoji }}</span>
  </div>
</template>

<style scoped>
.cover {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.cover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.25), transparent 50%);
  pointer-events: none;
  z-index: 2;
}
.skeleton {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.emoji {
  font-size: 30px;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.35));
}
.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.img.loaded {
  opacity: 1;
}
</style>
