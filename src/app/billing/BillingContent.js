// 1. src/app/billing/BillingContent.js (Updated)
"use client";
import { useSearchParams } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';

export default function BillingContent() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get("plan") || "starter";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    }
  }, [session, status, router]);

  // Plan configurations
  const planConfig = {
    free: { name: "Free", price: 0, planId: null },
    starter: { name: "Starter", price: 4, planId: "P-5ML4271244454362WXNWU5NQ" },
    pro: { name: "Pro", price: 8, planId: "P-1XA32960N2242154MXNWU6QI" },
    business: { name: "Business", price: 15, planId: "P-9UH47356C3123456NXNWU7RI" }
  };

  const selectedPlan = planConfig[plan.toLowerCase()] || planConfig.starter;

  // PayPal configuration
  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "subscription",
    vault: true,
  };

  const createOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: selectedPlan.price.toString(),
        },
        description: `${selectedPlan.name} Plan Subscription`
      }],
      application_context: {
        shipping_preference: "NO_SHIPPING"
      }
    });
  };

  const onApprove = async (data, actions) => {
    setLoading(true);
    try {
      const details = await actions.order.capture();
      
      // Send payment info to your backend
      const response = await fetch('/api/billing/process-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: details.id,
          plan: plan,
          payerInfo: details.payer,
          amount: selectedPlan.price
        }),
      });

      if (response.ok) {
        router.push('/billing/success?plan=' + plan);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', error);
    }
    setLoading(false);
  };

  const onError = (err) => {
    setError('Payment failed. Please try again.');
    console.error('PayPal error:', err);
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render payment form if not authenticated
  if (!session) {
    return null;
  }

  if (selectedPlan.price === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Free Plan</h1>
          <p className="text-lg mb-6">
            You selected the <strong>{selectedPlan.name}</strong> plan.
          </p>
          <p className="text-gray-600 mb-6">No payment required for the free plan.</p>
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-4 text-center">Complete Your Purchase</h1>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">{selectedPlan.name} Plan</span>
            <span className="font-bold">${selectedPlan.price}/month</span>
          </div>
          <p className="text-sm text-gray-600">Monthly subscription</p>
          <p className="text-sm text-gray-600 mt-2">
            Logged in as: <strong>{session.user.email}</strong>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            disabled={loading}
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "subscribe"
            }}
          />
        </PayPalScriptProvider>

        {loading && (
          <div className="text-center mt-4">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Processing payment...
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            By completing your purchase, you agree to our Terms of Service and Privacy Policy.
            Your subscription will automatically renew monthly.
          </p>
        </div>
      </div>
    </div>
  );
}