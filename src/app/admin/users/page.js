// src/app/admin/users/page.js
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { logAudit } from "@/lib/audit";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin | Users", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

async function fetchUsers() {
  await connectToDB();
  const users = await User.find({}).sort({ createdAt: -1 }).limit(200).lean();
  return users.map(u => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    blocked: !!u.blocked,
    blockReason: u.blockReason || "",
    createdAt: u.createdAt,
  }));
}

export async function setRole(formData) {
  "use server";
  const { revalidatePath } = await import("next/cache");
  const session = await requireAdmin();
  await connectToDB();
  const userId = formData.get("userId");
  const role = formData.get("role"); // USER|ADMIN
  if (!userId || !role) return;

  await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { new: true, runValidators: true, context: "query" }
  );

  await logAudit({
    actorId: session.user.providerId,
    action: "CHANGE_ROLE",
    targetType: "user",
    targetId: String(userId),
    meta: { role },
  });

  revalidatePath("/admin/users");
}

export async function setBlocked(formData) {
  "use server";
  const { revalidatePath } = await import("next/cache");
  const session = await requireAdmin();
  await connectToDB();

  const userId = formData.get("userId");
  const block = formData.get("block") === "true";
  const reason = formData.get("reason") || "";
  if (!userId) return;

  const updated = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        blocked: block,
        blockReason: block ? reason : "",
        blockedAt: block ? new Date() : null,
      },
    },
    { new: true, runValidators: true, context: "query" }
  );
  if (!updated) return;

  await logAudit({
    actorId: session.user.providerId,
    action: block ? "BLOCK_USER" : "UNBLOCK_USER",
    targetType: "user",
    targetId: String(updated._id),
    meta: { reason },
  });

  revalidatePath("/admin/users");
}

export default async function UsersPage() {
  await requireAdmin();
  const users = await fetchUsers();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Users</h1>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm">{u.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-sm">
                  <form action={setRole} className="inline-flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} className="border px-2 py-1 text-xs">
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button className="px-2 py-1 text-xs rounded bg-blue-600 text-white">Save</button>
                  </form>
                </td>
                <td className="px-4 py-3 text-sm">
                  {u.blocked ? (
                    <span className="text-red-600">Blocked</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <form action={setBlocked} className="inline-flex items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="block" value={String(!u.blocked)} />
                    <input name="reason" className="border px-2 py-1 text-xs" placeholder="Reason (optional)" />
                    <button className={`px-3 py-1.5 text-xs rounded text-white ${u.blocked ? 'bg-green-600' : 'bg-red-600'}`}>
                      {u.blocked ? 'Unblock' : 'Block'}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
