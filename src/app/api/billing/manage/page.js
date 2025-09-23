// 4. src/app/billing/manage/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Calendar, AlertCircle, Settings } from "lucide-react";

export default function ManageSubscription() {
  const router = useRouter();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/billing/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
    setLoading(false);
  };

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Subscription cancelled successfully');
        fetchSubscription();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                    {subscription.plan}
                  </p>
                  <p className="text-gray-600">${subscription.amount}/month</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Billing Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Next billing date:</span>
                  <span className="font-medium">
                    {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment method:</span>
                  <span className="font-medium">PayPal</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/pricing')}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-3 text-gray-400" />
                    <div>
                      <p className="font-medium">Change Plan</p>
                      <p className="text-sm text-gray-600">Upgrade or downgrade your subscription</p>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={cancelSubscription}
                  className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition text-red-600"
                >
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-medium">Cancel Subscription</p>
                      <p className="text-sm">Cancel your subscription (takes effect at end of billing period)</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">No active subscription found</p>
            <button 
              onClick={() => router.push('/pricing')}
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
