// api/ebay-account-deletion.js

/**
 * eBay Marketplace Account Deletion Webhook
 * Vercel Node serverless function
 */
module.exports = async (req, res) => {
  console.log('--- eBay webhook incoming ---');
  console.log('Method:', req.method);
  console.log('Query:', req.query);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  // 有些验证会用 GET + challenge 参数
  if (req.method === 'GET' && req.query && req.query.challenge) {
    return res.status(200).send(req.query.challenge);
  }

  // 正式的删除通知一般是 POST JSON
  if (req.method === 'POST') {
    // TODO: 后面我们可以在这里写入 Supabase / 发送邮件等
    return res.status(200).json({ status: 'ok' });
  }

  // 其它情况统一 200，避免 eBay 认为失败
  return res.status(200).send('OK');
};
