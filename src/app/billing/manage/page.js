// src/app/billing/manage/page.js (add error handling)
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar,
  AlertCircle,
  Settings,
  User,
  Database,
  FileText,
} from "lucide-react";

export default function ManageSubscription() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect guests to login
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) fetchSubscription();
  }, [session]);

  // Fetch subscription info
  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/billing/subscription");
      if (!response.ok) throw new Error("Failed to fetch subscription");

      const data = await response.json();
      setSubscription(data.subscription);
      setError("");
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setError("Failed to load subscription details");
    }
    setLoading(false);
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!confirm("Cancel subscription? (Takes effect end of billing period)"))
      return;

    setLoading(true);
    try {
      const response = await fetch("/api/billing/cancel", { method: "POST" });
      if (!response.ok) throw new Error("Cancel failed");

      alert("✅ Subscription cancelled");
      fetchSubscription();
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      alert("❌ Failed to cancel subscription");
    }
    setLoading(false);
  };

  // Show loading spinner
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-medium">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        {subscription ? (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
                  <p className="text-3xl font-bold text-blue-600 capitalize">
                    {subscription.plan || "Free"}
                  </p>
                  <p className="text-gray-600">
                    ${subscription.amount || 0}/month
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : subscription.status === "cancelled"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {subscription.status || "inactive"}
                  </span>

                  {subscription.status === "cancelled" &&
                    subscription.nextBillingDate && (
                      <p className="text-sm text-gray-600 mt-2">
                        Active until{" "}
                        {new Date(
                          subscription.nextBillingDate
                        ).toLocaleDateString()}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Billing Info */}
            {subscription.status === "active" && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Billing Information
                </h3>
                <div className="space-y-3">
                  {subscription.nextBillingDate && (
                    <div className="flex justify-between">
                      <span>Next billing date:</span>
                      <span className="font-medium">
                        {new Date(
                          subscription.nextBillingDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment method:</span>
                    <span className="font-medium">PayPal</span>
                  </div>
                  {subscription.payerEmail && (
                    <div className="flex justify-between">
                      <span>PayPal account:</span>
                      <span className="font-medium">
                        {subscription.payerEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Usage Stats */}
            {subscription.usage && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Usage</h3>
                <div className="space-y-4">
                  {/* Storage */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center">
                        <Database className="w-4 h-4 mr-1" /> Storage
                      </span>
                      <span className="text-sm">
                        {subscription.usage.storage || 0} GB /{" "}
                        {subscription.limits?.storage || 5} GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((subscription.usage.storage || 0) /
                              (subscription.limits?.storage || 5)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Posts */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="flex items-center">
                        <FileText className="w-4 h-4 mr-1" /> Posts
                      </span>
                      <span className="text-sm">
                        {subscription.usage.posts || 0} /{" "}
                        {subscription.limits?.posts === -1
                          ? "Unlimited"
                          : subscription.limits?.posts || 5}
                      </span>
                    </div>
                    {subscription.limits?.posts !== -1 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              ((subscription.usage.posts || 0) /
                                (subscription.limits?.posts || 5)) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/pricing")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">Change Plan</p>
                      <p className="text-sm text-gray-600">
                        Upgrade or downgrade your subscription
                      </p>
                    </div>
                  </div>
                </button>

                {subscription.status === "active" && (
                  <button
                    onClick={cancelSubscription}
                    className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition text-red-600"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-3" />
                      <div>
                        <p className="font-medium">Cancel Subscription</p>
                        <p className="text-sm">
                          Cancel your subscription (effective at period end)
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">No active subscription found</p>
            <button
              onClick={() => router.push("/pricing")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              View Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}