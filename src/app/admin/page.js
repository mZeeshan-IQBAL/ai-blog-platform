// src/app/admin/page.js
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Admin | AI Knowledge Hub",
  description: "Administrative dashboard for managing posts.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
}

export async function deletePost(formData) {
  "use server";
  const session = await requireAdmin();
  const postId = formData.get("postId");
  if (!postId) return;

  await connectToDB();
  await Post.deleteOne({ _id: postId });

  // Revalidate key pages
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/admin");
}

async function fetchRecentPosts(limit = 50) {
  await connectToDB();
  const posts = await Post.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return posts.map((p) => ({
    id: String(p._id),
    title: p.title,
    slug: p.slug,
    authorName: p.authorName,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    published: !!p.published,
    trending: p.trending !== false, // default true if missing
    deletedAt: p.deletedAt ? new Date(p.deletedAt).toISOString() : null,
  }));
}

export const revalidate = 0;

export async function publishPost(formData) {
  "use server";
  await requireAdmin();
  const postId = formData.get("postId");
  if (!postId) return;
  await connectToDB();
  await Post.findByIdAndUpdate(postId, { published: true, scheduledAt: null });
  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function unpublishPost(formData) {
  "use server";
  await requireAdmin();
  const postId = formData.get("postId");
  if (!postId) return;
  await connectToDB();
  await Post.findByIdAndUpdate(postId, { published: false });
  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function softDeletePost(formData) {
  "use server";
  const session = await requireAdmin();
  const postId = formData.get("postId");
  if (!postId) return;
  await connectToDB();
  await Post.findByIdAndUpdate(postId, { deletedAt: new Date(), deletedBy: session.user.id });
  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function restorePost(formData) {
  "use server";
  await requireAdmin();
  const postId = formData.get("postId");
  if (!postId) return;
  await connectToDB();
  await Post.findByIdAndUpdate(postId, { deletedAt: null, deletedBy: "" });
  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function toggleTrending(formData) {
  "use server";
  await requireAdmin();
  const postId = formData.get("postId");
  const value = formData.get("value"); // "on" | "off"
  if (!postId) return;
  await connectToDB();
  const setTo = value === "on";
  await Post.findByIdAndUpdate(postId, { trending: setTo });
  // Revalidate home/trending and admin
  revalidatePath("/");
  revalidatePath("/admin");
}

export default async function AdminPage() {
  await requireAdmin();
  const posts = await fetchRecentPosts(50);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Manage blog posts. This page is hidden from navigation and not indexed.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Manage Users
        </Link>
        <Link
          href="/admin/reports"
          className="inline-flex items-center rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Review Reports
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-sm text-gray-600">No posts found.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trending</th>
                <th className="px-4 py-3" />
                <th className="px-4 py-3" />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900 line-clamp-1">{post.title}</div>
                    <div className="text-xs text-gray-500">/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{post.authorName || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{post.createdAt?.slice(0, 10) || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <form action={toggleTrending} className="inline">
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="value" value={post.trending ? "off" : "on"} />
                      <button
                        type="submit"
                        className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-white focus:outline-none focus:ring-2 ${post.trending ? "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500" : "bg-gray-500 hover:bg-gray-600 focus:ring-gray-500"}`}
                        title={post.trending ? "Click to remove from Trending" : "Click to promote to Trending"}
                      >
                        {post.trending ? "Trending: On" : "Trending: Off"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    {post.published ? (
                      <form className="inline" action={unpublishPost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                          Unpublish
                        </button>
                      </form>
                    ) : (
                      <form className="inline" action={publishPost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className="inline-flex items-center rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                          Publish
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {post.deletedAt ? (
                      <form className="inline" action={restorePost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          Restore
                        </button>
                      </form>
                    ) : (
                      <form className="inline" action={softDeletePost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <button type="submit" className="inline-flex items-center rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                          Soft Delete
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deletePost}>
                      <input type="hidden" name="postId" value={post.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center rounded-md bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Hard Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}