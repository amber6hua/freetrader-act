# API 接口测试文档

## 📡 API 基础信息

**基础 URL:** `http://activity.beetrade.in`

**接口路径:** `/api/v1/submissions`

---

## 🔍 接口详情

### 1. 提交表单数据 (POST)

**接口地址:** `POST /api/v1/submissions`

**请求头:**
```
Content-Type: application/json
Accept: application/json
```

**请求体示例:**
```json
{
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "9876543210",
  "telegram": "@zhangsan",
  "whatsapp": "9876543210"
}
```

**字段说明:**

| 字段 | 类型 | 必填 | 说明 | 验证规则 |
|------|------|------|------|---------|
| name | string | ✅ | 用户全名 | 2-100 字符 |
| email | string | ✅ | 用户邮箱 | 有效的邮箱格式 |
| phone | string | ✅ | 手机号 | 10位数字，6-9开头 |
| telegram | string | ✅ | Telegram账号 | 1-100 字符 |
| whatsapp | string | ❌ | WhatsApp账号 | 最多100字符 |

**成功响应 (200 OK):**
```json
{
  "id": 2475,
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "9876543210",
  "telegram": "@zhangsan",
  "whatsapp": "9876543210",
  "ip_address": "122.168.66.166",
  "created_at": "2026-01-09T09:19:29.355629Z",
  "updated_at": "2026-01-09T09:19:29.355629Z"
}
```

**错误响应示例:**
```json
{
  "detail": "Invalid email format",
  "message": "请求参数错误"
}
```

---

### 2. 获取提交列表 (GET)

**接口地址:** `GET /api/v1/submissions`

**请求头:**
```
Accept: application/json
```

**成功响应 (200 OK):**
```json
[
  {
    "id": 2475,
    "name": "Sadiq.m",
    "email": "sadiqmohammedkdsv786@gmail.com",
    "phone": "9686435078",
    "telegram": "@Sadiq78t",
    "whatsapp": "9686435078",
    "ip_address": "122.168.66.166",
    "created_at": "2026-01-09T09:19:29.355629Z",
    "updated_at": "2026-01-09T09:19:29.355629Z"
  },
  {
    "id": 2474,
    "name": "Rohit kumar",
    "email": "r48342166@gmail.com",
    "phone": "8810281571",
    "telegram": "8810281571",
    "whatsapp": "8810281571",
    "ip_address": "157.37.128.161",
    "created_at": "2026-01-09T09:19:02.630164Z",
    "updated_at": "2026-01-09T09:19:02.630164Z"
  }
  // ... 更多数据
]
```

---

## 🧪 测试命令

### 使用 curl 测试

#### 1. 提交数据 (POST)
```bash
curl -X POST http://activity.beetrade.in/api/v1/submissions \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "9876543210",
    "telegram": "@testuser",
    "whatsapp": "9876543210"
  }'
```

#### 2. 获取列表 (GET)
```bash
curl -X GET http://activity.beetrade.in/api/v1/submissions \
  -H "Accept: application/json"
```

#### 3. 获取列表并格式化输出
```bash
curl -X GET http://activity.beetrade.in/api/v1/submissions \
  -H "Accept: application/json" | python -m json.tool
```

---

### 使用 JavaScript 测试

#### 1. 提交数据 (POST)
```javascript
const formData = {
  name: "测试用户",
  email: "test@example.com",
  phone: "9876543210",
  telegram: "@testuser",
  whatsapp: "9876543210"
};

fetch('http://activity.beetrade.in/api/v1/submissions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify(formData)
})
  .then(response => response.json())
  .then(data => console.log('Success:', data))
  .catch(error => console.error('Error:', error));
```

#### 2. 获取列表 (GET)
```javascript
fetch('http://activity.beetrade.in/api/v1/submissions', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Error:', error));
```

---

### 使用 Python 测试

#### 1. 提交数据 (POST)
```python
import requests
import json

url = "http://activity.beetrade.in/api/v1/submissions"
headers = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}
data = {
    "name": "测试用户",
    "email": "test@example.com",
    "phone": "9876543210",
    "telegram": "@testuser",
    "whatsapp": "9876543210"
}

response = requests.post(url, headers=headers, json=data)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")
```

#### 2. 获取列表 (GET)
```python
import requests

url = "http://activity.beetrade.in/api/v1/submissions"
headers = {
    "Accept": "application/json"
}

response = requests.get(url, headers=headers)
print(f"Status Code: {response.status_code}")
print(f"Total Records: {len(response.json())}")
print(f"First Record: {response.json()[0]}")
```

---

## 📊 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 提交记录的唯一ID |
| name | string | 用户全名 |
| email | string | 用户邮箱 |
| phone | string | 用户手机号 |
| telegram | string | Telegram账号 |
| whatsapp | string/null | WhatsApp账号（可为空） |
| ip_address | string | 提交时的IP地址 |
| created_at | string | 创建时间（ISO 8601格式） |
| updated_at | string | 更新时间（ISO 8601格式） |

---

## ⚠️ 注意事项

1. **手机号格式**: 必须是10位数字，且以6-9开头（印度手机号格式）
2. **邮箱格式**: 必须是有效的邮箱格式
3. **WhatsApp字段**: 可选字段，可以为空或null
4. **IP地址**: 由后端自动记录，前端无需提交
5. **时间戳**: 由后端自动生成，使用UTC时区

---

## 🔧 常见错误

### 1. 网络连接失败
```
Error: Network connection failed
```
**解决方案**: 检查网络连接，确保能访问 `http://activity.beetrade.in`

### 2. 请求参数错误
```json
{
  "detail": "Invalid phone number format"
}
```
**解决方案**: 检查手机号格式，必须是10位数字且以6-9开头

### 3. 邮箱格式错误
```json
{
  "detail": "Invalid email format"
}
```
**解决方案**: 检查邮箱格式是否正确

### 4. 必填字段缺失
```json
{
  "detail": "Field 'name' is required"
}
```
**解决方案**: 确保所有必填字段都已填写

---

## 📝 测试清单

- [ ] POST 提交有效数据
- [ ] POST 提交无效邮箱
- [ ] POST 提交无效手机号
- [ ] POST 缺少必填字段
- [ ] POST 提交超长字符串
- [ ] GET 获取提交列表
- [ ] GET 验证返回数据格式
- [ ] 测试网络错误处理
- [ ] 测试超时处理

---

## 🎯 性能指标

- **平均响应时间**: < 500ms
- **并发支持**: 支持多用户同时提交
- **数据持久化**: 所有提交数据永久保存

---

**最后更新时间:** 2026-01-09
