// api/ebay-account-deletion.js

module.exports = (req, res) => {
  const eventId = req.headers['x-ebay-message-id'] || null;
  const topic = req.headers['x-ebay-topic'] || null;

  console.log('---------------- eBay account deletion webhook ----------------');
  console.log('Time   :', new Date().toISOString());
  console.log('EventID:', eventId);
  console.log('Topic  :', topic);
  console.log('Headers:', req.headers);
  console.log('Body   :', JSON.stringify(req.body, null, 2));
  console.log('----------------------------------------------------------------');

  // TODO: 这里未来可以接你自己的业务逻辑：
  // 比如找到对应用户 → 标记为已删除 / 清除数据等等

  res.status(200).send({ status: 'ok' });
};
