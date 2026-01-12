# 🚀 快速开始指南

> 5 分钟内完成 BeeTrade 活动页面的部署

## 📋 部署步骤

### 1️⃣ 准备工作

```bash
# 克隆或下载项目
cd beetrade-activity

# 安装依赖
npm install
```

### 2️⃣ 部署到 Vercel

```bash
# 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

### 3️⃣ 配置 Vercel KV

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 点击 **Storage** → **Create Database** → **KV**
4. 输入数据库名称：`beetrade-submissions`
5. 点击 **Create**
6. 点击 **Connect to Project** → 选择项目 → **Connect**

### 4️⃣ 完成！

访问你的网站：`https://your-project.vercel.app`

---

## 🧪 测试部署

### 测试 API 接口

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

### 使用可视化测试工具

访问：`https://your-project.vercel.app/api-test.html`

---

## 💻 本地开发

```bash
# 启动本地开发服务器
vercel dev

# 访问
# 主页面：http://localhost:3000
# API 测试：http://localhost:3000/api-test.html
```

---

## 📚 详细文档

- [完整 README](README.md) - 项目完整说明
- [Vercel 部署指南](VERCEL_DEPLOY.md) - 详细部署步骤
- [API 测试文档](API_TEST.md) - API 接口测试

---

## ❓ 常见问题

**Q: 部署后 API 返回 500 错误？**
A: 确保已配置 Vercel KV 数据库并连接到项目。

**Q: 如何查看提交的数据？**
A: 访问 `https://your-project.vercel.app/api-test.html` 或使用 Vercel KV Dashboard。

**Q: 如何使用自定义域名？**
A: 在 Vercel Dashboard → Settings → Domains 中添加域名。

---

**需要帮助？** 查看 [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) 获取详细指南。
