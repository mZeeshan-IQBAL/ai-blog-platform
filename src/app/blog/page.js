// app/blog/page.js
import Link from "next/link";
import { getAllBlogs, getAllTags, getPostsByCategory } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
import BlogCard from "@/components/blog/BlogCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "All Blogs | AI Knowledge Hub",
  description: "Explore community contributed blogs on AI and innovation.",
};

export default async function BlogPage({ searchParams }) {
  const sp = await searchParams;
  const selectedCategory = decodeURIComponent(sp?.category ?? "");
  let blogs = [];
  let error = null;
  let tags = [];
  let categories = CATEGORIES;

  try {
    if (selectedCategory && selectedCategory !== "all") {
      [blogs, tags] = await Promise.all([
        getPostsByCategory(selectedCategory),
        getAllTags(),
      ]);
    } else {
      [blogs, tags] = await Promise.all([getAllBlogs(), getAllTags()]);
    }
  } catch (err) {
    error = "Failed to fetch blogs. Please try again later.";
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      </div>

      {/* Header - Clean and professional */}
      <Reveal className="text-center mb-12">
        <h1 className="heading-responsive mb-4">Latest Articles</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Discover insights, tutorials, and stories from our community of developers and AI enthusiasts.
        </p>

        {/* Search Section - Simple and clean */}
        <div className="max-w-md mx-auto mb-8">
          <Button as="link" href="/search" className="inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Articles
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Find specific topics or browse by category
          </p>
        </div>
      </Reveal>

      {/* Category Bar */}
      <Reveal className="mb-10">
        <div className="w-full flex justify-center">
          <div className="flex gap-2 flex-wrap justify-center items-center overflow-x-auto no-scrollbar py-1">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full whitespace-nowrap border ${
                !selectedCategory || selectedCategory === "all"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All articles
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full whitespace-nowrap border ${
                  selectedCategory === cat
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Tags Section - Clean and organized */}
      {tags.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 text-center">
            Popular Topics
          </h2>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.slice(0, 15).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="transition-colors"
              >
                <Badge variant="outline" className="px-3 py-1 text-sm">#{tag}</Badge>
              </Link>
            ))}

            {tags.length > 15 && (
              <Button as="link" href="/tags" variant="link" size="sm">
                View all →
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-8 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium mb-2">No articles yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to share your knowledge with the community.
          </p>
          <Button as="link" href="/blog/create" className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Write First Article
          </Button>
        </div>
      ) : (
        <>
          {/* Stats/Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {blogs.length} article{blogs.length !== 1 ? 's' : ''} found
            </p>
            <Button as="link" href="/blog/create" variant="link" size="sm">
              Write an article →
            </Button>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, i) => (
              <Reveal key={blog._id || blog.id || blog.slug} delay={i * 40}>
                <BlogCard blog={blog} />
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}