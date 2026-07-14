# CLAUDE.md

COCO 的深夜食堂。假装点外卖的情绪疗愈站——不花钱、不下单、不摄入，陪冲动待一会儿。

## 当前版本
版本号自动生成：`0.1.0.{git commit count}`，显示在页面右下角。
当前 commit 总数约 24，故版本约为 `v0.1.0.24`。
每次 `vite build` 自动从 `git rev-list --count HEAD` 获取计数。

## 技术栈
- Vue 3 + Vite + Pinia + Vue Router (Hash mode)
- 纯静态 SPA，无后端
- **17 家种子店**（含 2026-07-14 新增的小龙虾深夜局），约 280+ 道 AI 生图菜品
- 图片源：豆包 Seedream 4.5 API（`doubao-seedream-4-5-251128`）

## 常用命令
- **开发**: `cd web && npx vite --host 127.0.0.1 --port 5183`
- **构建**: `cd web && npx vite build` → 输出到 `web/dist/`
- **预览**: `cd web && npx vite preview`
- **AI 生图**: `cd web && node gen.cjs`（需要 Seedream API Key，脚本用完即删）

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
| **webapp-testing** | anthropics/skills | Playwright E2E 测试、性能分析、自动化 QA |
| **frontend-design** | anthropics/skills | 前端组件设计、动画、响应式、视觉 QA |
| **coco-deepnight** | 项目自建 `.claude/skills/` | 项目专属上下文：常用命令、部署流程、用户偏好 |

所有技能安装在 `.agents/skills/` 和 `.claude/skills/` 目录。

## 项目结构
```
web/src/
  data/shops/    ← 种子店铺按分类拆分（bbq/fried/tea/dessert/malatang/burger/noodle/heavy/liquor/crawfish）
  stores/        ← Pinia (cart/order/journal/merchant/theme)
  pages/         ← 页面组件（Home/Restaurants/Menu/Checkout/Waiting/merchant/*）
  components/    ← 共享组件（TopBar/Cover/SharePoster）
```

## 已做优化（2026-07-14）

### 第一轮
店家数据追踪、图片骨架屏、shops 拆分、键盘可访问性、路由标题、PWA、Vite 代码分割、Waiting 状态保存、域名环境变量、深色模式过渡、图片上传、ESLint/Prettier、菜名换行

### 第二轮
stats localStorage 持久化、移除死代码 HERO_GRADIENTS、SEO/OG/Twitter meta 标签、菜单 +/- 按钮 aria-label、店家删菜功能（merchant.removeDish + Dashboard ✕ 按钮）、店家编辑店铺信息（新增 EditShop.vue + /merchant/edit 路由）、分享海报弹窗焦点管理（role=dialog + aria-modal + ref.focus）

### 第三轮（代码审查修复）
merchant.js saveAll 加 try/catch、TopBar 返回按钮 aria-label、Waiting toastTimer 清理、冲动弹窗焦点管理、Entry.vue 硬编码颜色 → CSS 变量、EditShop 重复 onMounted 合并、Dashboard `$router` 统一、img() 注释、seed fallback 修复

### 第四轮（小龙虾分类）
- 新增 `crawfish` 分类（🦞），加入 CATEGORIES/SHOP_CATEGORIES
- "小龙虾深夜局" 37 道菜（后精简为 33 道）
- 33 张 AI 生图（Seedream 4.5 API 批量生成 810-843）
- SharePoster crawfish tagline: "虾壳剥开，今天也剥开了"
- journal 分类标签: "小龙虾"
- 新店 tab 按上线时间倒序排列（`.reverse()`）

### 第五轮（工程化）
- 版本号自动拼接 git commit 计数（`0.1.0.24` 格式）
- CLAUDE.md 作为项目持久记忆文件，每次重要操作后更新

## 关键约定
1. **版本号自动更新**：`vite.config.js` 中 `__APP_VERSION__` = `package.version + "." + git_commit_count`，无需手动管理
2. **每次完成重要操作必须更新此文件**，确保下次会话/换工具/换 AI 都能恢复上下文
3. **品牌名**: "COCO 的深夜食堂"，不是"点点街"
4. **LS Key 前缀**: `coco_`（不是 `ddj_`）
5. **工作风格**: 列全任务 → 全部执行 → 构建通过 → 部署上线 → 通知用户，不要逐个确认

## 内存文件
项目持久记忆也存放在 `C:\Users\emersonchen\.tclaude\projects\D--Code-fack-food\memory\`：
- `project-overview.md` · `vercel-deploy.md` · `recent-changes.md` · `user-preference.md`
