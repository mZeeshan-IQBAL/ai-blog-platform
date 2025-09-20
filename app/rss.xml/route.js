import { getAllBlogs } from "@/lib/api";

export async function GET() {
  const posts = await getAllBlogs();
  const items = posts.map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${process.env.NEXTAUTH_URL || "http://localhost:3000"}/blog/${p.slug || p.id}</link>
      <guid>${process.env.NEXTAUTH_URL || "http://localhost:3000"}/blog/${p.slug || p.id}</guid>
      <description><![CDATA[${p.excerpt || ""}]]></description>
      <pubDate>${new Date(p.createdAt).toUTCString()}</pubDate>
    </item>
  `).join("\n");
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>AI Knowledge Hub</title>
      <link>${process.env.NEXTAUTH_URL || "http://localhost:3000"}</link>
      <description>RSS feed for AI Knowledge Hub</description>
      ${items}
    </channel>
  </rss>`;
  return new Response(rss, { headers: { "Content-Type": "application/xml" } });
}