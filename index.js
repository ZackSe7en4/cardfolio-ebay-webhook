// index.js
const express = require('express');
const crypto = require('crypto');

const app = express();

// 让 Express 能解析 JSON 请求体
app.use(express.json());

// 根路径健康检查（方便在浏览器里看服务是否在线）
app.get('/', (req, res) => {
  res.send('cardfolio-ebay-webhook is running');
});

// eBay Marketplace Account Deletion webhook
app.post('/webhooks/ebay/account-deletion', (req, res) => {
  console.log('\n📩 收到 /webhooks/ebay/account-deletion 请求');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  const body = req.body || {};

  // 1️⃣ 验证 challenge（eBay 在你保存 endpoint 时发送）
  const challengeCode =
    body.challengeCode ||
    body.challenge_code ||
    (body.verification && body.verification.challengeCode);

  const verificationToken =
    body.verificationToken ||
    body.verification_token ||
    (body.verification && body.verification.verificationToken);

  const expectedToken = process.env.EBAY_VERIFICATION_TOKEN;

  if (challengeCode && verificationToken) {
    console.log('🔐 验证请求:');
    console.log('  challengeCode      =', challengeCode);
    console.log('  verificationToken  =', verificationToken);
    console.log('  expectedToken(.env)=', expectedToken);

    if (verificationToken !== expectedToken) {
      console.error('❌ 验证失败: verificationToken 不匹配');
      return res.status(401).json({ error: 'Invalid verification token' });
    }

    // 按 eBay 要求返回 challengeResponse
    const response = { challengeResponse: challengeCode };
    console.log('✅ 返回 challengeResponse 给 eBay:', response);
    return res.status(200).json(response);
  }

  // 2️⃣ 正常的删除通知（保存成功后，Send Test Notification 会走这里）
  console.log('📘 收到 eBay Marketplace Account Deletion 通知:');
  console.log(JSON.stringify(body, null, 2));

  // TODO: 这里按你的业务逻辑处理账号删除通知

  return res.status(200).json({ status: 'ok' });
});

// Render 会注入 PORT， 本地则用 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
