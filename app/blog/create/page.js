// app/blog/create/page.js
import PostForm from "@/components/blog/PostForm";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "Create a Blog | AI Knowledge Hub",
  description: "Write and share your ideas with the community.",
};

export default function CreateBlogPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: "Create" }]} />
      </div>
      <h1 className="text-3xl font-bold mb-6">Create New Blog</h1>
      <PostForm />
    </div>
  );
}