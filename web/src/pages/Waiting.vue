<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order.js'
import { DISTRACT_HINTS } from '../data/meta.js'
import { SHOPS } from '../data/shops.js'
import SharePoster from '../components/SharePoster.vue'

const router = useRouter()
const order = useOrderStore()
let timer = null

const shopForPoster = computed(() => {
  if (!order.current) return null
  return SHOPS.find((s) => s.name === order.current.shopName) || null
})

const showSharePoster = ref(false)
function openShare() {
  showSharePoster.value = true
}
function closeShare() {
  showSharePoster.value = false
}

onMounted(() => {
  if (!order.current) {
    router.replace('/home')
    return
  }
  timer = setInterval(() => {
    order.tick(1)
    maybeSpawnEvent()
  }, 1000)
  document.addEventListener('keydown', onKeyDown)
  window.addEventListener('beforeunload', onBeforeUnload)
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (eventTimer) clearTimeout(eventTimer)
  document.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})

function onBeforeUnload() {
  order.flush()
}

function onKeyDown(e) {
  if (e.key === 'Escape') {
    if (showDialog.value) closeDialog()
    if (showSharePoster.value) closeShare()
  }
}

const minutes = computed(() => Math.floor(order.remainingSeconds / 60))
const seconds = computed(() => order.remainingSeconds % 60)
const pct = computed(() => order.progressPct)

/* ---------- 用订单号做随机种子（同一订单地图稳定） ---------- */
function seededRand(seed) {
  let s = seed | 0
  return () => {
    s = (s * 1664525 + 1013904223) | 0
    return ((s >>> 0) % 10000) / 10000
  }
}
const seed = Number(order.current?.id || '12345')
const rand = seededRand(seed)
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)]
}

/* ---------- 路径变体（用 SVG path 走骑手） ---------- */
// 每种路径都在 100x100 坐标里，从"店"(左下) → "你"(右上)
const PATH_VARIANTS = [
  { name: 'L 形（走大路）', d: 'M 12 82 L 72 82 L 72 14', legs: [[12, 82, 72, 82], [72, 82, 72, 14]] },
  { name: 'Z 字（拐了个弯）', d: 'M 12 82 L 50 82 L 50 40 L 82 40 L 82 14', legs: [[12, 82, 50, 82], [50, 82, 50, 40], [50, 40, 82, 40], [82, 40, 82, 14]] },
  { name: 'U 形（绕远了）', d: 'M 12 82 L 12 50 L 50 50 L 82 50 L 82 14', legs: [[12, 82, 12, 50], [12, 50, 50, 50], [50, 50, 82, 50], [82, 50, 82, 14]] },
  { name: 'N 形（骑手迷路）', d: 'M 12 82 L 30 40 L 60 82 L 82 14', legs: [[12, 82, 30, 40], [30, 40, 60, 82], [60, 82, 82, 14]] },
  { name: '斜线（今晚是老手）', d: 'M 12 82 L 82 14', legs: [[12, 82, 82, 14]] },
]
const routeVariant = pick(PATH_VARIANTS)

// 计算沿多段折线走过 p (0..1) 的位置
function pointAt(p) {
  const legs = routeVariant.legs
  const lens = legs.map(([x1, y1, x2, y2]) => Math.hypot(x2 - x1, y2 - y1))
  const total = lens.reduce((a, b) => a + b, 0)
  let d = p * total
  for (let i = 0; i < legs.length; i++) {
    if (d <= lens[i] || i === legs.length - 1) {
      const [x1, y1, x2, y2] = legs[i]
      const t = Math.max(0, Math.min(1, d / lens[i]))
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t }
    }
    d -= lens[i]
  }
  return { x: 82, y: 14 }
}

const riderStyle = computed(() => {
  const { x, y } = pointAt(pct.value / 100)
  return { left: `${x}%`, top: `${y}%` }
})

