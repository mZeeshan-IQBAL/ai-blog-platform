import BlogCard from "@/components/blog/BlogCard";
import { getTrending } from "@/lib/trending";

export default async function Trending() {
  const trending = await getTrending(6);
  if (!trending || trending.length === 0) return null;
  const blogs = trending.map((p) => ({
    id: p._id?.toString?.() || p.id,
    slug: p.slug,
    title: p.title,
    coverImage: p.coverImage,
    createdAt: p.createdAt,
    excerpt: p.summary || "",
  }));
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((b) => (
          <BlogCard key={b.id} blog={b} />
        ))}
      </div>
    </section>
  );
}
