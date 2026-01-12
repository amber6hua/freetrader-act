/**
 * API调用模块
 * 封装与后端API的所有交互逻辑
 */

const API = {
  /**
   * 提交表单数据
   * @param {Object} formData - 表单数据
   * @returns {Promise<Object>} API响应数据
   */
  async submitForm(formData) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      // 解析响应
      const data = await response.json();

      // 处理HTTP错误状态
      if (!response.ok) {
        throw new Error(data.detail || data.message || '提交失败，请稍后重试');
      }

      return data;
    } catch (error) {
      // Network error or other exceptions
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network connection failed, please check your connection and try again');
      }
      
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * 通用GET请求（预留，用于后续功能扩展）
   * @param {string} endpoint - API端点
   * @returns {Promise<Object>}
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * 检查API健康状态（预留）
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};

// 如果在Node环境中（用于测试），导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}

