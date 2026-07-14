# CLAUDE.md

COCO 的深夜食堂。假装点外卖的情绪疗愈站——不花钱、不下单、不摄入，陪冲动待一会儿。

## 技术栈
- Vue 3 + Vite + Pinia + Vue Router (Hash mode)
- 纯静态 SPA，无后端
- 16 家种子店，243 道 AI 生图菜品

## 常用命令
- **开发**: `cd web && npx vite --host 127.0.0.1 --port 5183`
- **构建**: `cd web && npx vite build` → 输出到 `web/dist/`
- **预览**: `cd web && npx vite preview`

## 部署
- **平台**: Vercel
- **项目名**: `coco-late-night-3szd54ks5-zilinc4-alt1`
- **生产域名**: `deepnight.icu`
- **发布**: `cd web && npx vercel --prod`
- **GitHub**: `https://github.com/zilinc4-alt/coco-late-night.git`

## 项目结构
```
web/src/
  data/shops/    ← 种子店铺按分类拆分（bbq/fried/tea/dessert/malatang/burger/noodle/heavy/liquor）
  stores/        ← Pinia (cart/order/journal/merchant/theme)
  pages/         ← 页面组件（Home/Restaurants/Menu/Checkout/Waiting/merchant/*）
  components/    ← 共享组件（TopBar/Cover/SharePoster）
```

## 用户偏好
- 列全所有任务后自己执行，不要逐个确认
- 全部搞定、构建通过后再通知
- 注重品牌一致性（COCO 的深夜食堂，不是点点街）
- 改完要看浏览器效果
