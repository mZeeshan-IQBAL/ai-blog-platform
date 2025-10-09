# Integration Guide - Usage Sync Button

## Quick Setup

To add the usage sync functionality to your billing/subscription page, follow these steps:

### 1. Import the Component

In your billing/subscription page component, import the UsageSyncButton:

```jsx
import UsageSyncButton from '@/components/billing/UsageSyncButton';
```

### 2. Add to Your JSX

Add the sync button to your billing page (typically after the usage statistics):

```jsx
export default function BillingPage() {
  const [subscriptionData, setSubscriptionData] = useState(null);
  
  // Function to refresh subscription data after sync
  const handleSyncComplete = async (syncData) => {
    // Optionally refresh the subscription data
    await fetchSubscriptionData();
    console.log('Sync completed:', syncData);
  };

  return (
    <div className="billing-page">
      {/* Your existing billing content */}
      
      {/* Usage Statistics */}
      <div className="usage-stats">
        <h3>Your Current Plan</h3>
        <div className="stats-grid">
          <div>Posts: {subscriptionData?.usage?.posts || 0}</div>
          <div>Storage: {subscriptionData?.usage?.storage || 0}MB</div>
          {/* Other usage stats */}
        </div>
      </div>
      
      {/* Add the sync button */}
      <div className="mt-6">
        <UsageSyncButton onSyncComplete={handleSyncComplete} />
      </div>
      
      {/* Rest of your billing content */}
    </div>
  );
}
```

### 3. Expected Behavior

After adding the component:

1. ✅ **Automatic Sync**: Usage syncs when users visit the page
2. ✅ **Manual Sync**: Users can click "Sync Now" for immediate sync
3. ✅ **Visual Feedback**: Loading states, success messages, and error handling
4. ✅ **Real-time Updates**: Usage counts update immediately after sync

### 4. Styling

The component uses Tailwind CSS classes and should work with your existing styles. The component includes:
- Blue color scheme for the sync button
- Green color scheme for success messages
- Proper spacing and responsive design

### 5. Optional: Conditional Display

You can conditionally show the sync button only when needed:

```jsx
// Only show if there might be discrepancies
const shouldShowSync = subscriptionData?.usage?.posts === 0 && hasExistingPosts;

return (
  <div>
    {/* Other content */}
    {shouldShowSync && (
      <UsageSyncButton onSyncComplete={handleSyncComplete} />
    )}
  </div>
);
```

## Testing

### Manual Testing Steps:
1. Start development server: `npm run dev`
2. Sign in to your account
3. Navigate to the billing page with the sync button
4. Click "Sync Now" to test manual sync
5. Verify that post counts update correctly

### Expected Results:
- Post count should change from 0 to actual number of published posts
- Success message should appear
- Usage statistics should reflect accurate counts

## Alternative: Just Auto-Sync

If you prefer automatic sync only (without manual button), the usage will still sync automatically when users visit the subscription page due to the changes in `src/app/api/billing/subscription/route.js`.

## Troubleshooting

If the sync button doesn't work:
1. Check browser console for errors
2. Verify the API endpoints are accessible
3. Ensure user is authenticated
4. Check server logs for detailed error information

The system is designed to be robust and will continue working even if sync fails, ensuring your billing page remains functional.