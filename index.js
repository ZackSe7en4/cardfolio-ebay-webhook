// index.js — 完整可用版本
const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 10000;

// ⭐ 注意：Render 环境变量里必须设置 EBAY_VERIFICATION_TOKEN
const EBAY_VERIFICATION_TOKEN = process.env.EBAY_VERIFICATION_TOKEN;

// JSON 解析
app.use(bodyParser.json());

// 根路径（方便你知道服务运行正常）
app.get("/", (req, res) => {
  res.send("cardfolio eBay webhook is running");
});

//
// ============================================
//   eBay Marketplace Account Deletion Webhook
// ============================================
//
app.all("/webhooks/ebay/account-deletion", (req, res) => {
  console.log("👉 收到请求:", req.method, req.url);

  // 1️⃣ eBay 探活（GET / HEAD）
  if (req.method !== "POST") {
    console.log("🔍 探活请求（非 POST），返回 200 OK");
    return res.status(200).send("OK");
  }

  // 2️⃣ 真正的 POST 校验请求
  console.log("📩 eBay POST Body:", JSON.stringify(req.body, null, 2));

  const { metadata, challengeCode, verificationToken } = req.body || {};

  // topic 校验
  if (!metadata || metadata.topic !== "MARKETPLACE_ACCOUNT_DELETION") {
    console.error("❌ topic 无效:", metadata);
    return res.status(400).send("Invalid topic");
  }

  // verificationToken 校验
  if (!verificationToken || verificationToken !== EBAY_VERIFICATION_TOKEN) {
    console
