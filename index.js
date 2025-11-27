// index.js
const express = require("express");
const crypto = require("crypto");

const app = express();

// Render 会注入 PORT 环境变量，本地没有时默认 3000 / 10000 都可以
const PORT = process.env.PORT || 10000;
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;

// 让 Express 正确解析 JSON body
app.use(express.json());

// 简单的健康检查，用浏览器打开根路径时能看到一行文字
app.get("/", (req, res) => {
  res.send("cardfolio eBay webhook is running");
});

/**
 * eBay Marketplace Account Deletion webhook
 * 路径：/webhooks/ebay/account-deletion
 */
app.post("/webhooks/ebay/account-deletion", (req, res) => {
  console.log("📩 收到 /webhooks/ebay/account-deletion 请求，body =");
  console.log(JSON.stringify(req.body, null, 2));

  const topic = req.body?.metadata?.topic;
  const challengeCode = req.body?.challengeCode;
  const verificationToken = req.body?.verificationToken;

  // 这是 eBay 发送的“验证请求”（带 challengeCode）
  if (topic === "MARKETPLACE_ACCOUNT_DELETION" && challengeCode && verificationToken) {
    console.log("🔐 收到 eBay 验证请求, challengeCode =", challengeCode);
    console.log("   verificationToken =", verificationToken);

    // 校验 eBay 发来的 token 和我们在 Render 中配置的一致
    if (verificationToken !== EBAY_VERIFICATION_TOKEN) {
      console.log("⚠️ verificationToken 不匹配，预期：", EBAY_VERIFICATION_TOKEN);
      return res.status(400).json({ error: "verificationToken mismatch" });
    }

    // 按 eBay 文档要求计算 challengeResponse
    const challengeResponse = crypto
      .createHash("sha256")
      .update(challengeCode + verificationToken)
      .digest("hex");

    console.log("✅ 返回 challengeResponse 给 eBay:", challengeResponse);

    // 显式设置 Content-Type，并返回 JSON
    res.set("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify({ challengeResponse }));
  }

  // 之后真正的删除通知（没有 challengeCode）也会打到这里
  console.log("🧾 收到 Marketplace Account Deletion 通知：");
  console.log(JSON.stringify(req.body, null, 2));

  // 业务上先不做处理，直接 200
  return res.sendStatus(200);
});

// 启动服务
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`   Webhook endpoint: /webhooks/ebay/account-deletion`);
});
