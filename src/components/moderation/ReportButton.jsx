// src/components/moderation/ReportButton.jsx
"use client";
import { useState } from "react";

const reasons = [
  { value: "spam", label: "Spam" },
  { value: "abuse", label: "Abusive" },
  { value: "harassment", label: "Harassment" },
  { value: "hate", label: "Hate" },
  { value: "sexual", label: "Sexual content" },
  { value: "violence", label: "Violence" },
  { value: "misinformation", label: "Misinformation" },
  { value: "copyright", label: "Copyright" },
  { value: "other", label: "Other" },
];

export default function ReportButton({ targetType, targetId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/moderation/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reason, details }),
      });
      if (!res.ok) throw new Error("failed");
      setDone(true);
      setOpen(false);
    } catch (e) {
      // noop
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 border rounded"
        aria-haspopup="menu"
        aria-expanded={open}
        title={done ? "Reported" : "Report"}
      >
        {done ? "Reported" : "Report"}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-md bg-popover text-popover-foreground border border-border shadow-lg p-3">
          <div className="text-xs font-medium mb-2">Report {targetType}</div>
          <select
            className="w-full border rounded p-1 text-xs mb-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {reasons.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <textarea
            className="w-full border rounded p-1 text-xs mb-2"
            placeholder="Details (optional)"
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button className="text-xs px-2 py-1" onClick={() => setOpen(false)}>Cancel</button>
            <button
              className="text-xs px-2 py-1 rounded bg-red-600 text-white disabled:opacity-50"
              onClick={submit}
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
