// src/models/Report.js
import mongoose, { Schema, model, models } from "mongoose";

const ReportSchema = new Schema(
  {
    targetType: { type: String, enum: ["post", "comment", "user"], required: true },
    targetId: { type: String, required: true }, // store as string for flexibility
    reason: {
      type: String,
      enum: [
        "spam",
        "abuse",
        "harassment",
        "hate",
        "sexual",
        "violence",
        "self-harm",
        "misinformation",
        "copyright",
        "other",
      ],
      required: true,
    },
    details: { type: String, default: "" },
    status: { type: String, enum: ["open", "reviewing", "resolved", "dismissed"], default: "open", index: true },
    reporterId: { type: String, default: "" }, // providerId or user _id string
    assignedTo: { type: String, default: "" },
  },
  { timestamps: true }
);

ReportSchema.index({ targetType: 1, targetId: 1, status: 1 });

const Report = models.Report || model("Report", ReportSchema);
export default Report;
