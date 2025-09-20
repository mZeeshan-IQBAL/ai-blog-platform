import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BlogCard from "@/components/blog/BlogCard";
import { getPostsByTag } from "@/lib/api";

export async function generateMetadata({ params }) {
  const { tag } = await params;
  return { title: `#${tag} | AI Knowledge Hub` };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const posts = await getPostsByTag(tag);
  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tags", href: "/tags" }, { label: `#${tag}` }]} />
      </div>
      <h1 className="text-3xl font-bold mb-6">Tag: <span className="text-blue-600">#{tag}</span></h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts for this tag yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}