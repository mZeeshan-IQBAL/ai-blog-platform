"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function TestEmailPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [result, setResult] = useState(null);

  const sendTestEmail = async () => {
    if (!session) {
      toast.error("Please log in first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: testEmail || session.user.email
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success("Test email sent! Check your inbox.");
      } else {
        toast.error(`Email failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Test email error:", error);
      toast.error("Failed to send test email");
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Email Testing</h1>
        <p>Please log in to test email functionality.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">📧 Email Testing & Debugging</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Email Delivery</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Email Address (optional)
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder={session.user.email}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to send to your account email: {session.user.email}
          </p>
        </div>

        <button
          onClick={sendTestEmail}
          disabled={loading}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "🧪 Send Test Email"}
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {result.success ? "✅ Test Result" : "❌ Error Result"}
          </h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-800 mb-2">🔧 Environment Info</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>User:</strong> {session.user.name} ({session.user.email})</p>
          <p><strong>Environment:</strong> Development</p>
          <p><strong>Email Service:</strong> Resend</p>
        </div>
      </div>

      <div className="mt-6 bg-primary/10 border border-primary/20 rounded-lg p-6">
        <h3 className="font-semibold text-primary mb-2">📚 Troubleshooting Guide</h3>
        <div className="text-sm text-primary space-y-2">
          <p><strong>1. Check Spam Folder:</strong> Test emails might end up in spam</p>
          <p><strong>2. Verify Email Address:</strong> Make sure the recipient email is valid</p>
          <p><strong>3. API Key Issues:</strong> Check if Resend API key is valid and has permissions</p>
          <p><strong>4. Domain Verification:</strong> Ensure sender domain is verified in Resend</p>
          <p><strong>5. Rate Limits:</strong> Check if you&apos;ve exceeded Resend&apos;s rate limits</p>
        </div>
      </div>
    </div>
  );
}