// lib/openai.js
// Mock AI functions (free forever, no API key required)

import crypto from "crypto";

export async function generateSummary(content) {
  const templates = [
    `📝 Quick summary: This article discusses "${content.slice(0, 40)}..."`,
    `📌 In short: "${content.slice(0, 40)}..."`,
    `✨ Highlights include: "${content.slice(0, 40)}..."`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function suggestTags(content) {
  const tags = ["nextjs", "react", "javascript", "ai", "webdev", "tutorial", "ml", "openai"];
  // deterministic shuffle
  const hash = crypto.createHash("md5").update(content).digest("hex");
  const start = parseInt(hash.substring(0, 2), 16) % tags.length;
  return tags.slice(start, start + 3);
}

export async function rewriteContent(content, style="clear") {
  return `[${style}] ${content}`;
}