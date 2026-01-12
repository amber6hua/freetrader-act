/**
 * 主应用逻辑
 * 处理表单提交、用户交互、弹窗显示等核心功能
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 获取DOM元素
  const form = document.getElementById('submissionForm');
  const submitBtn = document.getElementById('submitBtn');
  const customerDialog = document.getElementById('customerDialog');
  const customerServiceBtn = document.getElementById('customerServiceBtn');
  const closeDialog = document.getElementById('closeDialog');
  const toast = document.getElementById('toast');

  // 防重复提交控制
  let canSubmit = true;
  let submitCooldownTimer = null;

  /**
   * 初始化 - 设置实时验证监听器
   */
  function init() {
    // 为所有必填输入框添加失焦验证
    const requiredInputs = form.querySelectorAll('input[required]');
    requiredInputs.forEach(input => {
      // 失焦时验证
      input.addEventListener('blur', function() {
        const result = Validator.validateField(this.name, this.value);
        if (!result.valid) {
          Validator.showError(this.name, result.message);
        } else {
          Validator.clearError(this.name);
        }
      });

      // 输入时清除错误提示
      input.addEventListener('input', function() {
        if (this.classList.contains('error')) {
          Validator.clearError(this.name);
        }
      });
    });

    // 选填字段也添加输入清除错误的监听
    const optionalInputs = form.querySelectorAll('input:not([required])');
    optionalInputs.forEach(input => {
      input.addEventListener('input', function() {
        if (this.classList.contains('error')) {
          Validator.clearError(this.name);
        }
      });
    });
  }

  /**
   * 表单提交处理
   */
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // 防重复提交检查
    if (!canSubmit) {
      showToast('请勿频繁提交，请稍后再试', 'error');
      return;
    }

    // 1. 收集表单数据
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      telegram: document.getElementById('telegram').value.trim(),
      whatsapp: document.getElementById('whatsapp').value.trim() || null
    };

    // 2. 数据清洗（防XSS）
    for (const key in formData) {
      if (formData[key] && typeof formData[key] === 'string') {
        formData[key] = Validator.sanitize(formData[key]);
      }
    }

    // 3. 前端验证
    const { isValid, errors } = Validator.validateForm(formData);
    
    if (!isValid) {
      // 显示所有错误
      for (const [field, message] of Object.entries(errors)) {
        Validator.showError(field, message);
      }
      showToast('Please check the form fields', 'error');
      
      // 聚焦到第一个错误字段
      const firstErrorField = Object.keys(errors)[0];
      const firstErrorInput = document.getElementById(firstErrorField);
      if (firstErrorInput) {
        firstErrorInput.focus();
      }
      
      return;
    }

    // 4. 提交数据到后端
    try {
      // 禁用提交按钮，显示加载状态
      setSubmitButtonLoading(true);

      // 调用API
      const response = await API.submitForm(formData);

      // 5. Submission successful
      console.log('Submit success:', response);
      showToast('Submission successful! Thank you for joining BeeTrade', 'success');
      
      // 6. 追踪 Facebook Lead 事件（高级匹配）
      if (typeof FacebookPixel !== 'undefined') {
        try {
          await FacebookPixel.trackLead(formData);
          console.log('📊 Facebook Lead event tracked successfully');
        } catch (pixelError) {
          console.error('⚠️ Facebook Pixel tracking failed (non-critical):', pixelError);
          // 不阻断用户流程，静默失败
        }
      }
      
      // 7. 清空表单
      form.reset();
      Validator.clearAllErrors();

      // 8. 延迟显示客服弹窗
      setTimeout(() => {
        showCustomerDialog();
      }, 500);

      // 9. 启动防重复提交冷却
      startSubmitCooldown();

    } catch (error) {
      // Submission failed
      console.error('Submit error:', error);
      showToast(error.message || 'Submission failed, please try again later', 'error');
    } finally {
      // 恢复提交按钮
      setSubmitButtonLoading(false);
    }
  });

  /**
   * 设置提交按钮加载状态
   * @param {boolean} isLoading - 是否加载中
   */
  function setSubmitButtonLoading(isLoading) {
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    
    if (isLoading) {
      submitBtn.disabled = true;
      btnText.textContent = 'Submitting...';
      loader.classList.remove('hidden');
    } else {
      submitBtn.disabled = false;
      btnText.textContent = 'Submit';
      loader.classList.add('hidden');
    }
  }

  /**
   * 启动提交冷却时间
   */
  function startSubmitCooldown() {
    canSubmit = false;
    
    // 清除之前的定时器
    if (submitCooldownTimer) {
      clearTimeout(submitCooldownTimer);
    }
    
    // 设置冷却时间
    submitCooldownTimer = setTimeout(() => {
      canSubmit = true;
    }, CONFIG.SUBMIT_COOLDOWN);
  }

  /**
   * 显示客服弹窗
   */
  function showCustomerDialog() {
    customerDialog.classList.remove('hidden');
    // 添加无障碍属性
    customerDialog.setAttribute('aria-hidden', 'false');
    // 聚焦到客服按钮
    customerServiceBtn.focus();
  }

  /**
   * 隐藏客服弹窗
   */
  function hideCustomerDialog() {
    customerDialog.classList.add('hidden');
    customerDialog.setAttribute('aria-hidden', 'true');
  }

  /**
   * 客服按钮点击 - 跳转到客服链接
   */
  customerServiceBtn.addEventListener('click', function() {
    // 追踪Facebook Contact事件
    if (typeof FacebookPixel !== 'undefined') {
      try {
        FacebookPixel.trackContact({
          source: 'lead_submission_dialog',
          content_name: 'Customer Service Contact',
          customer_service_url: CONFIG.CUSTOMER_SERVICE_URL
        });
        console.log('📊 Facebook Contact event tracked');
      } catch (error) {
        console.error('⚠️ Facebook Contact event tracking failed (non-critical):', error);
      }
    }
    
    // 打开客服链接
    window.open(CONFIG.CUSTOMER_SERVICE_URL, '_blank', 'noopener,noreferrer');
  });

  /**
   * 关闭按钮点击
   */
  closeDialog.addEventListener('click', function() {
    hideCustomerDialog();
  });

  /**
   * 点击遮罩层关闭弹窗
   */
  customerDialog.addEventListener('click', function(e) {
    if (e.target === customerDialog) {
      hideCustomerDialog();
    }
  });

  /**
   * ESC键关闭弹窗
   */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !customerDialog.classList.contains('hidden')) {
      hideCustomerDialog();
    }
  });

  /**
   * 显示Toast提示
   * @param {string} message - 提示信息
   * @param {string} type - 类型：success | error | info
   */
  function showToast(message, type = 'success') {
    // 清除之前的类
    toast.className = 'toast';
    
    // 设置消息和类型
    toast.textContent = message;
    toast.classList.add(type);
    toast.classList.remove('hidden');
    
    // 设置无障碍属性
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    // 自动隐藏
    setTimeout(() => {
      toast.classList.add('hidden');
    }, CONFIG.TOAST_DURATION);
  }

  /**
   * 图片加载错误处理（已在HTML中内联处理）
   */
  const promotionImage = document.querySelector('.promotion-image img');
  if (promotionImage) {
    promotionImage.addEventListener('error', function() {
      console.warn('推广图片加载失败，使用占位图');
    });
  }

  // 执行初始化
  init();

  // Development mode: output configuration
  if (CONFIG.API_BASE_URL.includes('localhost')) {
    console.log('🚀 Development Mode');
    console.log('API URL:', CONFIG.API_BASE_URL);
    console.log('Customer Service URL:', CONFIG.CUSTOMER_SERVICE_URL);
  }
});

/**
 * 页面性能监控（可选）
 */
window.addEventListener('load', function() {
  // Calculate page load time
  if (window.performance && window.performance.timing) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`📊 Page Load Time: ${pageLoadTime}ms`);
  }
});

