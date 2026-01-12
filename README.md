# BeeTrade 活动页面 - 静态化版本

> 从 http://activity.beetrade.in 完整还原的静态网站

## 📁 项目结构

```
beetrade-activity/
├── index.html                 # 主页面
├── api-test.html             # API 测试工具（可视化测试界面）
├── config.js                  # 配置文件（API地址、客服链接等）
├── package.json              # Node.js 项目配置
├── vercel.json               # Vercel 部署配置
├── .gitignore                # Git 忽略文件
├── README.md                  # 项目说明文档
├── API_TEST.md               # API 接口测试文档
├── VERCEL_DEPLOY.md          # Vercel 部署指南
├── TELEGRAM_BOT_SETUP.md     # Telegram Bot 配置指南
├── QUICKSTART.md             # 快速开始指南
├── api/
│   └── v1/
│       └── submissions.js    # Serverless API 函数（含 Telegram 通知）
├── css/
│   ├── main.css              # 主样式文件（14.5KB）
│   └── responsive.css        # 响应式样式（6.3KB）
├── js/
│   ├── validator.js          # 表单验证模块（4.4KB）
│   ├── api.js                # API 调用模块（2.2KB）
│   ├── facebook-pixel.js     # Facebook Pixel 追踪（8.5KB）
│   ├── carousel.js           # 轮播图功能（4.1KB）
│   └── app.js                # 主应用逻辑（8.7KB）
└── assets/
    └── images/
        ├── activities-1.jpg  # 轮播图片 1（187KB）
        ├── activities-2.jpg  # 轮播图片 2（33KB）
        ├── activities-3.jpg  # 轮播图片 3（49KB）
        └── activities-4.jpg  # 轮播图片 4（95KB）
```

## 🚀 快速开始

### 方式一：直接打开（推荐）

1. 双击 `index.html` 文件
2. 页面将在默认浏览器中打开
3. ⚠️ 注意：表单提交功能需要后端 API 支持

### 方式二：使用本地服务器

#### 使用 Python
```bash
cd beetrade-activity
python -m http.server 8000
```

#### 使用 Node.js
```bash
cd beetrade-activity
npx http-server -p 8000
```

#### 使用 PHP
```bash
cd beetrade-activity
php -S localhost:8000
```

然后在浏览器中访问：`http://localhost:8000`

### 方式三：使用 API 测试工具

项目包含了一个可视化的 API 测试工具，可以快速测试接口功能：

1. 打开 `api-test.html` 文件
2. 点击相应按钮测试 GET/POST 接口
3. 查看实时响应结果和统计信息

**测试工具功能：**
- ✅ GET 请求测试（获取提交列表）
- ✅ POST 请求测试（提交测试数据）
- ✅ 无效数据测试（验证错误处理）
- ✅ 实时统计信息显示
- ✅ 响应时间监控
- ✅ 格式化 JSON 显示

**命令行测试：**
详细的 API 测试命令和示例请查看 [API_TEST.md](API_TEST.md) 文档。

### 方式四：部署到 Vercel（生产环境）

