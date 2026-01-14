/**
 * Vercel Serverless Function - Submissions API
 * 处理表单提交的 GET 和 POST 请求
 * 使用 Vercel KV 存储数据
 * 通过 Telegram Bot 发送通知到群组
 *
 * 性能优化：
 * - 使用 context.waitUntil() 确保 Telegram 通知在后台完成
 * - 立即返回响应给用户，不阻塞 API 调用
 * - 保证通知一定会发送（即使响应已返回）
 */

import { kv } from '@vercel/kv';

// Telegram Bot 配置（从环境变量读取）
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 发送 Telegram 通知
async function sendTelegramNotification(submission) {
  // 如果未配置 Telegram Bot，跳过通知
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram Bot not configured, skipping notification');
    return { success: false, reason: 'not_configured' };
  }

  try {
    // 格式化消息
    const message = `
🎉 *新用户提交* #ID${submission.id}

👤 *姓名:* ${submission.name}
📧 *邮箱:* ${submission.email}
📱 *手机:* ${submission.phone}
💬 *Telegram:* ${submission.telegram}
${submission.whatsapp ? `📞 *WhatsApp:* ${submission.whatsapp}` : ''}
🌐 *IP地址:* ${submission.ip_address}
⏰ *提交时间:* ${new Date(submission.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}

---
_提交编号: ${submission.id}_
`.trim();

    // 发送到 Telegram（添加超时控制）
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    // 创建超时 Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Telegram request timeout')), 5000);
    });

    // 创建请求 Promise
    const fetchPromise = fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });

    // 使用 Promise.race 实现超时控制
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    const result = await response.json();

    if (!response.ok) {
      console.error('Telegram API Error:', result);
      return { success: false, error: result };
    }

    console.log('Telegram notification sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return { success: false, error: error.message };
  }
}

// 数据验证函数
function validateSubmission(data) {
  const errors = [];

  // 验证 name
  if (!data.name || data.name.trim().length < 2 || data.name.trim().length > 100) {
    errors.push('Name must be between 2-100 characters');
  }

  // 验证 email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // 验证 phone (印度手机号格式：10位数字，6-9开头)
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!data.phone || !phoneRegex.test(data.phone)) {
    errors.push('Invalid phone number format (must be 10 digits starting with 6-9)');
  }

  // 验证 telegram
  if (!data.telegram || data.telegram.trim().length < 1 || data.telegram.trim().length > 100) {
    errors.push('Telegram is required (1-100 characters)');
  }

  // 验证 whatsapp (可选)
  if (data.whatsapp && data.whatsapp.trim().length > 100) {
    errors.push('WhatsApp must not exceed 100 characters');
  }

  return errors;
}

// 获取客户端 IP 地址
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    'unknown'
  );
}

// GET 请求处理 - 获取所有提交
async function handleGet(req, res) {
  try {
    console.log('[GET] Fetching submissions...');

    // 从 KV 获取所有提交的 ID 列表
    const submissionIds = await kv.lrange('submissions:ids', 0, -1);

    if (!submissionIds || submissionIds.length === 0) {
      console.log('[GET] No submissions found');
      return res.status(200).json([]);
    }

    console.log(`[GET] Found ${submissionIds.length} submission IDs`);

    // 获取所有提交的详细数据
    const submissions = await Promise.all(
      submissionIds.map(async (id) => {
        const data = await kv.get(`submission:${id}`);
        return data;
      })
    );

    // 过滤掉 null 值并按 ID 降序排序
    const validSubmissions = submissions
      .filter(s => s !== null)
      .sort((a, b) => b.id - a.id);

    console.log(`[GET] Returning ${validSubmissions.length} valid submissions`);
    return res.status(200).json(validSubmissions);
  } catch (error) {
    console.error('[GET] Error:', error);
    return res.status(500).json({
      detail: 'Failed to fetch submissions',
      message: error.message,
    });
  }
}

// POST 请求处理 - 创建新提交
async function handlePost(req, res, context) {
  try {
    console.log('[POST] Starting request handling...');
    console.log('[POST] Request body:', req.body);

    // 验证数据
    console.log('[POST] Validating submission data...');
    const errors = validateSubmission(req.body);
    if (errors.length > 0) {
      console.error('[POST] Validation failed:', errors);
      return res.status(400).json({
        detail: errors.join(', '),
        message: 'Validation failed',
      });
    }

    // 生成唯一 ID
    console.log('[POST] Generating unique ID...');
    const id = await kv.incr('submissions:counter');
    console.log('[POST] Generated ID:', id);

    // 获取客户端 IP
    const ipAddress = getClientIP(req);

    // 创建提交数据
    const submission = {
      id,
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      phone: req.body.phone.trim(),
      telegram: req.body.telegram.trim(),
      whatsapp: req.body.whatsapp ? req.body.whatsapp.trim() : null,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 保存到 KV
    console.log('[POST] Saving to KV...');
    await kv.set(`submission:${id}`, submission);
    console.log('[POST] Saved to KV successfully');

    // 将 ID 添加到列表（最新的在前面）
    console.log('[POST] Adding ID to list...');
    await kv.lpush('submissions:ids', id);
    console.log('[POST] Added to list successfully');

    // 使用 waitUntil 确保 Telegram 通知在后台完成
    // 这样可以立即返回响应，同时保证通知一定会发送
    console.log('[POST] Scheduling Telegram notification (background task)...');
    const telegramTask = sendTelegramNotification(submission)
      .then(result => {
        console.log('[POST] Telegram notification completed:', result);
        return result;
      })
      .catch(error => {
        console.error('[POST] Telegram notification failed:', error);
        return { success: false, error: error.message };
      });

    // 使用 waitUntil 确保后台任务完成（如果支持）
    if (context && typeof context.waitUntil === 'function') {
      console.log('[POST] Using waitUntil for background task');
      context.waitUntil(telegramTask);
    } else {
      // 降级方案：如果不支持 waitUntil，则等待通知完成
      console.log('[POST] waitUntil not available, waiting for notification...');
      await telegramTask;
    }

    console.log('[POST] Request completed successfully');
    return res.status(201).json(submission);
  } catch (error) {
    console.error('[POST] Error:', error);
    return res.status(500).json({
      detail: 'Failed to create submission',
      message: error.message,
    });
  }
}

// 主处理函数 - Vercel Serverless Function 标准格式
export default async function handler(req, res, context) {
  console.log(`[${req.method}] Request received at /api/v1/submissions`);

  // 设置 CORS 头部
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 请求（CORS 预检）
  if (req.method === 'OPTIONS') {
    console.log('[OPTIONS] CORS preflight request');
    return res.status(204).end();
  }

  // 处理 GET 请求
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  // 处理 POST 请求（传递 context）
  if (req.method === 'POST') {
    return handlePost(req, res, context);
  }

  // 不支持的方法
  console.log(`[${req.method}] Method not allowed`);
  return res.status(405).json({
    detail: 'Method not allowed',
    message: `Method ${req.method} is not supported`,
  });
}
