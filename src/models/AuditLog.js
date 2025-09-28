// src/models/AuditLog.js
import mongoose, { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    actorId: { type: String, required: true }, // admin's providerId or user id
    action: {
      type: String,
      enum: [
        "BLOCK_USER",
        "UNBLOCK_USER",
        "CHANGE_ROLE",
        "POST_STATUS",
        "DELETE_POST",
        "RESTORE_POST",
        "RESOLVE_REPORT",
        "DISMISS_REPORT",
        "CREATE_REPORT",
      ],
      required: true,
      index: true,
    },
    targetType: { type: String, enum: ["user", "post", "comment", "report", "system"], required: true },
    targetId: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });

const AuditLog = models.AuditLog || model("AuditLog", AuditLogSchema);
export default AuditLog;
