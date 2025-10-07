// src/app/billing/BillingContent.js
"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { getPlan, formatPrice } from '@/config/payments';

export default function BillingContent() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get("plan") || "starter";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Get plan configuration from centralized config
  const selectedPlan = getPlan(plan.toLowerCase());

  // Handle Free Plan
  if (selectedPlan.price === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Free Plan</h1>
          <p className="text-lg mb-6">
            You selected the <strong>{selectedPlan.name}</strong> plan.
          </p>
          <p className="text-gray-600 mb-6">No payment required.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Initiate Stripe checkout
  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/billing/initiate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/billing/success?plan=${plan}`,
          cancelUrl: `${window.location.origin}/billing?plan=${plan}`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Failed to create payment session');
        console.error('Payment session error:', data.details);
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError('Unable to start payment. Please try again.');
    }
    setLoading(false);
  };

  // Initiate PayPal checkout (redirect flow)
  const handlePayPalPayment = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/billing/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          successUrl: `${window.location.origin}/billing/success?plan=${plan}&gateway=paypal`,
          cancelUrl: `${window.location.origin}/billing?plan=${plan}`,
        }),
      });
      const data = await response.json();
      if (response.ok && data.approveUrl) {
        window.location.href = data.approveUrl;
      } else {
        setError(data.error || 'Failed to create PayPal order');
        console.error('PayPal order error:', data.details);
      }
    } catch (err) {
      console.error('PayPal initiation error:', err);
      setError('Unable to start PayPal checkout. Please try again.');
    }
    setLoading(false);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">Complete Your Purchase</h1>
        
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{selectedPlan.name} Plan</span>
            <span className="font-bold">{formatPrice(selectedPlan.price)}/month</span>
          </div>
          <p className="text-sm text-gray-600">Monthly plan — choose your payment method</p>
          <p className="text-sm text-gray-600 mt-2">
            Logged in as: <strong>{session.user.email}</strong>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              loading ? 'bg-primary/60' : 'bg-primary hover:bg-primary/90'
            } transition`}
          >
            {loading ? 'Redirecting...' : 'Pay with Stripe'}
          </button>
          <button
            onClick={handlePayPalPayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium border ${
              loading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-800'
            } transition`}
          >
            {loading ? 'Redirecting...' : 'Pay with PayPal'}
          </button>
        </div>

        {loading && (
          <div className="text-center mt-4 text-sm text-gray-500">
            Please wait while we redirect you to the payment page...
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            Secure payment via Stripe or PayPal. 
            Cancel anytime. All major credit/debit cards accepted.
          </p>
        </div>
      </div>
    </div>
  );
}