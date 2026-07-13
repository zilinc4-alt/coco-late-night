<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order.js'
import { DISTRACT_HINTS } from '../data/meta.js'

const router = useRouter()
const order = useOrderStore()
let timer = null

onMounted(() => {
  if (!order.current) {
    router.replace('/home')
    return
  }
  timer = setInterval(() => order.tick(1), 1000)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const minutes = computed(() => Math.floor(order.remainingSeconds / 60))
const seconds = computed(() => order.remainingSeconds % 60)
const pct = computed(() => order.progressPct)

// 骑手在地图上的位置：从左下 → 右上 沿 L 形路径
const riderStyle = computed(() => {
  const p = pct.value / 100
  // 前 60% 沿底部横向移动，后 40% 沿右侧竖向上升
  let x, y
  if (p < 0.6) {
    x = 12 + (p / 0.6) * 60 // 12% → 72%
    y = 72
  } else {
    x = 72
    y = 72 - ((p - 0.6) / 0.4) * 60 // 72% → 12%
  }
  return { left: `${x}%`, top: `${y}%` }
})

// 虚线路径：L 形，跟 rider 的路径一致
const pathD = 'M 12 72 L 72 72 L 72 12'

// 三个按钮状态
const toast = ref('')
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2600)
}

const showDialog = ref(false)

function pickWater() {
  showToast(DISTRACT_HINTS['我先去喝杯水'])
}
function pickTeeth() {
  showToast(DISTRACT_HINTS['我去刷个牙'])
}
function pickStill() {
  showDialog.value = true
}
function closeDialog() {
  showDialog.value = false
}
</script>

<template>
  <div v-if="order.current" class="page waiting-page">
    <!-- 订单卡 -->
    <div class="card order-card">
      <div class="order-id">订单 #{{ order.current.id }}</div>
      <h2 class="wait-title">骑手正在赶来</h2>
      <p class="wait-desc">你的订单已经生成。现在最重要的不是吃到它，而是等一等。</p>

      <div class="countdown">
        <div class="cd-label">预计</div>
        <div class="cd-value">
          <span class="cd-num">{{ minutes }}</span> 分
          <span class="cd-num">{{ seconds.toString().padStart(2, '0') }}</span> 秒
        </div>
        <div class="cd-label">后送达</div>
      </div>

      <div class="rider-line">
        <span>骑手：{{ order.current.riderName }}</span>
        <span class="rider-pct">{{ pct }}%</span>
      </div>
    </div>

    <!-- 地图 -->
    <div class="card map-card">
      <div class="map">
        <!-- 网格 -->
        <svg class="grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="12.5" height="12.5" patternUnits="userSpaceOnUse">
              <path d="M 12.5 0 L 0 0 0 12.5" fill="none" stroke="rgba(107,76,30,.08)" stroke-width="0.3" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <!-- 虚线路径 -->
          <path
            :d="pathD"
            stroke="rgba(217,122,46,.55)"
            stroke-width="0.6"
            stroke-dasharray="1.5 1.5"
            fill="none"
          />
        </svg>

        <!-- 你 -->
        <div class="pin you-pin">
          <div class="pin-label">你</div>
          <div class="pin-dot"></div>
        </div>
        <!-- 店 -->
        <div class="pin shop-pin">
          <div class="pin-label">店</div>
          <div class="pin-dot shop-dot"></div>
        </div>
        <!-- 骑手 -->
        <div class="rider" :style="riderStyle">🛵</div>
      </div>
    </div>

    <!-- 三个按钮 -->
    <div class="actions">
      <button class="secondary-button" @click="pickWater">我先去喝杯水</button>
      <button class="secondary-button" @click="pickTeeth">我去刷个牙</button>
      <button class="secondary-button" @click="pickStill">我还是很想点</button>
    </div>

    <p class="foot-note">这单不会产生真实配送，你只需要陪这个冲动待一会儿。</p>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>

    <!-- 冲动对话框 -->
    <transition name="fade">
      <div v-if="showDialog" class="dialog-mask" @click.self="closeDialog">
        <div class="dialog card">
          <div class="dialog-title">{{ DISTRACT_HINTS['我还是很想点'].title }}</div>
          <p class="dialog-body">{{ DISTRACT_HINTS['我还是很想点'].body }}</p>
          <button class="primary-button" @click="closeDialog">
            {{ DISTRACT_HINTS['我还是很想点'].cta }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.waiting-page {
  padding-bottom: 60px;
}
.order-card {
  padding: 20px 16px;
  margin-bottom: 16px;
}
.order-id {
  color: var(--accent);
  font-weight: 700;
  font-size: 13px;
  margin-bottom: 8px;
}
.wait-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 8px;
}
.wait-desc {
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 16px;
}
.countdown {
  background: rgba(247, 181, 0, 0.12);
  border: 1px solid rgba(247, 181, 0, 0.32);
  border-radius: var(--radius-md);
  padding: 16px;
  margin-bottom: 12px;
}
.cd-label {
  color: var(--fg-muted);
  font-size: 12px;
}
.cd-value {
  color: var(--fg);
  font-size: 18px;
  font-weight: 600;
  margin: 4px 0;
}
.cd-num {
  color: var(--accent);
  font-size: 42px;
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0 4px;
  font-variant-numeric: tabular-nums;
}
.rider-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--fg-muted);
  font-size: 13px;
}
.rider-pct {
  color: var(--accent);
  font-weight: 700;
}

.map-card {
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
}
.map {
  position: relative;
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #fff7de 0%, #fbe6a8 100%);
}
.grid-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.pin {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.you-pin {
  right: 20%;
  top: 8%;
}
.shop-pin {
  left: 8%;
  bottom: 20%;
}
.pin-label {
  padding: 4px 10px;
  background: #3a2a15;
  color: #fff8ea;
  font-size: 12px;
  font-weight: 700;
  border-radius: 6px;
  margin-bottom: 4px;
  box-shadow: 0 2px 4px rgba(58, 42, 21, 0.2);
}
.pin-dot {
  width: 8px;
  height: 8px;
  background: #3a2a15;
  border-radius: 50%;
}
.shop-dot {
  background: var(--accent);
  width: 12px;
  height: 12px;
  box-shadow: 0 0 12px rgba(217, 122, 46, 0.6);
}
.rider {
  position: absolute;
  font-size: 24px;
  transform: translate(-50%, -50%);
  transition: left 0.9s linear, top 0.9s linear;
  filter: drop-shadow(0 4px 6px rgba(107, 76, 30, 0.18));
  z-index: 2;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}
.foot-note {
  color: var(--fg-dim);
  font-size: 12px;
  text-align: center;
  line-height: 1.6;
  margin: 12px 0 0;
}

.dialog-mask {
  position: fixed;
  inset: 0;
  background: rgba(58, 42, 21, 0.5);
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
}
.dialog {
  width: 100%;
  max-width: 428px;
  padding: 20px;
  margin-bottom: 16px;
}
.dialog-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}
.dialog-body {
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.7;
  margin: 0 0 16px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
