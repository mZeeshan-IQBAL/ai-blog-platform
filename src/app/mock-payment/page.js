// src/app/mock-payment/page.js
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MockPayment() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get("plan");
  const amount = params.get("amount");

  // Simulate payment processing (3 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Redirect to success page with plan query param
      router.push(`/billing/success?plan=${plan}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, plan]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
        <p className="mb-2">Amount: ₨{amount}</p>
        <p className="text-gray-600">Simulating EasyPaisa/JazzCash payment...</p>
        <div className="animate-pulse mt-4 text-2xl">● ● ●</div>
      </div>
    </div>
  );
}