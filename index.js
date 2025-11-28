const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 10000;

// 从 Render 环境变量读取
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;

// 解析 JSON
app.use(bodyParser.json());

// 根路径测试
app.get("/", (req, res) => {
  res.send("cardfolio eBay webhook is running");
});


// ===========================
//   eBay Account Deletion
// ===========================
app.all("/webhooks/ebay/account-deletion", (req, res) => {
  console.log("▶️ 收到请求:", req.method, req.url);

  // 1) eBay 探活 GET / HEAD
  if (req.method !== "POST") {
    console.log("🔍 探活请求（非 POST），返回 200 OK");
    return res.status(200).send("OK");
  }

  // 2) POST — 校验 challenge
  console.log("📩 eBay POST Body:", JSON.stringify(req.body, null, 2));

  const { metadata, challengeCode, verificationToken } = req.body || {};

  // 校验 topic
  if (!metadata || metadata.topic !== "MARKETPLACE_ACCOUNT_DELETION") {
    console.error("❌ topic 无效:", metadata);
    return res.status(400).send("Invalid topic");
  }

  // 校验 verificationToken
  if (!verificationToken || verificationToken !== EBAY_VERIFICATION_TOKEN) {
    console.error(
      "❌ verificationToken 不匹配： 来自 eBay =", verificationToken,
      " 本地 =", EBAY_VERIFICATION_TOKEN
    );
    return res.status(400).send("Invalid verification token");
  }

  // 生成 response
  const challengeResponse = crypto
    .createHash("sha256")
    .update(challengeCode + verificationToken)
    .digest("hex");

  console.log("✅ challengeResponse =", challengeResponse);

  return res.status(200).json({ challengeResponse });
});


// 启动服务
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
