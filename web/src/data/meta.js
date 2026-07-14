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
  { slug: 'crawfish', emoji: '🦞', name: '小龙虾' },
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
  { slug: 'crawfish', emoji: '🦞', name: '小龙虾' },
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

// 三个"转移注意力"按钮的反馈文案（每个 6 条，点击时随机取一条）
export const DISTRACT_HINTS = {
  '我先去喝杯水': [
    '好，去喝两口水。骑手会继续在路上。',
    '倒一杯温的，别急着灌。胃先醒过来。',
    '喝完这口，感觉一下饿不饿——很多时候只是渴。',
    '一小口就够。冲动跟渴意一样，会自己散。',
    '接完水回头看，那份外卖是不是已经没那么想吃了。',
    '水凉一点，头也就凉一点。',
  ],
  '我去刷个牙': [
    '刷牙是一个很强的暂停键。订单还会继续等你。',
    '一嘴薄荷味，再看菜单会自动皱眉的。',
    '刷完了嘴里就吃不下油腻。这是身体在帮你。',
    '牙膏味压过食欲，是最便宜的自律。',
    '两分钟计时器打开，认真刷完再回来。',
    '刷完牙的自己会更喜欢明天。',
  ],
  '我还是很想点': [
    {
      title: '没关系，冲动还在很正常。',
      body: '再等 3 分钟，还是想点，你再决定。这里不会阻止你，只是陪你把最上头的那一阵等过去。',
      cta: '继续等一会儿',
    },
    {
      title: '想点，是身体在说话。',
      body: '不一定是饿。可能是累、是无聊、是今天没被谁夸。先分辨一下，再决定要不要用一顿外卖回应它。',
      cta: '想想再说',
    },
    {
      title: '再看一眼菜单？',
      body: '看没关系。看和下单差一步——付款那一下才是决定。多看几分钟，看得腻了，冲动就走了。',
      cta: '继续看看',
    },
    {
      title: '你已经完成了 90%。',
      body: '想的动作、选的动作、加购的动作——爽的部分你都过完了。剩下 10% 是花钱和吃进胃，那部分明早会替你后悔。',
      cta: '就到这里吧',
    },
    {
      title: '想想明早的自己。',
      body: '早上七点醒来的那个人，胃胀、脸浮、账单又薄一层。他会不会谢谢现在的你？',
      cta: '为明早留一手',
    },
    {
      title: '这一份想念先存着。',
      body: '不是不吃，是不今晚吃。周末白天，光正好、胃口刚好、心情不慌的时候，再点这一份。你会更享受。',
      cta: '存到周末',
    },
  ],
}

// 订单备注（结算页固定显示）
export const ORDER_REMARK = '少放后悔，多放一点清醒'
export const COUPON_NAME = '今晚不点券'
