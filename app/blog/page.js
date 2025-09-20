import Link from "next/link";
import { getAllBlogs, getAllTags } from "@/lib/api";
import BlogCard from "@/components/blog/BlogCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "All Blogs | AI Knowledge Hub",
  description: "Explore community contributed blogs on AI and innovation.",
};

export default async function BlogPage() {
  let blogs = [];
  let error = null;
  let tags = [];

  try {
    [blogs, tags] = await Promise.all([getAllBlogs(), getAllTags()]);
  } catch (err) {
    error = "Failed to fetch blogs. Please try again later.";
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Our <span className="text-blue-600">Blogs</span></h1>
        <p className="text-lg text-gray-600">Knowledge shared by the community.</p>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {tags.slice(0, 20).map((t) => (
            <Link key={t} href={`/tags/${encodeURIComponent(t)}`} className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-sm">
              #{t}
            </Link>
          ))}
          {tags.length > 20 && <Link href="/tags" className="text-sm text-blue-600">View all</Link>}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      {blogs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No blogs found. Be the first to <Link href="/blog/create" className="text-blue-600">create one</Link>!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}