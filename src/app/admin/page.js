// src/app/admin/page.js
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
        <p className="text-sm text-muted-foreground">Manage blog posts. This page is hidden from navigation and not indexed.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button as="link" href="/admin/users" size="xs" variant="gradient">Manage Users</Button>
        <Button as="link" href="/admin/reports" size="xs" variant="gradient">Review Reports</Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-sm text-muted-foreground">No posts found.</div>
      ) : (
        <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
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
            <tbody className="divide-y divide-border">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-foreground line-clamp-1">{post.title}</div>
                    <div className="text-xs text-muted-foreground">/{post.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{post.authorName || "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{post.createdAt?.slice(0, 10) || "—"}</td>
                  <td className="px-4 py-3 text-sm">
                    <form action={toggleTrending} className="inline">
                      <input type="hidden" name="postId" value={post.id} />
                      <input type="hidden" name="value" value={post.trending ? "off" : "on"} />
                      <Button
                        type="submit"
                        size="xs"
                        variant={post.trending ? "default" : "outline"}
                        title={post.trending ? "Click to remove from Trending" : "Click to promote to Trending"}
                      >
                        {post.trending ? "Trending: On" : "Trending: Off"}
                      </Button>
                    </form>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                    {post.published ? (
                      <form className="inline" action={unpublishPost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <Button type="submit" size="xs" variant="secondary">
                          Unpublish
                        </Button>
                      </form>
                    ) : (
                      <form className="inline" action={publishPost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <Button type="submit" size="xs">
                          Publish
                        </Button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {post.deletedAt ? (
                      <form className="inline" action={restorePost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <Button type="submit" size="xs" variant="secondary">
                          Restore
                        </Button>
                      </form>
                    ) : (
                      <form className="inline" action={softDeletePost}>
                        <input type="hidden" name="postId" value={post.id} />
                        <Button type="submit" size="xs" variant="destructive">
                          Soft Delete
                        </Button>
                      </form>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deletePost}>
                      <input type="hidden" name="postId" value={post.id} />
                      <Button
                        type="submit"
                        size="xs"
                        variant="destructive"
                      >
                        Hard Delete
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}