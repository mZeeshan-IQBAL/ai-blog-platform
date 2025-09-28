// src/app/admin/audit-log/page.js
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin | Audit Log", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

async function fetchLogs(limit = 200) {
  await connectToDB();
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
  return logs.map(l => ({
    id: String(l._id),
    time: l.createdAt,
    actorId: l.actorId,
    action: l.action,
    targetType: l.targetType,
    targetId: l.targetId,
    meta: l.meta || null,
  }));
}

export default async function AuditLogPage() {
  await requireAdmin();
  const rows = await fetchLogs();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Audit Log</h1>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-600">No audit entries.</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Actor</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Target</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Meta</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(r.time).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{r.actorId}</td>
                  <td className="px-4 py-3 text-sm">{r.action}</td>
                  <td className="px-4 py-3 text-sm">{r.targetType}:{r.targetId}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs">
                    <pre className="whitespace-pre-wrap break-words">{JSON.stringify(r.meta, null, 0)}</pre>
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
