/**
 * Facebook Pixel 工具模块
 * 提供事件追踪和高级匹配（Advanced Matching）功能
 * 
 * 功能说明：
 * - 追踪标准事件（PageView、Lead等）
 * - 自动哈希用户数据（SHA256）以保护隐私
 * - 支持测试模式（Test Event Code）
 * - 浏览器兼容性降级处理
 */

const FacebookPixel = {
  /**
   * 检查Facebook Pixel是否已加载
   * @returns {boolean} - 像素是否可用
   */
  isAvailable() {
    return typeof fbq !== 'undefined' && typeof CONFIG !== 'undefined' && CONFIG.FACEBOOK_PIXEL_ID;
  },

  /**
   * 追踪表单提交事件（Lead）
   * @param {Object} userData - 用户数据对象
   * @param {string} userData.name - 用户姓名
   * @param {string} userData.email - 用户邮箱
   * @param {string} userData.phone - 用户电话
   * @param {string} [userData.telegram] - Telegram账号（可选）
   * @param {string} [userData.whatsapp] - WhatsApp账号（可选）
   */
  async trackLead(userData) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Facebook Pixel is not available. Skipping Lead event tracking.');
      return;
    }

    try {
      // 生成唯一事件ID（用于去重）
      const eventID = 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // 标准事件参数
      const eventParams = {
        content_name: 'BeeTrade Registration Form',
        content_category: 'user_registration',
        status: 'submitted',
        value: 1.00,  // 每个潜在客户的价值（可根据实际调整）
        currency: 'INR'
      };

      // 高级匹配参数（如果启用）
      let advancedMatchingParams = {};
      if (CONFIG.ENABLE_ADVANCED_MATCHING && userData) {
        advancedMatchingParams = await this.prepareAdvancedMatchingData(userData);
      }

      // 发送事件到Facebook
      fbq('track', 'Lead', eventParams, {
        eventID: eventID,
        ...advancedMatchingParams
      });
      
      console.log('✅ Facebook Pixel Lead Event Sent:', {
        event: 'Lead',
        eventID: eventID,
        params: eventParams
      });

    } catch (error) {
      console.error('❌ Facebook Pixel tracking error:', error);
    }
  },

  /**
   * 追踪联系客服事件（Contact）
   * 用户点击"联系客服"按钮时调用
   * @param {Object} params - 事件参数
   * @param {string} [params.source] - 来源（如：lead_submission_dialog）
   * @param {string} [params.content_name] - 内容名称
   * @param {string} [params.customer_service_url] - 客服链接
   */
  trackContact(params = {}) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Facebook Pixel is not available. Skipping Contact event tracking.');
      return;
    }

    try {
      // 生成唯一事件ID（用于去重）
      const eventID = 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // 标准事件参数
      const eventParams = {
        content_name: params.content_name || 'Customer Service Contact',
        content_category: 'customer_service',
        source: params.source || 'dialog',
        value: 2.00,  // 联系客服的价值（高于Lead，因为用户意向更强）
        currency: 'INR'
      };

      // 发送Contact事件到Facebook
      fbq('track', 'Contact', eventParams, {
        eventID: eventID
      });

      console.log('✅ Facebook Pixel Contact Event Sent:', {
        event: 'Contact',
        eventID: eventID,
        params: eventParams
      });

    } catch (error) {
      console.error('❌ Facebook Pixel Contact event tracking error:', error);
    }
  },

  /**
   * 准备高级匹配数据
   * Facebook要求的格式：小写、去空格、SHA256哈希
   * @param {Object} userData - 原始用户数据
   * @returns {Promise<Object>} - 哈希后的高级匹配参数
   */
  async prepareAdvancedMatchingData(userData) {
    const matchingData = {};

    try {
      // 邮箱哈希（em）
      if (userData.email) {
        const normalizedEmail = this.normalizeEmail(userData.email);
        matchingData.em = await this.sha256(normalizedEmail);
      }

      // 电话号码哈希（ph）
      if (userData.phone) {
        const normalizedPhone = this.normalizePhone(userData.phone);
        matchingData.ph = await this.sha256(normalizedPhone);
      }

      // 姓名哈希（fn - first name, ln - last name）
      if (userData.name) {
        const normalizedName = this.normalizeName(userData.name);
        // 假设用户输入的是全名，取第一个词作为名字
        const nameParts = normalizedName.split(' ');
        if (nameParts.length > 0) {
          matchingData.fn = await this.sha256(nameParts[0]);  // First name
        }
        if (nameParts.length > 1) {
          matchingData.ln = await this.sha256(nameParts[nameParts.length - 1]);  // Last name
        }
      }

      console.log('🔐 Advanced Matching Data Prepared (hashed):', {
        hasEmail: !!matchingData.em,
        hasPhone: !!matchingData.ph,
        hasFirstName: !!matchingData.fn,
        hasLastName: !!matchingData.ln
      });

      return matchingData;

    } catch (error) {
      console.error('❌ Advanced Matching data preparation failed:', error);
      return {};  // 降级：不发送高级匹配数据
    }
  },

  /**
   * 规范化邮箱地址
   * @param {string} email - 原始邮箱
   * @returns {string} - 规范化后的邮箱（小写、去空格）
   */
  normalizeEmail(email) {
    return email.trim().toLowerCase();
  },

  /**
   * 规范化电话号码
   * @param {string} phone - 原始电话
   * @returns {string} - 规范化后的电话（仅保留数字）
   */
  normalizePhone(phone) {
    // 移除所有非数字字符（包括空格、横线、括号等）
    return phone.replace(/\D/g, '');
  },

  /**
   * 规范化姓名
   * @param {string} name - 原始姓名
   * @returns {string} - 规范化后的姓名（小写、去空格）
   */
  normalizeName(name) {
    return name.trim().toLowerCase();
  },

  /**
   * SHA256 哈希函数
   * 使用 Web Crypto API 进行安全哈希
   * @param {string} text - 待哈希的文本
   * @returns {Promise<string>} - 哈希结果（十六进制字符串）
   */
  async sha256(text) {
    // 检查浏览器是否支持 Web Crypto API
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('⚠️ Web Crypto API not supported. Advanced Matching disabled.');
      return null;
    }

    try {
      // 将字符串转换为 Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      // 计算 SHA256 哈希
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);

      // 将 ArrayBuffer 转换为十六进制字符串
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

      return hashHex;

    } catch (error) {
      console.error('❌ SHA256 hashing failed:', error);
      return null;
    }
  },

  /**
   * 追踪自定义事件（扩展用）
   * @param {string} eventName - 自定义事件名称
   * @param {Object} params - 事件参数
   */
  trackCustomEvent(eventName, params = {}) {
    if (!this.isAvailable()) {
      console.warn('⚠️ Facebook Pixel is not available. Skipping custom event:', eventName);
      return;
    }

    try {
      const eventID = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      fbq('trackCustom', eventName, params, {
        eventID: eventID
      });

      console.log('✅ Facebook Pixel Custom Event Sent:', {
        event: eventName,
        eventID: eventID,
        params: params
      });

    } catch (error) {
      console.error('❌ Facebook Pixel custom event tracking error:', error);
    }
  },

  /**
   * 初始化检查（页面加载时调用）
   */
  init() {
    if (this.isAvailable()) {
      console.log('✅ Facebook Pixel Initialized:', CONFIG.FACEBOOK_PIXEL_ID);
    } else {
      console.warn('⚠️ Facebook Pixel not available. Check if pixel code is loaded in <head>.');
    }
  }
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    FacebookPixel.init();
  });
} else {
  FacebookPixel.init();
}

// 导出到全局（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FacebookPixel;
}

