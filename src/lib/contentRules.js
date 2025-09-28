// src/lib/contentRules.js

const DEFAULT_BANNED_WORDS = [
  // Keep short and generic; teams can expand later
  "spam",
  "scam",
  "hate",
  "slur",
];

function countLinks(text = "") {
  const regex = /https?:\/\//gi;
  return (text.match(regex) || []).length;
}

export function validateContent(text = "", opts = {}) {
  const banned = opts.bannedWords || DEFAULT_BANNED_WORDS;
  const maxLinks = Number.isFinite(opts.maxLinks) ? opts.maxLinks : 5;
  const lower = String(text).toLowerCase();

  const reasons = [];
  for (const w of banned) {
    if (w && lower.includes(String(w).toLowerCase())) {
      reasons.push(`Contains banned word: "${w}"`);
    }
  }
  const links = countLinks(text);
  if (links > maxLinks) {
    reasons.push(`Too many links (${links} > ${maxLinks})`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function validatePost({ title = "", content = "", summary = "" }, opts = {}) {
  const main = validateContent(`${title}\n${summary}\n${content}`, opts);
  return main;
}

export function validateComment({ content = "" }, opts = {}) {
  return validateContent(content, opts);
}