/* ---------- 地标池：随机放几个 ---------- */
const LANDMARK_POOL = [
  { icon: '🏪', name: '深夜便利店' },
  { icon: '⛽', name: '加油站' },
  { icon: '🌉', name: '过江桥' },
  { icon: '🌳', name: '街心公园' },
  { icon: '🚦', name: '红绿灯路口' },
  { icon: '🏥', name: '24h 药店' },
  { icon: '🐕', name: '流浪狗聚点' },
  { icon: '🍜', name: '路边摊' },
  { icon: '🏫', name: '母校后门' },
  { icon: '🎢', name: '空荡游乐场' },
  { icon: '⛲', name: '喷水池' },
  { icon: '📮', name: '老邮筒' },
  { icon: '🚧', name: '路修了一半' },
  { icon: '🌙', name: '看月亮的天台' },
  { icon: '🐈', name: '橘猫盘踞' },
  { icon: '🎡', name: '不转的摩天轮' },
  { icon: '🎸', name: '街头卖唱人' },
  { icon: '🕳️', name: '据说通向异世界' },
]
// 随机挑 4-5 个地标，位置在网格内且远离两个 pin 和路径
function pickLandmarks() {
  const pool = [...LANDMARK_POOL].sort(() => rand() - 0.5)
  const chosen = []
  const forbidden = [
    { x: 12, y: 82 }, // 店
    { x: 82, y: 14 }, // 你
  ]
  const count = 4 + Math.floor(rand() * 2) // 4 or 5
  for (const item of pool) {
    if (chosen.length >= count) break
    // 尝试 8 个候选点
    for (let t = 0; t < 8; t++) {
      const x = 10 + rand() * 80
      const y = 10 + rand() * 80
      const tooClose = forbidden.some((f) => Math.hypot(f.x - x, f.y - y) < 18)
      if (!tooClose) {
        chosen.push({ ...item, x, y })
        forbidden.push({ x, y })
        break
      }
    }
  }
  return chosen
}
const landmarks = pickLandmarks()

/* ---------- 街道名（顶部标注） ---------- */
const STREET_NAMES = [
  '晚风巷',
  '银河路 88 号',
  '不眠街',
  '一碗汤路',
  '八点半后街',
  '橘子皮小道',
  '拐角处 4°',
  '被窝三巷',
  '路灯下 7 号',
  '下班路 233',
]
const streetName = pick(STREET_NAMES)

/* ---------- 骑手偶发事件（气泡） ---------- */
const EVENTS = [
  '骑手遇到红灯，正在盯着倒计时',
  '骑手停下拍了张月亮',
  '骑手在便利店门口犹豫要不要买瓶水',
  '骑手好像走错了一个路口',
  '骑手被一只橘猫拦住了',
  '骑手在等一个横穿马路的老爷爷',
  '骑手车筐里的餐晃了一下，稳住了',
  '骑手接了个电话，说"马上就到"',
  '骑手骂了一句"这什么破导航"',
  '骑手在数第几个红绿灯',
  '骑手在唱一首没人听的歌',
  '骑手闻了一下你的餐',
  '骑手把外套拉链拉高了一格',
  '骑手看了一眼手机，1% 电',
]
const currentEvent = ref('')
let eventTimer = null
let lastEventAt = 0
function maybeSpawnEvent() {
  const elapsed = order.current?.elapsedSeconds || 0
  // 每 20~30s 触发一次事件，事件持续 5s
  if (elapsed - lastEventAt < 18 + Math.floor(rand() * 12)) return
  lastEventAt = elapsed
  currentEvent.value = pick(EVENTS)
  clearTimeout(eventTimer)
  eventTimer = setTimeout(() => (currentEvent.value = ''), 5200)
}

