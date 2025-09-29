// Simple ProfileClient for debugging
"use client";

import { useSession } from "next-auth/react";

export default function ProfileClientSimple() {
  console.log('ProfileClientSimple rendering...');
  const { data: session, status } = useSession();
  
  console.log('Session status:', status);
  console.log('Session data:', session);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
          <a
            href="/api/auth/signin"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4">Profile</h1>
          
          <div className="space-y-4">
            <div>
              <strong>Name:</strong> {session?.user?.name || 'N/A'}
            </div>
            <div>
              <strong>Email:</strong> {session?.user?.email || 'N/A'}
            </div>
            <div>
              <strong>User ID:</strong> {session?.user?.id || 'N/A'}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify({ status, session }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}