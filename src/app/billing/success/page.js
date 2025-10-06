// src/app/billing/success/page.js
"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const plan = params.get("plan") || "starter";

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-green-700">Payment Successful!</h1>
        <p className="text-lg mb-6">
          Welcome to the <strong>{plan}</strong> plan,{" "}
          <span className="text-primary">{session.user?.name || "User"}</span>!
        </p>
        <p className="text-gray-600 mb-8">
          You now have <strong>30 days of full access</strong>. 
          No automatic charges — we’ll email you before expiry.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/billing/manage")}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            View Access Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}