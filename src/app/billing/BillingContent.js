// src/app/billing/BillingContent.js
"use client";
import { useSearchParams } from "next/navigation";

export default function BillingContent() {
  const params = useSearchParams();
  const plan = params.get("plan") || "unknown";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Billing</h1>
        <p className="text-lg mb-6">
          You selected the <strong>{plan}</strong> plan.
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}