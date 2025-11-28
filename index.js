const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 10000;

// 和 eBay 页面里填的一模一样
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;

// 你在 eBay 里配置的 Endpoint URL（完全一致，包括路径和 https）
const EBAY_ENDPOINT_URL =
  "https://cardfolio-ebay-webhook.onrender.com/webhooks/ebay/account-deletion";

app.use(bodyParser.json());

// 根路径测试
app.get("/", (req, res) => {
  res.send("cardfolio eBay webhook is running");
});

// --------------- eBay 验证用 GET ---------------
app.get("/webhooks/ebay/account-deletion", (req, res) => {
  console.log("▶️ 收到 eBay 验证 GET:", req.method, req.url, req.query);

  const challengeCode = req.query.challenge_code;
  if (!challengeCode) {
    console.error("❌ 缺少 challenge_code");
    return res.status(400).json({ error: "missing challenge_code" });
  }

  if (!EBAY_VERIFICATION_TOKEN) {
    console.error("❌ 本地没有配置 EBAY_VERIFICATION_TOKEN 环境变量");
    return res.status(500).json({ error: "server misconfigured" });
  }

  // 按官方要求：challengeCode + verificationToken + endpointURL
  const hash = crypto.createHash("sha256");
  hash.update(challengeCode);
  hash.update(EBAY_VERIFICATION_TOKEN);
  hash.update(EBAY_ENDPOINT_URL);

  const challengeResponse = hash.digest("hex");

  console.log("✅ challengeResponse =", challengeResponse);

  res
    .status(200)
    .json({ challengeResponse }); // Content-Type: application/json
});

// --------------- 后续真正的通知用 POST ---------------
app.post("/webhooks/ebay/account-deletion", (req, res) => {
  console.log("📩 收到 eBay 删除通知 POST:", JSON.stringify(req.body, null, 2));

  const { metadata } = req.body || {};
  if (!metadata || metadata.topic !== "MARKETPLACE_ACCOUNT_DELETION") {
    console.error("❌ topic 无效:", metadata);
    return res.status(400).send("Invalid topic");
  }

  // TODO: 在这里根据通知内容执行你自己的删除逻辑

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
