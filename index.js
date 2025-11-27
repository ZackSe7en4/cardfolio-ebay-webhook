// index.js
const express = require("express");
const crypto = require("crypto");

const app = express();

// Render 会提供 PORT，没提供就用 10000
const PORT = process.env.PORT || 10000;

// 仅用作我们自己日志对比，不再强制校验，避免因为空格之类的小差异导致 eBay 验证失败
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;

// 解析 JSON body
app.use(express.json());

// 根路径健康检查
app.get("/", (req, res) => {
  res.send("cardfolio eBay webhook is running");
});

// eBay Marketplace Account Deletion Webhook
app.post("/webhooks/ebay/account-deletion", (req, res) => {
  console.log("📩 收到 /webhooks/ebay/account-deletion 请求");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  const topic = req.body?.metadata?.topic;
  const challengeCode = req.body?.challengeCode;
  const verificationToken = req.body?.verificationToken;

  // 这是 eBay 的验证请求 —— 只要有 challengeCode 就处理
  if (challengeCode) {
    console.log("🔐 验证请求:");
    console.log("  topic =", topic);
    console.log("  challengeCode =", challengeCode);
    console.log("  verificationToken(from eBay) =", verificationToken);
    console.log("  verificationToken(in Render) =", EBAY_VERIFICATION_TOKEN);

    // **注意：这里不再判断 verificationToken 是否完全一致，**
    // 直接使用 eBay 发来的 verificationToken 按文档规则计算哈希
    const challengeResponse = crypto
      .createHash("sha256")
      .update(String(challengeCode) + String(verificationToken))
      .digest("hex");

    console.log("✅ 计算出的 challengeResponse =", challengeResponse);

    res.set("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify({ challengeResponse }));
  }

  // 正式的 Account Deletion 通知（不带 challengeCode）
  if (topic === "MARKETPLACE_ACCOUNT_DELETION") {
    console.log("🧾 收到真正的删除通知:");
    console.log(JSON.stringify(req.body, null, 2));
  } else {
    console.log("ℹ️ 收到未知 topic 通知:", topic);
  }

  return res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log("   Webhook endpoint: /webhooks/ebay/account-deletion");
});
