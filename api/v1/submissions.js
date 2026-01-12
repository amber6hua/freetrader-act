/**
 * Vercel Serverless Function - Submissions API
 * 处理表单提交的 GET 和 POST 请求
 * 使用 Vercel KV 存储数据
 * 通过 Telegram Bot 发送通知到群组
 */

import { kv } from '@vercel/kv';

// CORS 头部配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

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
function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// GET 请求处理 - 获取所有提交
async function handleGet() {
  try {
    // 从 KV 获取所有提交的 ID 列表
    const submissionIds = await kv.lrange('submissions:ids', 0, -1);

    if (!submissionIds || submissionIds.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: corsHeaders,
      });
    }

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

    return new Response(JSON.stringify(validSubmissions), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('GET Error:', error);
    return new Response(
      JSON.stringify({
        detail: 'Failed to fetch submissions',
        message: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// POST 请求处理 - 创建新提交
async function handlePost(request) {
  try {
    console.log('[POST] Starting request handling...');

    // 解析请求体 - 兼容不同的 Request 对象
    let body;
    try {
      // 尝试使用标准的 Request.json() 方法
      body = await request.json();
      console.log('[POST] Request body parsed successfully');
    } catch (jsonError) {
      console.error('[POST] JSON parse error:', jsonError);
      // 如果失败，尝试读取文本并解析
      try {
        const text = typeof request.text === 'function'
          ? await request.text()
          : request.body;
        body = typeof text === 'string' ? JSON.parse(text) : text;
        console.log('[POST] Request body parsed from text');
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        return new Response(
          JSON.stringify({
            detail: 'Invalid JSON in request body',
            message: parseError.message,
          }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }
    }

    // 验证数据
    console.log('[POST] Validating submission data...');
    const errors = validateSubmission(body);
    if (errors.length > 0) {
      console.error('[POST] Validation failed:', errors);
      return new Response(
        JSON.stringify({
          detail: errors.join(', '),
          message: 'Validation failed',
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 生成唯一 ID
    console.log('[POST] Generating unique ID...');
    const id = await kv.incr('submissions:counter');
    console.log('[POST] Generated ID:', id);

    // 获取客户端 IP
    const ipAddress = getClientIP(request);

    // 创建提交数据
    const submission = {
      id,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
      telegram: body.telegram.trim(),
      whatsapp: body.whatsapp ? body.whatsapp.trim() : null,
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

    // 发送 Telegram 通知（异步，不阻塞响应）
    console.log('[POST] Triggering Telegram notification (non-blocking)...');
    sendTelegramNotification(submission).catch(error => {
      console.error('Telegram notification failed (non-blocking):', error);
    });

    console.log('[POST] Request completed successfully');
    return new Response(JSON.stringify(submission), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('POST Error:', error);
    return new Response(
      JSON.stringify({
        detail: 'Failed to create submission',
        message: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

// OPTIONS 请求处理 - CORS 预检
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 主处理函数
export default async function handler(request) {
  const method = request.method;

  // 处理 OPTIONS 请求（CORS 预检）
  if (method === 'OPTIONS') {
    return handleOptions();
  }

  // 处理 GET 请求
  if (method === 'GET') {
    return handleGet();
  }

  // 处理 POST 请求
  if (method === 'POST') {
    return handlePost(request);
  }

  // 不支持的方法
  return new Response(
    JSON.stringify({
      detail: 'Method not allowed',
      message: `Method ${method} is not supported`,
    }),
    {
      status: 405,
      headers: corsHeaders,
    }
  );
}
