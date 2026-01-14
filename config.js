/**
 * 前端配置文件
 * 用于管理API地址、客服链接等配置项
 */

const CONFIG = {
  // API基础地址
  // 自动检测环境：本地开发使用 localhost，生产环境使用当前域名
  API_BASE_URL: (typeof window !== 'undefined' &&
                 (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:3000'  // 本地开发环境（使用 vercel dev）
    : (typeof window !== 'undefined' ? window.location.origin : ''),  // 生产环境（Vercel 部署后自动使用当前域名）
  
  // Customer service link
  // After successful submission, users clicking "Contact Customer Service" will be redirected to this link
  CUSTOMER_SERVICE_URL: 'https://clickurl.org/wyYCjA',  // Example: Telegram customer service
  
  // Other configuration
  TOAST_DURATION: 3000,  // Toast notification duration (milliseconds)
  SUBMIT_COOLDOWN: 5000,  // Submit cooldown time (milliseconds)
  
  // Facebook Pixel configuration
  FACEBOOK_PIXEL_ID: '',  // Facebook Pixel ID
  ENABLE_ADVANCED_MATCHING: true  // Enable Advanced Matching (hash user data for better ad targeting)
};

// 如果在Node环境中（用于测试），导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

