/**
 * 表单验证器模块
 * 负责前端表单字段的验证逻辑
 */

const Validator = {
  /**
   * 验证规则定义
   */
  rules: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Please enter a name between 2-100 characters'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      required: true,
      pattern: /^[6-9]\d{9}$/,
      message: 'Please enter a valid 10-digit phone number'
    },
    telegram: {
      required: true,
      minLength: 1,
      maxLength: 100,
      message: 'Please enter your Telegram account'
    },
    whatsapp: {
      required: false,  // Optional field
      maxLength: 100
    }
  },

  /**
   * 验证单个字段
   * @param {string} fieldName - 字段名
   * @param {string} value - 字段值
   * @returns {Object} { valid: boolean, message: string }
   */
  validateField(fieldName, value) {
    const rule = this.rules[fieldName];
    if (!rule) {
      return { valid: true };
    }

    // 选填字段且值为空，直接通过
    if (!rule.required && !value.trim()) {
      return { valid: true };
    }

    // Required field validation
    if (rule.required && !value.trim()) {
      return { 
        valid: false, 
        message: rule.message || `${fieldName} is required` 
      };
    }

    // Minimum length validation
    if (rule.minLength && value.trim().length < rule.minLength) {
      return { 
        valid: false, 
        message: rule.message || `${fieldName} must be at least ${rule.minLength} characters` 
      };
    }

    // Maximum length validation
    if (rule.maxLength && value.trim().length > rule.maxLength) {
      return { 
        valid: false, 
        message: rule.message || `${fieldName} must not exceed ${rule.maxLength} characters` 
      };
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.trim())) {
      return { 
        valid: false, 
        message: rule.message || `${fieldName} format is invalid` 
      };
    }

    return { valid: true };
  },

  /**
   * 验证整个表单
   * @param {Object} formData - 表单数据对象
   * @returns {Object} { isValid: boolean, errors: Object }
   */
  validateForm(formData) {
    const errors = {};
    let isValid = true;

    for (const [field, value] of Object.entries(formData)) {
      // 跳过null值的选填字段
      if (value === null || value === undefined) {
        continue;
      }

      const result = this.validateField(field, value);
      if (!result.valid) {
        errors[field] = result.message;
        isValid = false;
      }
    }

    return { isValid, errors };
  },

  /**
   * 显示字段错误信息
   * @param {string} fieldName - 字段名
   * @param {string} message - 错误信息
   */
  showError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorSpan = document.getElementById(`${fieldName}-error`);
    
    if (input) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
    }
    
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.classList.add('show');
    }
  },

  /**
   * 清除字段错误信息
   * @param {string} fieldName - 字段名
   */
  clearError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorSpan = document.getElementById(`${fieldName}-error`);
    
    if (input) {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
    }
    
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.classList.remove('show');
    }
  },

  /**
   * 清除所有错误信息
   */
  clearAllErrors() {
    const allInputs = document.querySelectorAll('.form-group input');
    allInputs.forEach(input => {
      this.clearError(input.name);
    });
  },

  /**
   * 数据清洗（防止XSS）
   * @param {string} value - 输入值
   * @returns {string} 清洗后的值
   */
  sanitize(value) {
    if (typeof value !== 'string') return value;
    
    // 移除HTML标签
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
  }
};

// 如果在Node环境中（用于测试），导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
}

