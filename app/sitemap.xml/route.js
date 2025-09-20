import { getAllBlogs } from "@/lib/api";

export async function GET() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const posts = await getAllBlogs();
  const urls = ["/", "/blog", "/search", "/dashboard"].map((p) => `${base}${p}`);
  const postUrls = posts.map((p) => `${base}/blog/${p.slug || p.id}`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...urls, ...postUrls]
    .map((u) => `<url><loc>${u}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`) 
    .join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}