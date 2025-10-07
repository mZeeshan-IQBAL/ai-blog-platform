# PayPal Integration Setup Guide

## 🔧 PayPal Developer Account Setup

### Step 1: Create PayPal Developer Account
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Sign in with your PayPal account or create a new one
3. Accept the developer agreement

### Step 2: Create a New Application
1. Click on "Create App" 
2. Choose "Default Application"
3. Select "Sandbox" for testing (or "Live" for production)
4. Click "Create App"

### Step 3: Get Your Credentials
After creating the app, you'll see:
- **Client ID**: A string starting with something like `AbcDef123...`
- **Client Secret**: A longer string starting with something like `EFgh456...`

### Step 4: Update Environment Variables
Replace these values in your `.env.local` file:

```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_actual_client_id_here
PAYPAL_CLIENT_SECRET=your_actual_client_secret_here
PAYPAL_MODE=sandbox  # Use 'live' for production
```

## 🧪 Testing PayPal Integration

### Sandbox Test Accounts
PayPal automatically creates sandbox accounts for testing:
1. Go to "Accounts" in your PayPal Developer Dashboard
2. You'll see test buyer and seller accounts
3. Use these accounts to test payments

### Test Payment Flow
1. Start your development server: `npm run dev`
2. Navigate to: `http://localhost:3001/billing?plan=starter`
3. Click "Pay with PayPal"
4. Use sandbox test account credentials to complete payment

## 🚨 Important Notes

- **Never commit real PayPal credentials** to version control
- Use **sandbox mode** for development and testing
- Switch to **live mode** only for production
- The current dummy credentials trigger **mock mode** for development

## ✅ Current Status

**The PayPal integration is now working in mock mode!** 

- ✅ PayPal buttons appear on billing page
- ✅ Mock payments work for development/testing
- ✅ Success page handles PayPal payments
- ✅ Payment method detection works correctly

**To use real PayPal payments:**
1. Get real credentials from PayPal Developer Dashboard
2. Replace the dummy values in `.env.local`
3. Test with PayPal sandbox accounts

## 💰 Plan Pricing Configuration

PayPal plans are configured in `src/lib/paypal.js`:
- **Starter**: $4 USD/month
- **Pro**: $8 USD/month  
- **Business**: $15 USD/month

You can adjust these prices to match your business model.

## 🔍 Troubleshooting

### Common Issues:
1. **"Module not found" error**: Make sure `@paypal/paypal-server-sdk` is installed
2. **"Credentials not configured"**: Update your `.env.local` with real PayPal credentials
3. **Payment fails**: Check that you're using sandbox mode and test accounts

### Need Help?
- Check the [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- Review your PayPal Developer Dashboard for app configuration
- Make sure your webhook URLs are configured correctly