// index.js
require('dotenv').config(); // 本地开发时从 .env 读取环境变量

const express = require('express');
const crypto = require('crypto');

const app = express();

// 云环境会通过 PORT 环境变量指定端口
const PORT = process.env.PORT || 3000;

// 从环境变量读取 eBay 的配置
const VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;
const ENDPOINT_URL = process.env.EBAY_ENDPOINT_URL;

if (!VERIFICATION_TOKEN || !ENDPOINT_URL) {
  console.warn('⚠️ 环境变量未配置完整：EBAY_VERIFICATION_TOKEN 或 EBAY_ENDPOINT_URL 缺失');
}

// 解析 JSON body
app.use(express.json());

// 1) eBay 的验证请求（GET）
app.get('/webhooks/ebay/account-deletion', (req, res) => {
  const challengeCode = req.query.challenge_code;

  if (!challengeCode) {
    console.log('⚠️ 收到验证请求但没有 challenge_code');
    return res.status(400).send('Missing challenge_code');
  }

  console.log('🔐 收到 eBay 验证请求, challenge_code =', challengeCode);

  const dataToHash = challengeCode + VERIFICATION_TOKEN + ENDPOINT_URL;
  const hash = crypto.createHash('sha256').update(dataToHash, 'utf8').digest('hex');

  const body = { challengeResponse: hash };

  console.log('✅ 返回 challengeResponse 给 eBay:', body);

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify(body));
});

// 2) 真正的账号删除通知（POST）
app.post('/webhooks/ebay/account-deletion', (req, res) => {
  console.log('📩 收到 eBay Marketplace Account Deletion 通知:');
  console.log(JSON.stringify(req.body, null, 2));

  // TODO: 今后写入 Supabase，清理用户数据等
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
