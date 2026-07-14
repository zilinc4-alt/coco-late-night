<script setup>
import { ref, watch, nextTick } from 'vue'
import QRCode from 'qrcode'

const props = defineProps({
  open: Boolean,
  order: Object, // { id, shopName, items, total }
  shop: Object, // { coverEmoji, coverGradient, category }
})
const emit = defineEmits(['close'])

const imageUrl = ref('')
const busy = ref(false)
const modalRef = ref(null)

const POSTER_W = 750
const POSTER_H = 1334
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://deepnight.icu'

const CATEGORY_TAGLINE = {
  bbq: '深夜的烟火气我没辜负',
  fried: '一口下去，把今天咽下',
  tea: '甜到掉线，也算关机',
  dessert: '给自己留一勺甜',
  malatang: '汤底一开，宇宙让路',
  burger: '双层的东西，配双倍疲惫',
  noodle: '被窝里，热汤三分钟',
  heavy: '重口味，是今晚的诚实',
  liquor: '一个人也可以慢慢喝',
}

async function draw() {
  if (!props.order || !props.shop) return
  busy.value = true
  await nextTick()

  // 提前生成二维码 dataURL
  const qrDataUrl = await QRCode.toDataURL(SITE_URL, {
    width: 240,
    margin: 1,
    color: { dark: '#14100b', light: '#ffd58a' },
    errorCorrectionLevel: 'M',
  })
  const qrImg = new Image()
  qrImg.src = qrDataUrl
  await new Promise((resolve) => {
    if (qrImg.complete) resolve()
    else qrImg.onload = resolve
  })

  const canvas = document.createElement('canvas')
  canvas.width = POSTER_W
  canvas.height = POSTER_H
  const ctx = canvas.getContext('2d')

  // 深色背景 + 光晕
  ctx.fillStyle = '#14100b'
  ctx.fillRect(0, 0, POSTER_W, POSTER_H)

  const glow1 = ctx.createRadialGradient(POSTER_W, 0, 0, POSTER_W, 0, 700)
  glow1.addColorStop(0, 'rgba(247, 181, 0, 0.32)')
  glow1.addColorStop(1, 'rgba(247, 181, 0, 0)')
  ctx.fillStyle = glow1
  ctx.fillRect(0, 0, POSTER_W, POSTER_H)

  const glow2 = ctx.createRadialGradient(0, POSTER_H, 0, 0, POSTER_H, 700)
  glow2.addColorStop(0, 'rgba(255, 138, 61, 0.24)')
  glow2.addColorStop(1, 'rgba(255, 138, 61, 0)')
  ctx.fillStyle = glow2
  ctx.fillRect(0, 0, POSTER_W, POSTER_H)

  // Header：品牌 + 订单号
  ctx.fillStyle = '#f5a63a'
  ctx.font = '600 26px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText('COCO 的深夜食堂', 60, 90)

  ctx.fillStyle = 'rgba(255,232,180,0.5)'
  ctx.font = '400 22px -apple-system, "PingFang SC", sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`订单 #${props.order.id}`, POSTER_W - 60, 90)
  ctx.textAlign = 'left'

  // 中间大字："我今晚幻想了" + 金额
  ctx.fillStyle = '#baa78a'
  ctx.font = '400 32px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText('我今晚幻想了', 60, 200)

  ctx.fillStyle = '#ffd58a'
  ctx.font = '900 160px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText(`¥${props.order.total}`, 60, 350)

  ctx.fillStyle = '#f5a63a'
  ctx.font = '700 42px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText('的外卖，但没吃', 60, 420)

  // 分类文案
  const tagline = CATEGORY_TAGLINE[props.shop.category] || '一次没扣钱的想念'
  ctx.fillStyle = '#fbe9c8'
  ctx.font = 'italic 400 30px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText(`"${tagline}"`, 60, 490)

  // 分割线
  ctx.strokeStyle = 'rgba(255,216,140,0.2)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(60, 550)
  ctx.lineTo(POSTER_W - 60, 550)
  ctx.stroke()

  // 店名
  ctx.fillStyle = '#baa78a'
  ctx.font = '400 24px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText('店铺', 60, 605)
  ctx.fillStyle = '#fbe9c8'
  ctx.font = '700 34px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText(props.shop.coverEmoji + ' ' + props.order.shopName, 60, 655)

  // 菜品列表（最多 5 道）
  ctx.fillStyle = '#baa78a'
  ctx.font = '400 24px -apple-system, "PingFang SC", sans-serif'
  ctx.fillText('这一单要过的瘾', 60, 730)

  const items = (props.order.items || []).slice(0, 5)
  let y = 780
  ctx.font = '500 28px -apple-system, "PingFang SC", sans-serif'
  for (const it of items) {
    ctx.fillStyle = '#fbe9c8'
    const name = it.qty > 1 ? `${it.name} ×${it.qty}` : it.name
    ctx.fillText(truncate(ctx, name, POSTER_W - 200), 60, y)
    ctx.fillStyle = '#f5a63a'
    ctx.textAlign = 'right'
    ctx.fillText(`¥${it.price * it.qty}`, POSTER_W - 60, y)
    ctx.textAlign = 'left'
    y += 54
  }
  const rest = (props.order.items || []).length - items.length
  if (rest > 0) {
    ctx.fillStyle = '#baa78a'
    ctx.font = '400 22px -apple-system, "PingFang SC", sans-serif'
    ctx.fillText(`还有 ${rest} 道也想过，就不列了`, 60, y)
    y += 40
  }

  // 底部条：居中大二维码 + 下方 caption
  const footY = POSTER_H - 220
  const footH = 200
  ctx.fillStyle = 'rgba(247, 181, 0, 0.14)'
  roundRect(ctx, 60, footY, POSTER_W - 120, footH, 20)
  ctx.fill()

  // 居中二维码，带白底
  const qrSize = 140
  const qrPad = 8
  const qrX = (POSTER_W - qrSize) / 2
  const qrY = footY + 16
  ctx.fillStyle = '#fbe9c8'
  roundRect(ctx, qrX - qrPad, qrY - qrPad, qrSize + qrPad * 2, qrSize + qrPad * 2, 10)
  ctx.fill()
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  // caption
  ctx.fillStyle = '#ffd58a'
  ctx.font = '700 24px -apple-system, "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('扫码打开 · deepnight.icu', POSTER_W / 2, footY + footH - 18)
  ctx.textAlign = 'left'

  // 输出为 png
  const dataUrl = canvas.toDataURL('image/png')
  imageUrl.value = dataUrl
  busy.value = false
}

