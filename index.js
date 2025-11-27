// index.js
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 10000;
const VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;

app.use(express.json());

// 简单健康检查
app.get('/', (req, res) => {
  res.send('cardfolio eBay webhook is running');
});

app.post('/webhooks/ebay/account-deletion', (req, res) => {
  console.log('收到 eBay 请求:', JSON.stringify(req.body, null, 2));

  const { metadata, notification, challengeCode } = req.body;
  const topic = metadata && metadata.topic;

  // 1）验证请求（带 challengeCode）
  if (topic === 'MARKETPLACE_ACCOUNT_DELETION' && challengeCode) {
    if (!VERIFICATION_TOKEN) {
      console.error('环境变量 EBAY_VERIFICATION_TOKEN 未设置！');
      return res.status(500).send('Verification token not configured');
    }

    const challengeResponse = crypto
      .createHmac('sha256', VERIFICATION_TOKEN)
      .update(challengeCode)
      .digest('hex');

    console.log('返回 challengeResponse 给 eBay:', challengeResponse);

    return res.status(200).json({ challengeResponse });
  }

  // 2）真的账号删除通知
  if (topic === 'MARKETPLACE_ACCOUNT_DELETION' && notification) {
    console.log('收到 Marketplace Account Deletion 通知：', JSON.stringify(notification, null, 2));
    return res.sendStatus(200);
  }

  // 其他情况
  return res.sendStatus(400);
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
