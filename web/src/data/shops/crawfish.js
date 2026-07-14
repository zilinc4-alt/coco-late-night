import { img } from './_img.js'

export const crawfish = [
  {
    slug: 'crawfish-corner',
    name: '小龙虾深夜局',
    category: 'crawfish',
    desc: '虾壳剥开的那一下，今天的所有壳也都放下了。',
    tags: ['现炒现剥', '辣到指头疼', '手套管够', '开到凌晨'],
    rating: 4.9,
    monthSold: '8300+',
    avgPrice: 88,
    eta: [35, 50],
    isNew: false,
    coverGradient: ['#a62818', '#e05030'],
    coverEmoji: '🦞',
    image: img('crawfish,spicy-seafood', 810),
    dishes: [
      // 招牌
      { g: '招牌', name: '麻辣小龙虾（一斤）', desc: '一斤起点，第一只壳是你剥的，剩下的就停不下来。', price: 68, sold: 2800, image: img('spicy-crawfish-bowl', 811) },
      { g: '招牌', name: '蒜蓉小龙虾（一斤）', desc: '蒜香冲到鼻腔，比任何一剂清醒都管用。', price: 72, sold: 2100, image: img('garlic-crawfish', 812) },
      { g: '招牌', name: '十三香小龙虾（大份）', desc: '十三种香料在舌尖轮番上场，复杂得刚刚好。', price: 88, sold: 1600, image: img('thirteen-spice-crawfish', 813) },
      { g: '招牌', name: '油焖小龙虾（一斤半）', desc: '虾黄流出来的瞬间，今天没白撑。', price: 98, sold: 940, image: img('braised-crawfish', 814) },
      { g: '招牌', name: '清蒸小龙虾（一斤）', desc: '什么都不蘸，就尝一口虾肉本身的甜。', price: 78, sold: 560, image: img('steamed-crawfish', 822) },
      { g: '招牌', name: '咸蛋黄小龙虾（一斤）', desc: '沙沙的咸蛋黄裹住虾壳，舔手指比吃还满足。', price: 88, sold: 720, image: img('salted-egg-crawfish', 825) },
      { g: '招牌', name: '香辣虾球', desc: '去头掐尾只留最圆那段，像今晚只留最爽的部分。', price: 58, sold: 1400, image: img('spicy-crawfish-ball', 826) },
      { g: '招牌', name: '紫苏爆炒小龙虾', desc: '紫苏叶一激，辣和鲜同时冲到头。', price: 82, sold: 680, image: img('perilla-crawfish-stir-fry', 827) },
      { g: '招牌', name: '冰镇小龙虾拼盘', desc: '热的吃多了，来一盘冷浸的。适合收尾。', price: 108, sold: 420, image: img('iced-crawfish-platter', 828) },

      // 小吃
      { g: '小吃', name: '虾黄拌面', desc: '虾黄的鲜和面的筋道，替你把最后一口气续上。', price: 22, sold: 1800, image: img('crawfish-roe-noodle', 815) },
      { g: '小吃', name: '椒盐虾尾', desc: '一盘虾尾，不用剥头，只吃最好的那一段。', price: 38, sold: 1200, image: img('salt-pepper-crawfish-tail', 816) },
      { g: '小吃', name: '凉拌毛豆', desc: '旁边那盘绿色，是陪你剥虾的配角。', price: 12, sold: 2200, image: img('edamame-cold-dish', 817) },
      { g: '小吃', name: '手撕蒜香饼', desc: '一块饼撕开，蘸虾汤，比说话更管用。', price: 15, sold: 1100, image: img('garlic-flatbread', 823) },
      { g: '小吃', name: '油炸小馒头配炼乳', desc: '第一口脆，第二口甜，第三口把辣一起咽下去。', price: 12, sold: 1600, image: img('fried-bun-condensed-milk', 829) },
      { g: '小吃', name: '烤馒头片（蒜香）', desc: '炭火烤出来的焦脆，比什么都踏实。', price: 10, sold: 980, image: img('grilled-bun-garlic', 830) },
      { g: '小吃', name: '凉皮一份', desc: '细细滑滑，把嘴里最后那点辣意卷走。', price: 16, sold: 880, image: img('cold-skin-noodle', 831) },
      { g: '小吃', name: '拍黄瓜（多蒜多醋）', desc: '咔嚓一口下去，舌头终于醒了。', price: 10, sold: 1400, image: img('smashed-cucumber-spicy', 832) },

      // 配菜
      { g: '配菜', name: '加一份虾', desc: '再来半斤，反正手套还没摘。', price: 38, sold: 3200, image: img('extra-crawfish-half-pound', 833) },
      { g: '配菜', name: '加一份年糕', desc: '软糯的年糕吸饱了虾汤，比虾还抢手。', price: 12, sold: 2600, image: img('rice-cake-side', 834) },
      { g: '配菜', name: '加一份土豆', desc: '煮到绵软的土豆，每一块都浸透了汤汁。', price: 10, sold: 2400, image: img('potato-chunk-side', 835) },
      { g: '配菜', name: '加一份藕片', desc: '脆藕吸了辣油，咬下去咔嚓和滋啦同时发生。', price: 12, sold: 1800, image: img('lotus-root-side', 836) },
      { g: '配菜', name: '加一份玉米', desc: '甜玉米段，是红油里的一抹喘息。', price: 10, sold: 1500, image: img('corn-cob-side', 837) },
      { g: '配菜', name: '加一份鹌鹑蛋', desc: '剥完虾壳，再来几个圆滚滚的小家伙。', price: 14, sold: 1100, image: img('quail-egg-side', 838) },

      // 主食
      { g: '主食', name: '小龙虾炒饭', desc: '虾肉颗粒在饭里时隐时现，像今晚的记忆。', price: 32, sold: 880, image: img('crawfish-fried-rice', 821) },
      { g: '主食', name: '虾汤捞面', desc: '一碗面泡在虾汤里，吃完只想把碗舔一遍。', price: 24, sold: 1200, image: img('crawfish-broth-noodle', 839) },
      { g: '主食', name: '小龙虾盖饭', desc: '虾肉浇在白米饭上，每一勺都有料。', price: 36, sold: 760, image: img('crawfish-rice-bowl', 840) },
      { g: '主食', name: '虾油拌粉', desc: '虾头的油拌进米粉，香到不想跟任何人说话。', price: 20, sold: 640, image: img('crawfish-oil-rice-noodle', 841) },

      // 饮品
      { g: '饮品', name: '冰镇扎啤', desc: '辣到耳朵红了，灌一口冰的降降温。', price: 18, sold: 2600, image: img('draft-beer-mug-cold', 818) },
      { g: '饮品', name: '酸梅汤', desc: '酸酸凉凉，把辣意从舌尖赶走。', price: 10, sold: 1900, image: img('sour-plum-drink', 819) },
      { g: '饮品', name: '柠檬冰水', desc: '一杯简单到不需要解释的解辣水。', price: 6, sold: 1500, image: img('lemon-ice-water', 820) },
      { g: '饮品', name: '冰绿豆汤', desc: '一碗下去，火气辣气全歇了。', price: 8, sold: 1300, image: img('mung-bean-soup-iced', 824) },
      { g: '饮品', name: '冰镇杨梅汁', desc: '暗红色一杯，酸甜像小时候的夏天。', price: 12, sold: 980, image: img('bayberry-juice-iced', 842) },
      { g: '饮品', name: '椰青冰美式', desc: '咖啡因和椰香，剥虾也能提神。', price: 22, sold: 420, image: img('coconut-iced-americano', 843) },

      // 套餐
      { g: '套餐', name: '一个人也要吃两斤套餐', desc: '两斤十三香 + 蒜香饼 + 扎啤。一个人剥，一个人爽。', price: 168, sold: 2200, image: img('crawfish-one-person-combo', 844) },
      { g: '套餐', name: '两个人剥到天亮套餐', desc: '三斤麻辣 + 两斤蒜蓉 + 虾黄面×2 + 酸梅汤×2。手套管够。', price: 328, sold: 880, image: img('crawfish-couple-combo', 845) },
      { g: '套餐', name: '三个朋友三个口味套餐', desc: '麻辣一斤 + 蒜蓉一斤 + 咸蛋黄一斤 + 三杯扎啤。一人一个口味。', price: 258, sold: 560, image: img('crawfish-trio-combo', 846) },
      { g: '套餐', name: '六个人，什么都来套餐', desc: '六斤小龙虾（三种口味各两斤）+ 全系小吃拼盘 + 六杯饮品。', price: 588, sold: 180, image: img('crawfish-party-combo', 847) },
    ],
  },
]
