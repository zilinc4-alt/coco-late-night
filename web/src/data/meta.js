// 分类：顺序决定 tab 显示顺序
export const CATEGORIES = [
  { slug: 'new', emoji: '✨', name: '新店' },
  { slug: 'bbq', emoji: '🔥', name: '烧烤' },
  { slug: 'fried', emoji: '🍗', name: '炸鸡' },
  { slug: 'tea', emoji: '🧋', name: '奶茶' },
  { slug: 'liquor', emoji: '🍺', name: '深夜小酒' },
  { slug: 'dessert', emoji: '🍰', name: '甜品' },
  { slug: 'malatang', emoji: '🌶️', name: '麻辣烫' },
  { slug: 'burger', emoji: '🍔', name: '汉堡薯条' },
  { slug: 'noodle', emoji: '🍜', name: '泡面夜宵' },
  { slug: 'heavy', emoji: '🥘', name: '随便来点重口的' },
]

// 用于开店表单的分类下拉（多加个"混合夜宵"）
export const SHOP_CATEGORIES = [
  { slug: 'bbq', emoji: '🔥', name: '烧烤' },
  { slug: 'fried', emoji: '🍗', name: '炸鸡' },
  { slug: 'tea', emoji: '🧋', name: '奶茶' },
  { slug: 'liquor', emoji: '🍺', name: '深夜小酒' },
  { slug: 'malatang', emoji: '🌶️', name: '麻辣烫' },
  { slug: 'burger', emoji: '🍔', name: '汉堡薯条' },
  { slug: 'dessert', emoji: '🍰', name: '甜品' },
  { slug: 'noodle', emoji: '🍜', name: '泡面夜宵' },
  { slug: 'heavy', emoji: '🥘', name: '混合夜宵' },
]

// 地址梗（结算页下拉）
export const ADDRESSES = [
  '我的深夜情绪收件处',
  '明早不会后悔小区',
  '被窝 3 号楼',
  '理智恢复中心',
]

// 骑手名字（等待页随机）
export const RIDER_NAMES = ['小冷静', '小理智', '小清醒', '小暂停', '小别急', '小再等等']

// 三个"转移注意力"按钮的反馈文案
export const DISTRACT_HINTS = {
  '我先去喝杯水': '好，去喝两口水。骑手会继续在路上。',
  '我去刷个牙': '刷牙是一个很强的暂停键。订单还会继续等你。',
  '我还是很想点': {
    title: '没关系，冲动还在很正常。',
    body: '再等 3 分钟，还是想点，你再决定。这里不会阻止你，只是陪你把最上头的那一阵等过去。',
    cta: '继续等一会儿',
  },
}

// 订单备注（结算页固定显示）
export const ORDER_REMARK = '少放后悔，多放一点清醒'
export const COUPON_NAME = '今晚不点券'
