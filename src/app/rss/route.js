// src/app/rss/route.js
import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "";
  if (envUrl) {
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }
  return "http://localhost:3000";
}

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  await connectToDB();
  const baseUrl = getBaseUrl();

  const posts = await Post.find({
    published: true,
    $or: [
      { scheduledAt: null },
      { scheduledAt: { $lte: new Date() } },
    ],
    deletedAt: null,
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const items = posts
    .map((p) => {
      const link = `${baseUrl}/blog/${p.slug}`;
      const title = escapeXml(p.title || "Untitled");
      const description = escapeXml(p.summary || "");
      const pubDate = new Date(p.createdAt || Date.now()).toUTCString();
      return `\n      <item>
        <title>${title}</title>
        <link>${link}</link>
        <guid isPermaLink="true">${link}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${p.summary || ""}]]></description>
      </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>BlogSphere</title>
    <link>${baseUrl}</link>
    <description>Latest posts from BlogSphere</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=600, stale-while-revalidate=86400",
    },
  });
}
