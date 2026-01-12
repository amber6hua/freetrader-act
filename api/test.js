/**
 * 简化测试函数 - 验证 Vercel 部署是否正常
 */

export default function handler(req, res) {
  console.log('✅ Test function executed!');
  console.log('Method:', req.method);
  console.log('URL:', req.url);

  return res.status(200).json({
    success: true,
    message: 'Hello from Vercel API!',
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
