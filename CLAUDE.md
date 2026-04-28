# CLAUDE.md

本文档为 Claude Code 操作此仓库时提供指引。

## 常用命令

```bash
npm run dev       # 启动开发服务器 (localhost:3000)
npm run build     # 生产构建
npm run start     # 启动生产服务器
npm run lint      # 运行 Next.js 代码检查
make deploy       # 部署到 VPS (ssh + git pull + build + pm2 restart)
```

## 项目概述

基于 Next.js 14 的作品集网站，带 CMS 管理后台。单页 Hero 滑块展示项目，后台支持完整的 CRUD 操作。无数据库——数据存储在 JSON 文件中（`data.json` 存项目，`lib/auth.json` 存管理员凭证）。

## 技术栈

- **框架**: Next.js 14 (App Router) + TypeScript
- **认证**: iron-session + bcryptjs（基于 Session，无 JWT）
- **数据**: JSON 文件存储（无数据库）
- **图片**: sharp 生成缩略图，上传至 `public/uploads/`
- **样式**: CSS Modules + 全局 CSS（无 Tailwind）
- **部署**: VPS + SSH + pm2 进程管理

## 架构说明

- `app/page.tsx` — 主页 Hero 滑块（RSC 服务端组件，服务端获取所有项目）
- `app/admin/` — 管理后台登录页 + 仪表盘（客户端组件，通过 API 获取数据）
- `app/api/` — RESTful API 路由（项目 CRUD、认证、上传、图片管理）
- `components/` — `Header.tsx`（项目列表浮层）、`HeroSlider.tsx`（图片轮播，支持触摸手势）、`Footer.tsx`、管理后台 `Modal.tsx`
- `lib/` — `auth.ts`（iron-session 配置）、`db.ts`（JSON 文件读写）、`i18n/`（11 语言支持）、`rate-limit.ts`（内存限流）、`types/`（Project/ImageItem/Admin 类型定义）
- `middleware.ts` — 保护 `/admin/dashboard/`、`/api/admin/` 和 `/api/upload` 路由

## 注意事项

- **禁止提交** `data.json`、`lib/auth.json`、`.env.local`、`public/uploads/`——已在 `.gitignore` 中
- 管理员账号首次访问时从 `ADMIN_PASSWORD` 环境变量自动创建（默认 `admin123`）
- `SESSION_PASSWORD` 环境变量必填（至少 32 字符），用于 iron-session 加密
- 首次访问自动创建 `data.json` 并填充示例项目
- `app/globals.css`（854 行）包含所有非模块样式：Hero、Header、管理后台、动画、响应式规则
- 字体：Noto Sans SC（中文）+ Space Grotesk（英文）来自 Google Fonts，Font Awesome 6 图标通过 CDN 加载
- 未配置测试框架

## API 路由

| 方法 | 路由 | 需认证 | 用途 |
|--------|-------|--------|------|
| GET | `/api/projects` | 否 | 获取所有项目 |
| POST | `/api/projects` | 是 | 创建项目 |
| DELETE | `/api/projects/[id]` | 是 | 删除项目及图片 |
| GET | `/api/projects/[id]/images` | 否 | 获取项目图片列表 |
| POST | `/api/upload` | 是 | 上传图片（最大 5MB，仅 JPEG/PNG/WebP/GIF） |
| POST | `/api/admin/login` | 否 | 管理员登录（含频率限制） |
| POST | `/api/admin/logout` | 否 | 退出登录 |
| GET | `/api/admin/check` | 否 | 检查 Session 是否有效 |
| POST | `/api/admin/change-password` | 是 | 修改管理员密码 |
| GET/POST | `/api/admin/cleanup-images` | 是 | 查找/删除孤立的已上传文件 |

## 数据模型

**Project**: `{ id, name_zh, name_en, category, description, cover_image, created_at, updated_at, images[], imageCount }`
**ImageItem**: `{ id, project_id, url, thumb_url, filename, created_at }`
**Admin**: `{ id, username, password (bcrypt 哈希), created_at }`

分类: stage（舞台设计）、lighting（灯光设计）、exhibition（展会设计）、architecture（建筑设计）、product（产品设计）、graphic（平面设计）、photography（摄影）、illustration（插画）、other（其他）
