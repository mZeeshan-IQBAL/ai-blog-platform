// src/app/admin/reports/page.js
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Report from "@/models/Report";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { logAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin | Reports", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

async function fetchReports() {
  await connectToDB();
  const reports = await Report.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return reports;
}

export async function resolveReport(formData) {
  "use server";
  const session = await requireAdmin();
  await connectToDB();
  const id = formData.get("id");
  const status = formData.get("status") || "resolved";
  await Report.findByIdAndUpdate(id, { status });
  await logAudit({ actorId: session.user.providerId, action: status === "dismissed" ? "DISMISS_REPORT" : "RESOLVE_REPORT", targetType: "report", targetId: String(id) });
  revalidatePath("/admin/reports");
}

export async function blockUserAction(formData) {
  "use server";
  const session = await requireAdmin();
  await connectToDB();
  const userId = formData.get("userId");
  const block = formData.get("block") === "true";
  const reason = formData.get("reason") || "Policy violation";
  const user = await User.findById(userId);
  if (!user) return;
  user.blocked = block;
  user.blockReason = block ? reason : "";
  user.blockedAt = block ? new Date() : null;
  await user.save();
  await logAudit({ actorId: session.user.providerId, action: block ? "BLOCK_USER" : "UNBLOCK_USER", targetType: "user", targetId: String(user._id), meta: { reason } });
}

export async function setPostStatus(formData) {
  "use server";
  const session = await requireAdmin();
  await connectToDB();
  const postId = formData.get("postId");
  const status = formData.get("status"); // ok|flagged|removed
  const flags = (formData.get("flags") || "").split(",").map(s => s.trim()).filter(Boolean);
  const post = await Post.findByIdAndUpdate(postId, { moderation: { status, flags } }, { new: true });
  if (post) {
    await logAudit({ actorId: session.user.providerId, action: "POST_STATUS", targetType: "post", targetId: String(post._id), meta: { status, flags } });
    revalidatePath(`/blog/${post.slug}`);
  }
}

export default async function ReportsPage() {
  await requireAdmin();
  const reports = await fetchReports();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Reports</h1>
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-sm text-gray-600">No reports.</div>
        ) : reports.map(r => (
          <div key={r._id} className="border rounded p-4">
            <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
            <div className="font-medium">{r.targetType} • {r.reason}</div>
            <div className="text-sm">Target: {r.targetId}</div>
            {r.details && <div className="text-sm text-gray-700 mt-1">{r.details}</div>}
            <div className="mt-3 text-xs">Status: <span className="font-medium">{r.status}</span></div>
            <div className="mt-3 flex flex-wrap gap-2">
              <form action={resolveReport} method="post">
                <input type="hidden" name="id" value={String(r._id)} />
                <input type="hidden" name="status" value="resolved" />
                <button type="submit" className="px-3 py-1.5 text-xs rounded bg-green-600 text-white">Resolve</button>
              </form>
              <form action={resolveReport} method="post">
                <input type="hidden" name="id" value={String(r._id)} />
                <input type="hidden" name="status" value="dismissed" />
                <button type="submit" className="px-3 py-1.5 text-xs rounded bg-gray-600 text-white">Dismiss</button>
              </form>
              {r.targetType === 'user' && (
                <form action={blockUserAction} method="post" className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={r.targetId} />
                  <input type="hidden" name="block" value="true" />
                  <input className="border px-2 py-1 text-xs" name="reason" placeholder="Reason" />
                  <button type="submit" className="px-3 py-1.5 text-xs rounded bg-red-600 text-white">Block User</button>
                </form>
              )}
              {r.targetType === 'post' && (
                <form action={setPostStatus} method="post" className="flex items-center gap-2">
                  <input type="hidden" name="postId" value={r.targetId} />
                  <select name="status" className="border px-2 py-1 text-xs">
                    <option value="ok">ok</option>
                    <option value="flagged">flagged</option>
                    <option value="removed">removed</option>
                  </select>
                  <input className="border px-2 py-1 text-xs" name="flags" placeholder="flags,comma,separated" />
                  <button type="submit" className="px-3 py-1.5 text-xs rounded bg-yellow-600 text-white">Update Post</button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
