# Vercel 部署指南

> BeeTrade 活动页面 - 部署到 Vercel 平台

## 📋 目录

- [前置要求](#前置要求)
- [快速部署](#快速部署)
- [配置 Vercel KV](#配置-vercel-kv)
- [本地开发](#本地开发)
- [环境变量](#环境变量)
- [常见问题](#常见问题)

---

## 🎯 前置要求

1. **Vercel 账号**
   - 访问 [vercel.com](https://vercel.com) 注册账号
   - 可以使用 GitHub、GitLab 或 Bitbucket 账号登录

2. **Git 仓库**（可选，推荐）
   - GitHub、GitLab 或 Bitbucket 仓库
   - 或者使用 Vercel CLI 直接部署

3. **Node.js**（本地开发需要）
   - Node.js 18.x 或更高版本
   - npm 或 yarn 包管理器

---

## 🚀 快速部署

### 方式一：通过 GitHub 部署（推荐）

#### 1. 创建 Git 仓库

```bash
cd beetrade-activity

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 创建初始提交
git commit -m "Initial commit: BeeTrade activity page"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/beetrade-activity.git

# 推送到 GitHub
git push -u origin main
```

#### 2. 在 Vercel 中导入项目

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 点击 "Import Git Repository"
3. 选择你的 GitHub 仓库
4. 点击 "Import"
5. 配置项目设置（通常保持默认即可）
6. 点击 "Deploy"

#### 3. 等待部署完成

- Vercel 会自动检测项目配置
- 部署完成后会提供一个 `.vercel.app` 域名
- 例如：`https://beetrade-activity.vercel.app`

---

### 方式二：使用 Vercel CLI 部署

#### 1. 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录 Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
cd beetrade-activity

# 首次部署
vercel

# 生产环境部署
vercel --prod
```

#### 4. 按照提示操作

- 选择项目名称
- 选择团队（如果有）
- 确认项目设置

---

## 🗄️ 配置 Vercel KV

Vercel KV 是 Vercel 提供的 Redis 兼容的键值存储服务，用于存储表单提交数据。

### 1. 创建 KV 数据库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 "Storage" 标签
4. 点击 "Create Database"
5. 选择 "KV"
6. 输入数据库名称（例如：`beetrade-submissions`）
7. 选择区域（建议选择离用户最近的区域）
8. 点击 "Create"

### 2. 连接 KV 到项目

1. 在 KV 数据库页面，点击 "Connect to Project"
2. 选择你的项目
3. 点击 "Connect"
4. Vercel 会自动添加环境变量到你的项目

### 3. 环境变量（自动配置）

连接 KV 后，Vercel 会自动添加以下环境变量：

```
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
KV_URL=redis://...
```

**注意：** 这些环境变量会自动注入到 Serverless Functions 中，无需手动配置。

---

## 💻 本地开发

### 1. 安装依赖

```bash
cd beetrade-activity
npm install
```

### 2. 配置本地环境变量

创建 `.env.local` 文件：

```bash
# 从 Vercel Dashboard 复制 KV 环境变量
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-token
KV_REST_API_READ_ONLY_TOKEN=your-read-only-token
KV_URL=redis://default:your-password@your-kv-url.upstash.io:6379
```

**获取环境变量：**
1. 访问 Vercel Dashboard
2. 选择项目 → Settings → Environment Variables
3. 复制 KV 相关的环境变量

### 3. 启动本地开发服务器

```bash
npm run dev
```

或者直接使用 Vercel CLI：

```bash
vercel dev
```

### 4. 访问本地服务

- 主页面：`http://localhost:3000`
- API 接口：`http://localhost:3000/api/v1/submissions`
- API 测试工具：`http://localhost:3000/api-test.html`

---

## 🔧 环境变量

### 必需的环境变量（Vercel KV）

| 变量名 | 说明 | 来源 |
|--------|------|------|
| `KV_REST_API_URL` | KV REST API 地址 | Vercel KV 自动配置 |
| `KV_REST_API_TOKEN` | KV REST API 令牌 | Vercel KV 自动配置 |
| `KV_REST_API_READ_ONLY_TOKEN` | KV 只读令牌 | Vercel KV 自动配置 |
| `KV_URL` | KV Redis 连接 URL | Vercel KV 自动配置 |

### Telegram Bot 环境变量（可选，推荐）

| 变量名 | 说明 | 获取方式 |
|--------|------|---------|
| `TELEGRAM_BOT_TOKEN` | Telegram Bot 令牌 | 通过 @BotFather 创建 Bot |
| `TELEGRAM_CHAT_ID` | Telegram 群组/频道 ID | 通过 Bot 获取或使用工具查询 |

**配置 Telegram Bot 通知：**

1. **创建 Telegram Bot**
   - 在 Telegram 中搜索 [@BotFather](https://t.me/BotFather)
   - 发送 `/newbot` 命令
   - 按提示设置 Bot 名称和用户名
   - 获取 Bot Token（格式：`123456789:ABCdefGHIjklMNOpqrsTUVwxyz`）

2. **获取群组 Chat ID**

   **方式一：使用 Bot 获取**
   - 将 Bot 添加到目标群组
   - 在群组中发送任意消息
   - 访问：`https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - 在返回的 JSON 中找到 `chat.id`（负数表示群组）

   **方式二：使用 @userinfobot**
   - 将 [@userinfobot](https://t.me/userinfobot) 添加到群组
   - Bot 会自动发送群组 ID

3. **在 Vercel 中配置环境变量**
   - 访问 Vercel Dashboard
   - 选择项目 → Settings → Environment Variables
   - 添加以下变量：
     ```
     TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
     TELEGRAM_CHAT_ID=-1001234567890
     ```
   - 选择环境：Production, Preview, Development
   - 点击 Save

4. **重新部署**
   ```bash
   vercel --prod
   ```

**通知消息格式：**
```
🎉 新用户提交 #ID123

👤 姓名: 张三
📧 邮箱: zhangsan@example.com
📱 手机: 9876543210
💬 Telegram: @zhangsan
📞 WhatsApp: 9876543210
🌐 IP地址: 122.168.66.166
⏰ 提交时间: 2026-01-09 17:30:00

---
提交编号: 123
```

**注意事项：**
- 如果未配置 Telegram Bot，系统会跳过通知，不影响正常提交
- Telegram 通知是异步的，不会阻塞 API 响应
- 确保 Bot 有发送消息到群组的权限

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `CUSTOMER_SERVICE_URL` | 客服链接 | 在 `config.js` 中配置 |
| `FACEBOOK_PIXEL_ID` | Facebook Pixel ID | 在 `config.js` 中配置 |

---

## 🌐 自定义域名

### 1. 添加自定义域名

1. 访问 Vercel Dashboard
2. 选择项目 → Settings → Domains
3. 输入你的域名（例如：`activity.yourdomain.com`）
4. 点击 "Add"

### 2. 配置 DNS

根据 Vercel 的提示，在你的域名提供商处添加 DNS 记录：

**A 记录：**
```
Type: A
Name: activity (或 @)
Value: 76.76.21.21
```

**CNAME 记录：**
```
Type: CNAME
Name: activity
Value: cname.vercel-dns.com
```

### 3. 等待 DNS 生效

- DNS 生效通常需要几分钟到几小时
- Vercel 会自动配置 SSL 证书

---

## 📊 API 接口说明

部署后，API 接口地址会自动更新：

### 生产环境
```
POST https://your-project.vercel.app/api/v1/submissions
GET  https://your-project.vercel.app/api/v1/submissions
```

### 本地开发
```
POST http://localhost:3000/api/v1/submissions
GET  http://localhost:3000/api/v1/submissions
```

**注意：** `config.js` 会自动检测环境并使用正确的 API 地址。

---

## 🧪 测试部署

### 1. 测试 API 接口

```bash
# 获取提交列表
curl https://your-project.vercel.app/api/v1/submissions

# 提交测试数据
curl -X POST https://your-project.vercel.app/api/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "9876543210",
    "telegram": "@testuser",
    "whatsapp": "9876543210"
  }'
```

### 2. 使用 API 测试工具

访问：`https://your-project.vercel.app/api-test.html`

---

## ❓ 常见问题

### Q1: 部署失败，提示 "Build failed"

**解决方案：**
1. 检查 `package.json` 是否正确
2. 确保所有依赖都已安装
3. 查看 Vercel 部署日志获取详细错误信息

### Q2: API 返回 500 错误

**解决方案：**
1. 检查 Vercel KV 是否已正确配置
2. 确认环境变量已正确设置
3. 查看 Vercel Functions 日志

### Q3: 本地开发时 API 无法访问

**解决方案：**
1. 确保已安装依赖：`npm install`
2. 确保 `.env.local` 文件已正确配置
3. 使用 `vercel dev` 而不是 `npm run dev`

### Q4: 数据没有保存

**解决方案：**
1. 检查 Vercel KV 连接是否正常
2. 查看 Vercel Functions 日志
3. 确认 KV 环境变量已正确配置

### Q5: CORS 错误

**解决方案：**
- `vercel.json` 已配置 CORS 头部
- 如果仍有问题，检查 `api/v1/submissions.js` 中的 CORS 配置

### Q6: 如何查看提交的数据？

**方案一：** 使用 API 测试工具
- 访问 `https://your-project.vercel.app/api-test.html`

**方案二：** 使用 Vercel KV Dashboard
1. 访问 Vercel Dashboard
2. 选择 Storage → 你的 KV 数据库
3. 使用 Data Browser 查看数据

**方案三：** 使用 API 接口
```bash
curl https://your-project.vercel.app/api/v1/submissions
```

---

## 🔒 安全建议

1. **环境变量保护**
   - 不要将 `.env.local` 提交到 Git
   - 使用 Vercel Dashboard 管理生产环境变量

2. **API 限流**
   - 考虑添加 API 限流保护
   - 可以使用 Vercel 的 Edge Middleware

3. **数据验证**
   - API 已包含基本的数据验证
   - 可以根据需要添加更严格的验证规则

4. **HTTPS**
   - Vercel 自动提供 HTTPS
   - 确保所有请求都使用 HTTPS

---

## 📈 监控和日志

### 查看部署日志

1. 访问 Vercel Dashboard
2. 选择项目 → Deployments
3. 点击具体的部署查看日志

### 查看 Functions 日志

1. 访问 Vercel Dashboard
2. 选择项目 → Functions
3. 点击具体的函数查看日志

### 查看 KV 使用情况

1. 访问 Vercel Dashboard
2. 选择 Storage → 你的 KV 数据库
3. 查看 Usage 标签

---

## 🎉 部署成功！

部署完成后，你将获得：

- ✅ 完整的静态网站
- ✅ Serverless API 接口
- ✅ 自动 HTTPS 证书
- ✅ 全球 CDN 加速
- ✅ 自动扩展能力
- ✅ 数据持久化存储

**访问你的网站：**
- 主页面：`https://your-project.vercel.app`
- API 测试：`https://your-project.vercel.app/api-test.html`

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel KV 文档](https://vercel.com/docs/storage/vercel-kv)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [项目 README](README.md)
- [API 测试文档](API_TEST.md)

---

**最后更新时间：** 2026-01-09

**版本：** 1.0.0
