// src/app/billing/success/page.js
"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [error, setError] = useState('');
  
  const plan = params.get("plan") || "starter";
  const sessionId = params.get("session_id");
  const gateway = params.get("gateway");
  const paypalOrderId = params.get("token"); // PayPal sends 'token' parameter
  const mockMode = params.get("mock");

  // Debug logging
  useEffect(() => {
    console.log('URL params:', {
      plan,
      sessionId,
      gateway,
      paypalOrderId,
      mockMode,
      fullURL: typeof window !== 'undefined' ? window.location.href : 'SSR',
      allParams: [...params.entries()]
    });
  }, [plan, sessionId, gateway, paypalOrderId, mockMode, params]);

  // Verify payment (Stripe or PayPal)
  useEffect(() => {
    const verifyPayment = async () => {
      // Handle mock mode
      if (mockMode === 'true') {
        console.log('🧪 Mock PayPal payment - auto success');
        setSubscriptionData({
          plan: plan,
          gateway: 'paypal',
          status: 'active',
          mock: true
        });
        setVerificationStatus('success');
        return;
      }

      // Handle PayPal payment
      if (gateway === 'paypal' && paypalOrderId) {
        try {
          const response = await fetch('/api/billing/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: paypalOrderId })
          });
          const data = await response.json();

          if (response.ok && data.success) {
            setSubscriptionData({
              plan: data.plan,
              gateway: 'paypal',
              status: 'active',
              amount: data.amount,
              currency: data.currency
            });
            setVerificationStatus('success');
          } else {
            setError(data.error || 'PayPal payment verification failed');
            setVerificationStatus('error');
          }
        } catch (err) {
          console.error('PayPal verification error:', err);
          setError('Unable to verify PayPal payment');
          setVerificationStatus('error');
        }
        return;
      }

      // Handle Stripe payment
      if (sessionId) {
        try {
          const response = await fetch(`/api/billing/verify-session?session_id=${sessionId}`);
          const data = await response.json();

          if (response.ok && data.verified) {
            setSubscriptionData(data.subscription);
            setVerificationStatus('success');
          } else {
            setError(data.error || 'Stripe payment verification failed');
            setVerificationStatus('error');
          }
        } catch (err) {
          console.error('Stripe verification error:', err);
          setError('Unable to verify Stripe payment');
          setVerificationStatus('error');
        }
        return;
      }

      // No payment info found
      setError('No payment information found');
      setVerificationStatus('error');
    };

    if (session) {
      verifyPayment();
    }
  }, [session, sessionId, gateway, paypalOrderId, mockMode, plan]);

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

  // Show verification in progress
  if (verificationStatus === 'verifying') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
          <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-6 animate-spin" />
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Verifying Payment...</h1>
          <p className="text-gray-600">
            Please wait while we confirm your subscription.
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4 text-red-700">Verification Failed</h1>
          <p className="text-gray-600 mb-6">
            {error || 'We couldn\'t verify your payment. Please contact support.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/billing/manage')}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Check Billing Status
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-green-700">Payment Successful!</h1>
        <p className="text-lg mb-6">
          Welcome to the <strong>{subscriptionData?.plan || plan}</strong> plan,{" "}
          <span className="text-primary">{session.user?.name || "User"}</span>!
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            Payment method: <strong>
              {subscriptionData?.gateway === 'paypal' ? 'PayPal' : 'Stripe'}
              {subscriptionData?.mock && ' (Demo Mode)'}
            </strong>
          </p>
          {subscriptionData?.amount && subscriptionData?.currency && (
            <p className="text-sm text-gray-600">
              Amount: <strong>{subscriptionData.currency} {subscriptionData.amount}</strong>
            </p>
          )}
        </div>
        <p className="text-gray-600 mb-8">
          Your monthly subscription is now active!
          {subscriptionData?.currentPeriodEnd && (
            <> Next billing date: <strong>{new Date(subscriptionData.currentPeriodEnd).toLocaleDateString()}</strong></>  
          )}
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