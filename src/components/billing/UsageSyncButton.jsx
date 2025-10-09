"use client";

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function UsageSyncButton({ onSyncComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStats, setSyncStats] = useState(null);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/billing/sync-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStats(data);
        toast.success('Usage synced successfully!');
        
        // Call the callback to refresh parent component data
        if (onSyncComplete) {
          onSyncComplete(data);
        }
        
        // Auto-hide sync stats after 5 seconds
        setTimeout(() => setSyncStats(null), 5000);
      } else {
        toast.error(data.error || 'Failed to sync usage');
      }
    } catch (error) {
      console.error('Error syncing usage:', error);
      toast.error('Failed to sync usage. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sync Button */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div>
          <h3 className="font-semibold text-blue-900">Sync Usage Statistics</h3>
          <p className="text-sm text-blue-700 mt-1">
            Update your usage counts to reflect actual published posts and usage
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Syncing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Sync Now
            </>
          )}
        </button>
      </div>

      {/* Sync Results */}
      {syncStats && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Sync Completed Successfully
              </h4>
              
              <div className="mt-2 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-green-800">Published Posts:</span>
                    <div className="text-green-700">
                      {syncStats.actualCounts?.posts || 0} found
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-green-800">Previously Recorded:</span>
                    <div className="text-green-700">
                      {syncStats.syncResult?.updated?.posts || 0} posts
                    </div>
                  </div>
                </div>
                
                {syncStats.discrepancies && syncStats.discrepancies.posts && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800">
                    <span className="font-medium">Note:</span> Usage count has been updated to match your actual published posts.
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setSyncStats(null)}
              className="text-green-600 hover:text-green-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>💡 Tip:</strong> Usage statistics are automatically synced when you visit this page, 
          but you can manually sync if you notice discrepancies.
        </p>
      </div>
    </div>
  );
}