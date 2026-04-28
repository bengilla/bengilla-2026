# BENGILLA Portfolio

基于 Next.js 14 的作品集网站，内置 CMS 管理后台。

## 功能

- 响应式设计，支持 11 种语言
- 移动端优化，支持触摸手势
- 安全的管理员认证系统（iron-session + bcrypt）
- 图片上传和管理（sharp 缩略图生成）
- 完整的管理后台：项目 CRUD、图片管理、密码修改、无用图片清理

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

## 环境配置

编辑 `.env.local`:

```env
# Session 加密密码（至少 32 字符）
# 生成: openssl rand -base64 32
SESSION_PASSWORD=your-secure-32-character-password-here

# 管理员密码（首次登录后请修改）
ADMIN_PASSWORD=admin123
```

## 使用

- **首页**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin
  - 默认账号: `admin` / `admin123`

## 部署

```bash
make deploy
```

自动执行：SSH 连接 VPS → git pull → npm run build → pm2 restart

## 安全

- `data.json`、`lib/auth.json`、`.env.local`、`public/uploads/` 已在 `.gitignore` 中，禁止提交
- Session 密码务必使用 32 字符以上的随机字符串
- 首次登录后请立即修改默认密码
- 登录接口有频率限制（5 次失败后锁定 15 分钟）

## 技术栈

- Next.js 14 (App Router)
- TypeScript (strict mode)
- React 18
- iron-session（Session 认证）
- bcryptjs（密码哈希）
- sharp（图片处理）
- JSON 文件存储（无数据库）

## 项目文档

详见项目根目录的 `CLAUDE.md`，包含架构说明、API 路由表、数据模型、注意事项等。