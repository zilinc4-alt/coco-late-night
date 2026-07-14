---
name: coco-deepnight
description: COCO 的深夜食堂项目专属技能。提供项目上下文、开发命令、部署流程和用户偏好。当在此项目中工作时自动激活，或当用户提到"深夜食堂"、"COCO"、"deepnight"等关键词时触发。
user-invocable: true
---

# COCO 的深夜食堂

假装点外卖的情绪疗愈站。不花钱、不下单、不摄入——陪冲动待一会儿。

## 项目上下文

- **技术栈**: Vue 3 + Vite + Pinia + Vue Router (Hash mode)，纯静态 SPA
- **仓库**: `https://github.com/zilinc4-alt/coco-late-night.git`
- **部署**: Vercel，项目 slug `coco-late-night`（team `zilinc4-alt1`），域名 `deepnight.icu`
- **种子数据**: 16 家店，243 道 AI 生图菜品

## 常用命令

| 操作 | 命令 |
|------|------|
| 开发 | `cd web && npx vite --host 127.0.0.1 --port 5183` |
| 构建 | `cd web && npx vite build` |
| 预览 | `cd web && npx vite preview` |
| 部署 | `cd web && npx vercel --prod --yes` |
| commit | `cd D:\Code\fack food && git add -A && git commit -m "..." && git push origin main` |

## 项目结构

```
web/src/
  data/shops/    ← 按分类拆分的种子店铺（bbq/fried/tea/dessert/malatang/burger/noodle/heavy/liquor）
  stores/        ← Pinia（cart/order/journal/merchant/theme）
  pages/         ← 页面组件（Home/Restaurants/Menu/Checkout/Waiting/merchant/*）
  components/    ← 共享组件（TopBar/Cover/SharePoster）
```

## 已安装的外部 Skills

项目 `.agents/skills/` 下安装了两个通用 skill：
- **skill-creator** — Anthropic 官方元技能，用于创建和优化 skill
- **planning-with-files-zh** — 基于 Manus 风格的文件规划系统，用于拆解跟踪复杂任务

## 用户偏好

1. 列全任务清单后自己逐个执行，不要每个改动都确认
2. 全部搞定、构建通过后再通知成果
3. 品牌名是"COCO 的深夜食堂"，不是"点点街"
4. **每次完成重要操作，必须更新 CLAUDE.md**
5. 改完需要在浏览器中确认效果

## 记忆文件

项目持久记忆存放在 `C:\Users\emersonchen\.tclaude\projects\D--Code-fack-food\memory\`：
- `project-overview.md` — 项目总览
- `vercel-deploy.md` — Vercel 部署详情
- `recent-changes.md` — 近期改动记录
- `user-preference.md` — 用户偏好
