// src/app/sitemap.js
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";

function getBaseUrl() {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "";
  if (envUrl) {
    // If VERCEL_URL is just the host, ensure it has protocol
    return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
  }
  // Dev fallback; port may differ during local dev
  return "http://localhost:3000";
}

export default async function sitemap() {
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
    .select({ slug: 1, updatedAt: 1 })
    .sort({ updatedAt: -1 })
    .limit(5000)
    .lean();

  const postEntries = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Static routes
  const staticEntries = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/features`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];

  return [...staticEntries, ...postEntries];
}
