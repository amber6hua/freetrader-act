# Telegram Bot 配置指南

> 配置 Telegram Bot 接收用户提交通知

## 📋 目录

- [创建 Telegram Bot](#创建-telegram-bot)
- [获取群组 Chat ID](#获取群组-chat-id)
- [配置环境变量](#配置环境变量)
- [测试通知](#测试通知)
- [常见问题](#常见问题)

---

## 🤖 创建 Telegram Bot

### 1. 找到 BotFather

在 Telegram 中搜索 [@BotFather](https://t.me/BotFather) 并打开对话。

### 2. 创建新 Bot

发送命令：
```
/newbot
```

### 3. 设置 Bot 名称

BotFather 会要求你输入 Bot 的显示名称：
```
BeeTrade Notification Bot
```

### 4. 设置 Bot 用户名

输入 Bot 的用户名（必须以 `bot` 结尾）：
```
beetrade_notify_bot
```

### 5. 获取 Bot Token

创建成功后，BotFather 会返回 Bot Token：
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz-1234567890
```

**⚠️ 重要：** 请妥善保管 Token，不要泄露给他人！

---

## 🆔 获取群组 Chat ID

### 方式一：使用 Bot API（推荐）

#### 1. 将 Bot 添加到群组

- 打开目标 Telegram 群组
- 点击群组名称 → 添加成员
- 搜索并添加你的 Bot
- 确保 Bot 有发送消息的权限

#### 2. 在群组中发送消息

在群组中发送任意消息，例如：
```
/start
```

#### 3. 获取 Chat ID

在浏览器中访问以下 URL（替换 `<YOUR_BOT_TOKEN>` 为你的 Bot Token）：
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

例如：
```
https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates
```

#### 4. 查找 Chat ID

在返回的 JSON 中找到 `chat` 对象：
```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {...},
        "chat": {
          "id": -1001234567890,  // 这就是 Chat ID
          "title": "BeeTrade 通知群组",
          "type": "supergroup"
        },
        "date": 1234567890,
        "text": "/start"
      }
    }
  ]
}
```

**注意：** 群组的 Chat ID 通常是负数（以 `-100` 开头）。

---

### 方式二：使用 @userinfobot

#### 1. 添加 Bot 到群组

将 [@userinfobot](https://t.me/userinfobot) 添加到目标群组。

#### 2. 获取 Chat ID

Bot 会自动发送群组信息，包括 Chat ID。

---

### 方式三：使用 @getidsbot

#### 1. 添加 Bot 到群组

将 [@getidsbot](https://t.me/getidsbot) 添加到目标群组。

#### 2. 发送命令

在群组中发送：
```
/start
```

#### 3. 获取 Chat ID

Bot 会返回群组的 Chat ID。

---

## ⚙️ 配置环境变量

### 本地开发环境

创建 `.env.local` 文件：

```bash
# Telegram Bot 配置
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890

# Vercel KV 配置（从 Vercel Dashboard 复制）
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=your-token
KV_REST_API_READ_ONLY_TOKEN=your-read-only-token
KV_URL=redis://default:your-password@your-kv-url.upstash.io:6379
```

### Vercel 生产环境

#### 1. 访问 Vercel Dashboard

打开 [Vercel Dashboard](https://vercel.com/dashboard)

#### 2. 选择项目

点击你的项目名称

#### 3. 进入设置

点击 **Settings** → **Environment Variables**

#### 4. 添加环境变量

添加以下两个变量：

**变量 1：**
- Key: `TELEGRAM_BOT_TOKEN`
- Value: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
- Environments: ✅ Production ✅ Preview ✅ Development

**变量 2：**
- Key: `TELEGRAM_CHAT_ID`
- Value: `-1001234567890`
- Environments: ✅ Production ✅ Preview ✅ Development

#### 5. 保存并重新部署

点击 **Save**，然后重新部署项目：

```bash
vercel --prod
```

---

## 🧪 测试通知

### 1. 提交测试数据

使用 API 测试工具或 curl 提交测试数据：

```bash
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

### 2. 检查 Telegram 群组

如果配置正确，你应该会在 Telegram 群组中收到通知消息：

```
🎉 新用户提交 #ID1

👤 姓名: 测试用户
📧 邮箱: test@example.com
📱 手机: 9876543210
💬 Telegram: @testuser
📞 WhatsApp: 9876543210
🌐 IP地址: 122.168.66.166
⏰ 提交时间: 2026-01-09 17:30:00

---
提交编号: 1
```

### 3. 查看日志

如果没有收到通知，检查 Vercel Functions 日志：

1. Vercel Dashboard → 项目 → Functions
2. 点击 `api/v1/submissions`
3. 查看日志输出

---

## ❓ 常见问题

### Q1: Bot 无法发送消息到群组

**可能原因：**
- Bot 没有被添加到群组
- Bot 没有发送消息的权限
- Chat ID 不正确

**解决方案：**
1. 确认 Bot 已添加到群组
2. 检查 Bot 是否是群组管理员（或群组允许所有成员发送消息）
3. 重新获取 Chat ID 并确认是负数

### Q2: 收到 "Unauthorized" 错误

**原因：** Bot Token 不正确

**解决方案：**
1. 检查 `TELEGRAM_BOT_TOKEN` 环境变量是否正确
2. 确认 Token 没有多余的空格或换行符
3. 重新从 BotFather 获取 Token

### Q3: 收到 "Chat not found" 错误

**原因：** Chat ID 不正确或 Bot 未加入群组

**解决方案：**
1. 确认 Bot 已添加到群组
2. 重新获取 Chat ID
3. 确认 Chat ID 格式正确（群组 ID 通常是负数）

### Q4: 消息格式显示不正确

**原因：** Markdown 格式问题

**解决方案：**
- 消息使用 Markdown 格式
- 特殊字符需要转义（如 `_`, `*`, `[`, `]`）
- 可以在代码中调整消息格式

### Q5: 本地开发时无法发送通知

**原因：** 未配置 `.env.local` 文件

**解决方案：**
1. 创建 `.env.local` 文件
2. 添加 Telegram Bot 环境变量
3. 重启开发服务器：`vercel dev`

### Q6: 通知延迟或丢失

**原因：** Telegram API 限流或网络问题

**解决方案：**
- Telegram Bot API 有速率限制（每秒 30 条消息）
- 通知是异步的，不会阻塞 API 响应
- 检查 Vercel Functions 日志查看详细错误

---

## 🔒 安全建议

1. **保护 Bot Token**
   - 不要将 Token 提交到 Git
   - 使用环境变量存储
   - 定期更换 Token

2. **限制 Bot 权限**
   - 只给 Bot 必要的权限
   - 不要让 Bot 成为群组管理员（除非必要）

3. **监控通知**
   - 定期检查通知是否正常
   - 查看 Vercel Functions 日志

4. **备份 Chat ID**
   - 记录群组 Chat ID
   - 如果群组被删除，需要重新配置

---

## 📚 相关资源

- [Telegram Bot API 文档](https://core.telegram.org/bots/api)
- [BotFather 官方指南](https://core.telegram.org/bots#6-botfather)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [项目部署指南](VERCEL_DEPLOY.md)

---

## 🎉 配置完成！

配置完成后，每次有用户提交表单，你都会在 Telegram 群组中收到实时通知！

**需要帮助？** 查看 [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) 或提交 Issue。

---

**最后更新时间：** 2026-01-09

**版本：** 1.0.0
