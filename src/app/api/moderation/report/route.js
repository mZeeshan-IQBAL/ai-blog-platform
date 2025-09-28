// src/app/api/moderation/report/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Report from "@/models/Report";
import { logAudit } from "@/lib/audit";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { targetType, targetId, reason, details = "" } = body || {};
    if (!targetType || !targetId || !reason) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }
    await connectToDB();
    const reporterId = session?.user?.providerId || "anonymous";
    const report = await Report.create({ targetType, targetId: String(targetId), reason, details, reporterId });
    await logAudit({ actorId: reporterId, action: "CREATE_REPORT", targetType: "report", targetId: String(report._id), meta: { targetType, targetId, reason } });
    return Response.json({ ok: true, id: report._id });
  } catch (e) {
    console.error("report POST error", e);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}

export async function GET() {
  // Admin only
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return Response.json({ error: "Forbidden" }, { status: 403 });
  await connectToDB();
  const reports = await Report.find({}).sort({ createdAt: -1 }).limit(500).lean();
  return Response.json(reports);
}
