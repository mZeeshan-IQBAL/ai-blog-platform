export async function GET() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const body = `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}