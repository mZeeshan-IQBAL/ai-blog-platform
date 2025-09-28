// src/lib/audit.js
import AuditLog from "@/models/AuditLog";
import { connectToDB } from "@/lib/db";

export async function logAudit({ actorId, action, targetType, targetId, meta }) {
  try {
    await connectToDB();
    await AuditLog.create({ actorId, action, targetType, targetId, meta });
  } catch (e) {
    console.error("audit log error", e);
  }
}
