// src/app/admin/comments/page.js
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { logAudit } from "@/lib/audit";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Admin | Comments", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

async function fetchComments(limit = 200) {
  await connectToDB();
  const comments = await Comment.find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", "name image providerId")
    .populate({ path: "post", select: "slug title" })
    .lean();
  return comments.map(c => ({
    id: String(c._id),
    content: c.content,
    status: c.status,
    createdAt: c.createdAt,
    author: c.author ? { name: c.author.name, providerId: c.author.providerId } : null,
    post: c.post ? { id: String(c.post._id), slug: c.post.slug, title: c.post.title } : null,
  }));
}

export async function setStatus(formData) {
  "use server";
  const session = await requireAdmin();
  await connectToDB();
  const id = formData.get("id");
  const status = formData.get("status"); // approved|pending|flagged
  const c = await Comment.findByIdAndUpdate(id, { status }, { new: true }).populate("post");
  if (c?.post?.slug) {
    revalidatePath(`/blog/${c.post.slug}`);
  }
  await logAudit({ actorId: session.user.providerId, action: "POST_STATUS", targetType: "comment", targetId: String(id), meta: { status } });
}

export async function deleteComment(formData) {
  "use server";
  const session = await requireAdmin();
  await connectToDB();
  const id = formData.get("id");
  const c = await Comment.findById(id).populate("post");
  if (!c) return;
  const post = c.post ? await Post.findById(c.post._id) : null;
  await Comment.deleteOne({ _id: id });
  if (post) {
    post.comments = (post.comments || []).filter(cid => String(cid) !== id);
    await post.save();
    revalidatePath(`/blog/${post.slug}`);
  }
  await logAudit({ actorId: session.user.providerId, action: "DELETE_POST", targetType: "comment", targetId: String(id) });
}

export default async function AdminCommentsPage() {
  await requireAdmin();
  const rows = await fetchComments();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Comments</h1>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-600">No comments.</div>
      ) : (
        <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">Comment</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Author</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Post</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm max-w-md">
                    <div className="line-clamp-2">{r.content}</div>
                    <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{r.author?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm">
                    {r.post?.slug ? (
                      <Link className="text-blue-600 hover:underline" href={`/blog/${r.post.slug}`}>{r.post.title || r.post.slug}</Link>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={r.status === 'approved' ? 'success' : (r.status === 'flagged' ? 'warning' : 'info')}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    <form className="inline" action={setStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="approved" />
                      <Button size="xs">Approve</Button>
                    </form>
                    <form className="inline" action={setStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value="flagged" />
                      <Button size="xs" variant="secondary">Flag</Button>
                    </form>
                    <form className="inline" action={deleteComment}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button size="xs" variant="destructive">Delete</Button>
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
