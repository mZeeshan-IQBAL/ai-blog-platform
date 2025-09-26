// src/app/billing/page.js
import { Suspense } from "react";
import BillingContent from "./BillingContent";

export const dynamic = "force-dynamic";

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <BillingContent />
    </Suspense>
  );
}
