// src/app/billing/manage/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, AlertCircle, Settings, CreditCard } from "lucide-react";

export default function ManageSubscription() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch("/api/billing/subscription");
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
    setLoading(false);
  };

  const cancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You will lose access at the end of your current period."
      )
    )
      return;

    try {
      const response = await fetch("/api/billing/cancel", { method: "POST" });

      if (response.ok) {
        alert("Subscription cancelled successfully");
        fetchSubscription();
      } else {
        const err = await response.json();
        alert(err.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Failed to cancel subscription");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

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
                  {subscription.amount > 0 && (
                    <p className="text-gray-600">₨{subscription.amount}/month</p>
                  )}
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
                    {subscription.status === "cancelled" ? "Cancelling" : subscription.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Access Period */}
            {(subscription.status === "active" || subscription.status === "cancelled") && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Access Period
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Start date:</span>
                    <span className="font-medium">{formatDate(subscription.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Access until:</span>
                    <span className="font-medium">{formatDate(subscription.expiresAt)}</span>
                  </div>
                  {subscription.status === "cancelled" && (
                    <div className="flex justify-between text-yellow-700">
                      <span>Auto-renewal:</span>
                      <span className="font-medium">Disabled</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Method */}
            {subscription.amount > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                <p className="text-gray-600">
                  Paid via <strong>EasyPaisa / JazzCash</strong> (one-time payment)
                </p>
                {subscription.payerEmail && (
                  <p className="text-sm text-gray-500 mt-2">
                    Payment confirmed for: {subscription.payerEmail}
                  </p>
                )}
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
                        {subscription.status === "active"
                          ? "Upgrade or extend your access"
                          : "Choose a new plan"}
                      </p>
                    </div>
                  </div>
                </button>

                {subscription.status === "active" && subscription.plan !== "free" && (
                  <button
                    onClick={cancelSubscription}
                    className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition text-red-600"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-3" />
                      <div>
                        <p className="font-medium">Cancel Auto-Renewal</p>
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