/* ---------- 按钮弹层 ---------- */
const toast = ref('')
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2600)
}
const showDialog = ref(false)
const dialogContent = ref({ title: '', body: '', cta: '' })

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function pickWater() {
  showToast(pickRandom(DISTRACT_HINTS['我先去喝杯水']))
}
function pickTeeth() {
  showToast(pickRandom(DISTRACT_HINTS['我去刷个牙']))
}
function pickStill() {
  dialogContent.value = pickRandom(DISTRACT_HINTS['我还是很想点'])
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
      <div class="map-header">
        <span class="map-street">📍 {{ streetName }} 附近</span>
        <span class="map-route">路线：{{ routeVariant.name }}</span>
      </div>
      <div class="map" role="img" :aria-label="`配送路线图：从${order.current.shopName}到你，路线为${routeVariant.name}，${streetName}附近`">
        <!-- 网格 + 装饰 -->
        <svg class="grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(107,76,30,.08)" stroke-width="0.25" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <!-- 主干路 淡阴影 -->
          <path
            :d="routeVariant.d"
            stroke="rgba(217,122,46,.18)"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
          />
          <!-- 虚线路径 -->
          <path
            :d="routeVariant.d"
            stroke="rgba(217,122,46,.75)"
            stroke-width="0.7"
            stroke-dasharray="1.6 1.6"
            stroke-linecap="round"
            fill="none"
          />
        </svg>

        <!-- 地标 -->
        <div
          v-for="(lm, i) in landmarks"
          :key="i"
          class="landmark"
          :style="{ left: lm.x + '%', top: lm.y + '%' }"
        >
          <div class="lm-icon">{{ lm.icon }}</div>
          <div class="lm-name">{{ lm.name }}</div>
        </div>

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
        <div class="rider" :style="riderStyle">
          <div class="rider-glyph">🛵</div>
          <transition name="bubble">
            <div v-if="currentEvent" class="rider-bubble">{{ currentEvent }}</div>
          </transition>
        </div>
      </div>
    </div>

    <!-- 三个按钮 -->
    <div class="actions">
      <button class="primary-button share-btn" @click="openShare">生成我的深夜订单海报</button>
      <button class="secondary-button" @click="pickWater">我先去喝杯水</button>
      <button class="secondary-button" @click="pickTeeth">我去刷个牙</button>
      <button class="secondary-button" @click="pickStill">我还是很想点</button>
    </div>

    <p class="foot-note">这单不会产生真实配送，你只需要陪这个冲动待一会儿。</p>

    <!-- Toast -->
    <div v-if="toast" class="toast">{{ toast }}</div>

    <!-- 冲动对话框 -->
    <transition name="fade">
      <div v-if="showDialog" class="dialog-mask" role="dialog" aria-modal="true" aria-labelledby="dialog-title" @click.self="closeDialog">
        <div class="dialog card">
          <div class="dialog-title" id="dialog-title">{{ dialogContent.title }}</div>
          <p class="dialog-body">{{ dialogContent.body }}</p>
          <button class="primary-button" @click="closeDialog">
            {{ dialogContent.cta }}
          </button>
        </div>
      </div>
    </transition>

    <!-- 分享海报 -->
    <SharePoster
      :open="showSharePoster"
      :order="order.current"
      :shop="shopForPoster"
      @close="closeShare"
    />
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
.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 245, 210, 0.7);
  border-bottom: 1px dashed rgba(217, 122, 46, 0.25);
  font-size: 12px;
}
.map-street {
  color: var(--fg);
  font-weight: 700;
}
.map-route {
  color: var(--fg-muted);
  font-weight: 600;
}
.map {
  position: relative;
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #fff7de 0%, #fbe6a8 100%);
  overflow: hidden;
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
  z-index: 3;
}
.you-pin {
  right: 12%;
  top: 8%;
}
.shop-pin {
  left: 8%;
  bottom: 12%;
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

.landmark {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: none;
  z-index: 2;
}
.lm-icon {
  font-size: 20px;
  filter: drop-shadow(0 2px 3px rgba(107, 76, 30, 0.2));
}
.lm-name {
  font-size: 9px;
  color: #6b4c1e;
  background: rgba(255, 249, 224, 0.85);
  padding: 1px 5px;
  border-radius: 4px;
  white-space: nowrap;
  font-weight: 600;
}

.rider {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: left 0.9s linear, top 0.9s linear;
  z-index: 4;
}
.rider-glyph {
  font-size: 26px;
  filter: drop-shadow(0 4px 6px rgba(107, 76, 30, 0.25));
  animation: wobble 1.6s ease-in-out infinite;
}
@keyframes wobble {
  0%, 100% { transform: rotate(-4deg); }
  50% { transform: rotate(4deg); }
}
.rider-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, -6px);
  background: #3a2a15;
  color: #fff8ea;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  padding: 6px 10px;
  border-radius: 10px;
  white-space: nowrap;
  max-width: 180px;
  box-shadow: 0 6px 14px rgba(58, 42, 21, 0.3);
}
.rider-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -4px;
  border: 4px solid transparent;
  border-top-color: #3a2a15;
}
.bubble-enter-active,
.bubble-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translate(-50%, 0);
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
