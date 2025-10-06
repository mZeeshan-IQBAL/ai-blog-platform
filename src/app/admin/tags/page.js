// src/app/admin/tags/page.js
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { redirect } from "next/navigation";

export const metadata = { title: "Admin | Tags", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

async function fetchTagCounts() {
  await connectToDB();
  const pipeline = [
    { $unwind: "$tags" },
    {
      $match: {
        $and: [
          { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
        ],
      },
    },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 500 },
  ];
  const rows = await Post.aggregate(pipeline);
  return rows.map(r => ({ tag: r._id, count: r.count })).filter(r => !!r.tag);
}

export default async function AdminTagsPage() {
  await requireAdmin();
  const items = await fetchTagCounts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Tags</h1>
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">No tags.</div>
      ) : (
        <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium">Tag</th>
                <th className="px-4 py-3 text-left text-xs font-medium">Count</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map(it => (
                <tr key={it.tag}>
                  <td className="px-4 py-3 text-sm font-medium">#{it.tag}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{it.count}</td>
                  <td className="px-4 py-3 text-right">
                    <Button as="link" href={`/tags/${encodeURIComponent(it.tag)}`} variant="link" size="xs">
                      View public page
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <p className="text-xs text-gray-500 mt-3">Tip: We can add rename/merge tools later.</p>
    </div>
  );
}