项目已配置好 Vercel 部署，可以一键部署到生产环境：

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署到生产环境
vercel --prod
```

**详细部署指南：** 请查看 [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) 文档。

**部署后功能：**
- ✅ 完整的静态网站托管
- ✅ Serverless API 接口（自动扩展）
- ✅ Vercel KV 数据存储（Redis 兼容）
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS 证书
- ✅ 自定义域名支持

## 🎯 功能特性

### 1. 轮播图展示
- ✅ 自动播放（5秒切换）
- ✅ 手动切换（前后按钮）
- ✅ 触摸滑动支持（移动端）
- ✅ 指示器点击切换
- ✅ 鼠标悬停暂停
- ✅ 页面可见性控制

### 2. 表单验证
- ✅ 实时验证（失焦触发）
- ✅ 错误提示显示
- ✅ XSS 防护（数据清洗）
- ✅ 必填字段验证
- ✅ 格式验证（邮箱、手机号）

### 3. 响应式设计
- ✅ 桌面端（>768px）：左右分栏布局
- ✅ 移动端（≤768px）：上下堆叠布局
- ✅ 平板适配
- ✅ 横屏模式适配

### 4. 用户体验优化
- ✅ Toast 提示（成功/错误/信息）
- ✅ 客服弹窗（提交成功后显示）
- ✅ 加载状态显示
- ✅ 防重复提交（5秒冷却）
- ✅ 无障碍优化（ARIA 属性）

## ⚙️ 配置说明

### 修改 API 地址

编辑 `config.js` 文件：

```javascript
const CONFIG = {
  // 修改为你的后端 API 地址
  API_BASE_URL: 'http://your-backend-api.com',

  // 修改客服链接
  CUSTOMER_SERVICE_URL: 'https://your-customer-service-link',

  // 其他配置...
};
```

### 修改 Facebook Pixel ID

编辑 `config.js` 文件：

```javascript
const CONFIG = {
  // 修改为你的 Facebook Pixel ID
  FACEBOOK_PIXEL_ID: 'your-pixel-id',

  // 是否启用高级匹配
  ENABLE_ADVANCED_MATCHING: true
};
```

## 📋 表单字段说明

| 字段 | 类型 | 验证规则 | 说明 |
|------|------|---------|------|
| Full Name | 必填 | 2-100 字符 | 用户全名 |
| Email | 必填 | 邮箱格式 | 用户邮箱 |
| Phone Number | 必填 | 10 位数字 | 印度手机号（6-9开头） |
| Telegram | 必填 | 1-100 字符 | Telegram 账号 |
| WhatsApp | 选填 | 最多 100 字符 | WhatsApp 账号 |

## 🔧 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **Vanilla JavaScript** - 交互逻辑
- **Facebook Pixel** - 用户行为追踪
- **SVG** - 图标显示
- **Responsive Design** - 响应式布局

## 📱 浏览器兼容性

- ✅ Chrome（最新版）
- ✅ Firefox（最新版）
- ✅ Safari（最新版）
- ✅ Edge（最新版）
- ✅ iOS Safari
- ✅ Android Chrome
- ❌ IE 11 及以下（不支持）

## ⚠️ 重要说明

### 1. 后端 API 依赖

表单提交功能需要后端 API 支持，默认 API 地址为：
```
POST http://activity.beetrade.in/api/v1/submissions
GET  http://activity.beetrade.in/api/v1/submissions
```

**API 接口说明：**

#### POST 提交数据
```bash
curl -X POST http://activity.beetrade.in/api/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "9876543210",
    "telegram": "@zhangsan",
    "whatsapp": "9876543210"
  }'
```

**请求字段：**
- `name` (必填): 用户全名
- `email` (必填): 用户邮箱
- `phone` (必填): 10位印度手机号
- `telegram` (必填): Telegram账号
- `whatsapp` (选填): WhatsApp账号

**响应示例：**
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

#### GET 获取提交列表
```bash
curl http://activity.beetrade.in/api/v1/submissions
```

返回所有提交的数据列表（JSON数组格式）。

如需本地测试，请修改 `config.js` 中的 `API_BASE_URL`。

### 2. 第三方服务

- **Facebook Pixel**：用于广告追踪，需要有效的 Pixel ID
- **客服链接**：默认跳转到 Telegram，可在 `config.js` 中修改

### 3. 图片资源

所有图片已下载到 `assets/images/` 目录，如图片加载失败，HTML 中有内联 SVG 占位图。

## 📊 性能优化

- ✅ CSS 和 JS 文件分离
- ✅ 图片懒加载（浏览器原生支持）
- ✅ 事件委托优化
- ✅ 防抖和节流处理
- ✅ 页面可见性 API 优化

## 🎨 自定义样式

### 修改主题色

编辑 `css/main.css` 文件中的 CSS 变量：

```css
:root {
  /* 主色调 */
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --primary-light: #7c8fef;

  /* 辅助色 */
  --secondary-color: #764ba2;
  --success-color: #67C23A;
  --error-color: #F56C6C;

  /* 其他颜色... */
}
```

## 📝 开发说明

### 文件职责

- **index.html** - 页面结构和内容
- **css/main.css** - 全局样式、布局、组件样式
- **css/responsive.css** - 响应式适配
- **js/validator.js** - 表单验证逻辑
- **js/api.js** - API 调用封装
- **js/carousel.js** - 轮播图功能
- **js/app.js** - 主应用逻辑和事件处理
- **js/facebook-pixel.js** - Facebook Pixel 追踪
- **config.js** - 全局配置

### 添加新功能

1. 在对应的 JS 文件中添加功能代码
2. 在 `index.html` 中添加必要的 HTML 结构
3. 在 `css/main.css` 中添加样式
4. 如需响应式适配，在 `css/responsive.css` 中添加媒体查询

## 🐛 常见问题

### Q: 表单提交失败？
A: 检查 `config.js` 中的 `API_BASE_URL` 是否正确，确保后端 API 可访问。

### Q: 图片无法显示？
A: 确保图片文件在 `assets/images/` 目录中，检查文件名是否正确。

### Q: 轮播图不工作？
A: 检查浏览器控制台是否有 JavaScript 错误，确保所有 JS 文件已正确加载。

### Q: 移动端样式异常？
A: 检查 `css/responsive.css` 是否正确加载，清除浏览器缓存后重试。

## 📄 许可证

本项目仅用于学习和研究目的，请勿用于商业用途。

## 🙏 致谢

感谢 BeeTrade 团队提供的原始网站设计。

---

**最后更新时间：** 2026-01-09

**版本：** 1.0.0
