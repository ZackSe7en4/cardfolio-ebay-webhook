// index.js
const express = require('express');
const app = express();
const handleEbayAccountDeletion = require('./api/ebay-account-deletion');

// 解析 JSON 请求体
app.use(express.json());

// 简单健康检查
app.get('/', (req, res) => {
  res.send('CardFolio eBay webhook is running');
});

// eBay 账号删除 webhook 入口
app.post('/webhooks/ebay/account-deletion', handleEbayAccountDeletion);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
