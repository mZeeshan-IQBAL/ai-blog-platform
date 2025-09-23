// 2. src/app/billing/success/page.js
"use client";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle } from "lucide-react";
import { Suspense, useEffect } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const plan = params.get("plan") || "starter";

  // Redirect guest users to login
  useEffect(() => {
    if (status === "loading") return; // still checking auth
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // While loading session, show spinner
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If no session, don’t render
  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-green-700">
          Payment Successful!
        </h1>
        <p className="text-lg mb-6">
          Welcome to the <strong>{plan}</strong> plan,{" "}
          <span className="text-blue-600">{session.user?.name || "User"}</span>!
        </p>
        <p className="text-gray-600 mb-8">
          Your subscription is now active. You can start using all the features immediately.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => router.push("/billing/manage")}
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Manage Subscription
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}