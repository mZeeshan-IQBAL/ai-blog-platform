// Debug page to test notifications
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getPusherClient } from "@/lib/pusherClient";

export default function NotificationDebugPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, result, details = "") => {
    setTestResults(prev => [...prev, { 
      test, 
      result, 
      details,
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  // Test Pusher connection
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.providerId) {
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) {
      addTestResult("Pusher Client", "❌ Failed", "getPusherClient() returned null");
      return;
    }

    addTestResult("Pusher Client", "✅ Created", "Client instance created successfully");

    pusher.connection.bind("connected", () => {
      setConnectionStatus("connected");
      addTestResult("Pusher Connection", "✅ Connected", "Successfully connected to Pusher");
    });

    pusher.connection.bind("disconnected", () => {
      setConnectionStatus("disconnected");
      addTestResult("Pusher Connection", "❌ Disconnected", "Lost connection to Pusher");
    });

    pusher.connection.bind("error", (err) => {
      setConnectionStatus("error");
      addTestResult("Pusher Connection", "❌ Error", `Connection error: ${JSON.stringify(err)}`);
    });

    const channelName = `private-user-${session.user.providerId}`;
    addTestResult("Channel Setup", "🔄 Subscribing", `Channel: ${channelName}`);

    const channel = pusher.subscribe(channelName);

    channel.bind("notification", (data) => {
      console.log("📩 Notification received:", data);
      setNotifications(prev => [data, ...prev]);
      addTestResult("Notification Received", "✅ Success", `Type: ${data.type}, From: ${data.fromUser?.name}`);
    });

    channel.bind("pusher:subscription_succeeded", () => {
      addTestResult("Channel Subscription", "✅ Succeeded", `Subscribed to ${channelName}`);
    });

    channel.bind("pusher:subscription_error", (err) => {
      addTestResult("Channel Subscription", "❌ Failed", `Error: ${JSON.stringify(err)}`);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.providerId, status]);

  // Test notification API
  const testNotificationAPI = async () => {
    if (!session?.user?.providerId) return;

    addTestResult("API Test", "🔄 Starting", "Testing notification API endpoint");

    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProviderId: session.user.providerId,
          type: 'test',
          message: 'Test notification',
          fromUser: {
            id: 'test-user',
            name: 'Test User',
            email: 'test@example.com',
            image: null
          },
          extra: {
            source: 'debug-page'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        addTestResult("API Test", "✅ Success", `Response: ${JSON.stringify(data)}`);
      } else {
        const errorData = await response.json();
        addTestResult("API Test", "❌ Failed", `Status: ${response.status}, Error: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      addTestResult("API Test", "❌ Error", `Exception: ${error.message}`);
    }
  };

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Notification Debug</h1>
        <p>Please sign in to test notifications.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Notification System Debug</h1>
      
      {/* User Info */}
      <div className="bg-primary/10 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Session Info</h2>
        <p><strong>Name:</strong> {session.user.name}</p>
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>Provider ID:</strong> {session.user.providerId}</p>
        <p><strong>Channel:</strong> private-user-{session.user.providerId}</p>
        <p><strong>Connection Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {connectionStatus}
          </span>
        </p>
      </div>

      {/* Test Buttons */}
      <div className="mb-6">
        <button
          onClick={testNotificationAPI}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 mr-4"
        >
          Test Notification API
        </button>
        <button
          onClick={() => setTestResults([])}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 mr-4"
        >
          Clear Test Results
        </button>
        <button
          onClick={() => setNotifications([])}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Clear Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Test Results ({testResults.length})</h2>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet</p>
            ) : (
              testResults.map((result, i) => (
                <div key={i} className="bg-white p-3 rounded border-l-4 border-primary">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{result.test}</span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className="mt-1">
                    <span className="mr-2">{result.result}</span>
                    {result.details && (
                      <span className="text-sm text-gray-600">{result.details}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Received Notifications */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-4">Received Notifications ({notifications.length})</h2>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications received yet</p>
            ) : (
              notifications.map((notif, i) => (
                <div key={i} className="bg-white p-3 rounded border-l-4 border-green-500">
                  <div className="font-medium">{notif.type} notification</div>
                  <div className="text-sm text-gray-600">
                    From: {notif.fromUser?.name || 'Unknown'}
                  </div>
                  {notif.extra && (
                    <div className="text-xs text-gray-500 mt-1">
                      Extra: {JSON.stringify(notif.extra)}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {notif.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Environment Variables Check */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">Environment Variables Status</h2>
        <p className="text-sm text-yellow-800">
          ⚠️ If notifications aren&apos;t working, check that these Pusher environment variables are set in your .env.local file:
        </p>
        <ul className="text-sm text-yellow-800 mt-2 list-disc list-inside">
          <li>PUSHER_APP_ID</li>
          <li>PUSHER_KEY</li>
          <li>PUSHER_SECRET</li>
          <li>PUSHER_CLUSTER</li>
          <li>NEXT_PUBLIC_PUSHER_KEY</li>
          <li>NEXT_PUBLIC_PUSHER_CLUSTER</li>
        </ul>
      </div>
    </div>
  );
}