function truncate(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text
  let out = text
  while (out.length > 0 && ctx.measureText(out + '…').width > maxWidth) {
    out = out.slice(0, -1)
  }
  return out + '…'
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

async function downloadPoster() {
  if (!imageUrl.value) return
  const a = document.createElement('a')
  a.href = imageUrl.value
  a.download = `coco-deepnight-${props.order.id}.png`
  a.click()
}

function close() {
  emit('close')
}

watch(
  () => props.open,
  (v) => {
    if (v) {
      imageUrl.value = ''
      draw()
      // 焦点移到弹窗内
      nextTick(() => {
        modalRef.value?.focus()
      })
    }
  },
)
</script>

<template>
  <transition name="fade">
    <div v-if="open" class="mask" role="dialog" aria-modal="true" aria-label="分享海报" @click.self="close">
      <div class="modal" ref="modalRef" tabindex="-1">
        <div class="modal-title">你的深夜订单海报</div>
        <div class="modal-hint">长按图片保存，或点下方按钮下载。分享给朋友，让 TA 也来做一单不会真送来的外卖。</div>

        <div class="poster-wrap">
          <img v-if="imageUrl" :src="imageUrl" alt="poster" class="poster-img" />
          <div v-else class="loading">画一下…</div>
        </div>

        <div class="actions">
          <button class="primary-button" :disabled="!imageUrl || busy" @click="downloadPoster">下载海报</button>
          <button class="secondary-button" @click="close">再等等</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  backdrop-filter: blur(6px);
}
.modal {
  width: 100%;
  max-width: 440px;
  background: var(--bg-card);
  border: 1px solid var(--border-strong);
  border-radius: 20px;
  padding: 20px 16px 24px;
  max-height: 92vh;
  overflow-y: auto;
}
.modal-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--fg);
  margin-bottom: 6px;
}
.modal-hint {
  font-size: 12px;
  color: var(--fg-muted);
  line-height: 1.7;
  margin-bottom: 16px;
}
.poster-wrap {
  border-radius: 14px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.poster-img {
  width: 100%;
  height: auto;
  display: block;
}
.loading {
  color: var(--fg-muted);
  font-size: 14px;
  padding: 40px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
