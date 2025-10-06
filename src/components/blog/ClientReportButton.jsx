"use client";

import dynamic from "next/dynamic";

const ReportButton = dynamic(() => import("@/components/moderation/ReportButton"), { ssr: false });

export default function ClientReportButton(props) {
  return <ReportButton {...props} />;
}
