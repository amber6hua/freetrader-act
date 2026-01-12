# 故障排查指南

> Vercel 部署常见问题和解决方案

## 🔍 常见错误

### 1. 运行时超时错误（300秒）

**错误信息：**
```
Vercel Runtime Timeout Error: Task timed out after 300 seconds
```

**可能原因：**
- Vercel KV 连接超时
- Telegram Bot API 请求超时
- 代码中有阻塞操作

**解决方案：**

#### ✅ 已实施的优化

1. **Telegram 通知超时控制**
   - 添加 5 秒超时限制
   - 使用 `Promise.race` 实现超时控制
   - 异步发送，不阻塞主流程

2. **详细日志记录**
   - 每个步骤都有日志输出
   - 便于定位超时位置

3. **错误处理**
   - 完整的 try-catch 包裹
   - 友好的错误信息返回

#### 🔧 检查步骤

1. **查看 Vercel Functions 日志**
   ```
   Vercel Dashboard → 项目 → Functions → submissions
   ```
   查看日志输出，找到超时的具体位置

2. **检查 Vercel KV 连接**
   - 确认 KV 数据库已创建
   - 确认环境变量已正确配置
   - 测试 KV 连接是否正常

3. **检查 Telegram Bot 配置**
   - 如果未配置，系统会自动跳过
   - 如果配置了，确认 Token 和 Chat ID 正确

---

### 2. request.json 不是函数

**错误信息：**
```
TypeError: request.json is not a function
```

**原因：**
- Vercel 不同运行时的 Request 对象不同

**解决方案：**
- ✅ 已添加兼容性处理
- 尝试多种解析方法
- 详细的错误日志

---

### 3. Vercel KV 连接失败

**错误信息：**
```
Error: Failed to connect to Vercel KV
```

**解决方案：**

1. **确认 KV 数据库已创建**
   ```
   Vercel Dashboard → Storage → Create Database → KV
   ```

2. **确认 KV 已连接到项目**
   ```
   KV Dashboard → Connect to Project → 选择项目
   ```

3. **确认环境变量**
   ```
   Vercel Dashboard → Settings → Environment Variables
   ```
   检查以下变量是否存在：
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`

4. **重新部署**
   ```bash
   vercel --prod
   ```

---

### 4. CORS 错误

**错误信息：**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**解决方案：**
- ✅ 已在 `vercel.json` 中配置 CORS 头部
- ✅ 已在 API 函数中添加 CORS 头部

如果仍有问题，检查：
1. `vercel.json` 中的 headers 配置
2. API 函数中的 `corsHeaders` 配置

---

## 📊 日志分析

### 查看日志

1. **Vercel Dashboard**
   ```
   项目 → Functions → api/v1/submissions → Logs
   ```

2. **实时日志**
   ```bash
   vercel logs --follow
   ```

### 日志格式

浮浮酱已添加详细的日志标记：

```
[POST] Starting request handling...
[POST] Request body parsed successfully
[POST] Validating submission data...
[POST] Generating unique ID...
[POST] Generated ID: 123
[POST] Saving to KV...
[POST] Saved to KV successfully
[POST] Adding ID to list...
[POST] Added to list successfully
[POST] Triggering Telegram notification (non-blocking)...
[POST] Request completed successfully
```

### 定位超时位置

根据日志输出，找到最后一条日志，即可定位超时位置：

- 如果停在 `Generating unique ID...` → KV 连接问题
- 如果停在 `Saving to KV...` → KV 写入超时
- 如果停在 `Adding ID to list...` → KV lpush 超时

---

## 🔧 性能优化

### 1. Vercel KV 优化

**问题：** KV 操作可能较慢

**优化方案：**
- 使用 `Promise.all` 并行执行独立操作
- 减少不必要的 KV 调用
- 使用 KV Pipeline（批量操作）

### 2. Telegram 通知优化

**已实施：**
- ✅ 5 秒超时控制
- ✅ 异步发送，不阻塞响应
- ✅ 错误不影响主流程

### 3. 函数冷启动优化

**建议：**
- 使用 Vercel Pro 计划（更快的冷启动）
- 保持函数简洁，减少依赖
- 使用 Edge Runtime（更快）

---

## 🧪 测试步骤

### 1. 本地测试

```bash
# 启动本地开发服务器
vercel dev

# 测试 API
curl -X POST http://localhost:3000/api/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "9876543210",
    "telegram": "@testuser",
    "whatsapp": "9876543210"
  }'
```

### 2. 生产环境测试

```bash
# 部署到生产环境
vercel --prod

# 测试 API
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

### 3. 查看日志

```bash
# 实时查看日志
vercel logs --follow

# 查看最近的日志
vercel logs
```

---

## 📝 检查清单

部署前检查：

- [ ] Vercel KV 数据库已创建
- [ ] KV 已连接到项目
- [ ] 环境变量已配置（KV + Telegram Bot）
- [ ] `vercel.json` 配置正确
- [ ] `package.json` 存在
- [ ] API 函数代码无语法错误

部署后检查：

- [ ] 访问主页面正常
- [ ] API GET 请求正常
- [ ] API POST 请求正常
- [ ] Telegram 通知正常（如果配置了）
- [ ] 查看 Functions 日志无错误

---

## 🆘 获取帮助

如果问题仍未解决：

1. **查看 Vercel 文档**
   - [Vercel Functions](https://vercel.com/docs/functions)
   - [Vercel KV](https://vercel.com/docs/storage/vercel-kv)

2. **查看项目文档**
   - [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md)
   - [TELEGRAM_BOT_SETUP.md](TELEGRAM_BOT_SETUP.md)

3. **提交 Issue**
   - 包含完整的错误信息
   - 包含 Vercel Functions 日志
   - 说明复现步骤

---

**最后更新时间：** 2026-01-09

**版本：** 1.0.0
