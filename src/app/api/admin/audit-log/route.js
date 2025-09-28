// src/app/api/admin/audit-log/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
  await connectToDB();
  const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(500).lean();
  return Response.json(logs);
}
