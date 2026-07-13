<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order.js'

const router = useRouter()
const order = useOrderStore()

const badgeLabel = computed(() => (order.current ? '你今晚幻想过' : '今晚订单'))
const badgeValue = computed(() =>
  order.current ? `¥${order.current.total} 已幻想` : '¥0 已支付',
)

function startOrder() {
  router.push('/restaurants/bbq')
}
</script>

<template>
  <div class="page home">
    <div class="hero-card">
      <div class="phone-glyph">
        <div class="stripe stripe-1"></div>
        <div class="stripe stripe-2"></div>
      </div>
      <div class="glow"></div>
      <div class="badge">
        <div class="badge-label">{{ badgeLabel }}</div>
        <div class="badge-value">{{ badgeValue }}</div>
      </div>
    </div>

    <div class="eyebrow">COCO 的深夜食堂</div>
    <h1 class="page-title">今晚想点外卖吗？</h1>
    <p class="subhead">
      想点，但又不想真的点？<br />
      先在这里馋一下，等冲动过去。
    </p>

    <button class="primary-button" @click="startOrder">开始点单</button>

    <p class="footer-note">
      不会花钱，不会下单，不会真的送来。<br />
      但你可以完整体验一次"想点外卖"的过程。
    </p>

    <div class="footer-block">
      <div class="footer-title">这不是戒掉快乐</div>
      <p>只是把最上头的那几分钟，放到一个不会扣钱、不会摄入、不会打扰睡眠的地方。</p>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 20px 16px 60px;
}
.hero-card {
  position: relative;
  height: 220px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #fff2c9 0%, #ffd479 55%, #f5a63a 100%);
  border: 1px solid rgba(247, 181, 0, 0.28);
  overflow: hidden;
  margin-bottom: 24px;
  box-shadow: 0 10px 28px rgba(247, 181, 0, 0.18);
}
.phone-glyph {
  position: absolute;
  left: 20px;
  top: 30px;
  bottom: 20px;
  width: 130px;
  background: #fffcf3;
  border-radius: 18px;
  transform: rotate(-8deg);
  box-shadow: 0 10px 30px rgba(107, 76, 30, 0.15);
  padding: 30px 18px;
}
.stripe {
  height: 14px;
  border-radius: 4px;
  background: rgba(107, 76, 30, 0.14);
  margin-bottom: 12px;
}
.stripe-1 {
  width: 70%;
  background: rgba(247, 181, 0, 0.7);
}
.stripe-2 {
  width: 55%;
}
.glow {
  position: absolute;
  right: -30px;
  top: -30px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(255, 246, 205, 0.85), transparent 70%);
  filter: blur(20px);
}
.badge {
  position: absolute;
  right: 20px;
  bottom: 30px;
  background: #fffcf3;
  border-radius: 10px;
  padding: 10px 16px;
  color: #3a2a15;
  box-shadow: 0 6px 14px rgba(107, 76, 30, 0.14);
}
.badge-label {
  font-size: 11px;
  color: var(--fg-muted);
  margin-bottom: 2px;
}
.badge-value {
  font-size: 15px;
  font-weight: 800;
}
h1.page-title {
  font-size: 32px;
}
.footer-note {
  color: var(--fg-dim);
  font-size: 12px;
  line-height: 1.7;
  margin: 24px 0 32px;
}
.footer-block {
  padding: 20px 0;
  border-top: 1px solid var(--border-soft);
}
.footer-title {
  color: var(--accent);
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 10px;
}
.footer-block p {
  color: var(--fg-muted);
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}
</style>
