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
function onError() {
  failed.value = true
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
    <img
      v-if="image && !failed"
      class="img"
      :src="image"
      :alt="emoji"
      loading="lazy"
      @error="onError"
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
}
</style>
