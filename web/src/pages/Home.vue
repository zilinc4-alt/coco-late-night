<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order.js'
import { useJournalStore } from '../stores/journal.js'

const router = useRouter()
const order = useOrderStore()
const journal = useJournalStore()

const hasJournal = computed(() => journal.total > 0)

const totalMoney = computed(() => journal.totalMoney)
const monthTotal = computed(() => journal.monthTotal)
const totalKcal = computed(() => journal.totalCalories)
const topCategory = computed(() => journal.topCategory)
const topHour = computed(() => journal.topHour)

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
    <!-- 深夜档案面板（下过单后显示） -->
    <div v-if="hasJournal" class="hero-card journal-card">
      <div class="journal-header">
        <div class="journal-eyebrow">你的深夜档案</div>
        <div class="journal-count">已幻想 <b>{{ journal.total }}</b> 次</div>
      </div>

      <div class="stat-grid">
        <div class="stat">
          <div class="stat-label">本月幻想</div>
          <div class="stat-value">{{ monthTotal }}<span class="stat-unit">次</span></div>
        </div>
        <div class="stat">
          <div class="stat-label">累计假付</div>
          <div class="stat-value accent">¥{{ totalMoney }}</div>
        </div>
        <div class="stat">
          <div class="stat-label">省下热量</div>
          <div class="stat-value">{{ Math.round(totalKcal / 100) / 10 }}<span class="stat-unit">k kcal</span></div>
        </div>
        <div class="stat">
          <div class="stat-label">最馋的品类</div>
          <div class="stat-value small">{{ topCategory ? topCategory.label : '—' }}</div>
        </div>
      </div>

      <div v-if="topHour" class="journal-foot">
        你最常在 <b>{{ topHour.label }}</b> 想点，那时的你要不要试试先喝口水。
      </div>
    </div>

    <!-- 初次访问 hero -->
    <div v-else class="hero-card">
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
  color: rgba(58, 42, 21, 0.7);
  margin-bottom: 2px;
}
.badge-value {
  font-size: 15px;
  font-weight: 800;
}

/* 深夜档案面板 */
.journal-card {
  height: auto;
  padding: 20px;
  background:
    radial-gradient(circle at 100% 0%, rgba(247, 181, 0, 0.32) 0%, transparent 50%),
    radial-gradient(circle at 0% 100%, rgba(255, 138, 61, 0.20) 0%, transparent 55%),
    linear-gradient(135deg, #251a10 0%, #14100b 100%);
  border: 1px solid rgba(255, 216, 140, 0.16);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
}
.journal-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}
.journal-eyebrow {
  color: var(--primary-1);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.journal-count {
  color: #fbe9c8;
  font-size: 12px;
}
.journal-count b {
  color: var(--primary-1);
  font-size: 15px;
  font-weight: 800;
  margin: 0 2px;
}
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.stat {
  background: rgba(255, 216, 140, 0.06);
  border: 1px solid rgba(255, 216, 140, 0.09);
  border-radius: 10px;
  padding: 12px 14px;
}
.stat-label {
  color: #baa78a;
  font-size: 11px;
  margin-bottom: 4px;
}
.stat-value {
  color: #fbe9c8;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.stat-value.accent {
  color: var(--primary-1);
}
.stat-value.small {
  font-size: 16px;
}
.stat-unit {
  font-size: 12px;
  font-weight: 500;
  color: #baa78a;
  margin-left: 3px;
}
.journal-foot {
  margin-top: 14px;
  color: #baa78a;
  font-size: 12px;
  line-height: 1.7;
}
.journal-foot b {
  color: var(--primary-1);
  font-weight: 700;
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
