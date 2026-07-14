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
- **平台**: Vercel（Vercel CLI 已安装）
- **项目 slug**: `coco-late-night`（team: `zilinc4-alt1`）
- **生产域名**: `deepnight.icu`
- **发布流程**:
  ```
  cd web
  npx vite build           # 确保构建通过
  npx vercel --prod --yes  # 部署到生产，自动 alias 到 deepnight.icu
  ```
- **GitHub**: `https://github.com/zilinc4-alt/coco-late-night.git`

## 已安装技能（Skills）

| 技能 | 来源 | 用途 |
|------|------|------|
| **find-skills** | vercel-labs/skills | 从 20 万+ Skills 中搜索发现新技能 |
| **skill-creator** | anthropics/skills | 元技能，创建/优化自定义技能 |
| **Superpowers** (14 子技能) | obra/superpowers | 开发全流程：脑暴、TDD、调试、Code Review、分支管理 |
| **planning-with-files-zh** | OthmanAdi/planning-with-files | 基于文件的任务规划与进度跟踪（中文版） |
| **coco-deepnight** | 项目自建 `.claude/skills/` | 项目专属上下文：常用命令、部署流程、用户偏好 |

所有技能安装在 `.agents/skills/` 和 `.claude/skills/` 目录。
```
web/src/
  data/shops/    ← 种子店铺按分类拆分（bbq/fried/tea/dessert/malatang/burger/noodle/heavy/liquor）
  stores/        ← Pinia (cart/order/journal/merchant/theme)
  pages/         ← 页面组件（Home/Restaurants/Menu/Checkout/Waiting/merchant/*）
  components/    ← 共享组件（TopBar/Cover/SharePoster）
```

## 已做优化
- **第一轮（2026-07-14）**: 店家数据追踪、图片骨架屏、shops 拆分、键盘可访问性、路由标题、PWA、Vite 代码分割、Waiting 状态保存、域名环境变量、深色模式过渡、图片上传、ESLint/Prettier、菜名换行
- **第二轮（2026-07-14）**: stats localStorage 持久化、移除死代码 HERO_GRADIENTS、SEO/OG/Twitter meta 标签、菜单 +/- 按钮 aria-label、店家删菜功能（merchant.removeDish + Dashboard ✕ 按钮）、店家编辑店铺信息（新增 EditShop.vue + /merchant/edit 路由）、分享海报弹窗焦点管理（role=dialog + aria-modal + ref.focus）
- **版本号**: 页面右下角显示 `v0.1.0 · 构建时间`，由 vite.config.js 中 `__APP_VERSION__` 和 `__BUILD_TIME__` 注入

## 用户偏好
- 列全所有任务后自己执行，不要逐个确认
- 全部搞定、构建通过后再通知
- 注重品牌一致性（COCO 的深夜食堂，不是点点街）
- **每次做完重要操作，必须更新此文件**
