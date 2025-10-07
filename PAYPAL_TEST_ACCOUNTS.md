# PayPal Sandbox Test Accounts

## 🔑 How to Get Test Accounts

### Option 1: Auto-Generated Accounts (Recommended)
PayPal automatically creates test accounts for you:

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Sign in with your PayPal account
3. Navigate to **"Sandbox" > "Accounts"**
4. You'll see pre-created accounts like:
   - `buyer-xxxx@example.com` (Test buyer account)
   - `seller-xxxx@example.com` (Test seller/business account)

### Option 2: Create Custom Test Accounts
1. In PayPal Developer Dashboard
2. Go to **"Sandbox" > "Accounts"**
3. Click **"Create Account"**
4. Choose:
   - **Account Type**: Personal (for buyers)
   - **Email**: Custom email (e.g., `testbuyer@example.com`)
   - **Password**: Custom password
   - **PayPal Balance**: Add test money (e.g., $1000 USD)

## 💳 Default PayPal Sandbox Credentials

If you can't access the Developer Dashboard, try these common test credentials:

### Test Buyer Account 1
- **Email**: `buyer@sandbox.paypal.com`
- **Password**: `12345678`

### Test Buyer Account 2  
- **Email**: `testbuyer-1@example.com`
- **Password**: `testpass123`

**Note**: These are example credentials. Use the actual accounts from your Developer Dashboard for best results.

## 🧪 Testing PayPal Payments

### Step-by-Step Testing Process

1. **Start Your App**: `npm run dev`

2. **Navigate to Billing**: `http://localhost:3000/billing?plan=starter`

3. **Click "Pay with PayPal"**: This creates a real PayPal order

4. **Login to PayPal Sandbox**: Use your test buyer credentials

5. **Complete Payment**: Click "Pay Now" in PayPal interface

6. **Return to Your App**: PayPal redirects back to success page

7. **Check Database**: Your subscription should be activated

### What You'll See in Logs

When you click "Pay with PayPal", watch your terminal for:

```bash
💳 Creating PayPal order for: {
  plan: 'starter',
  amount: 'USD 4',
  userId: '674a8b2d...',
  environment: 'https://api-m.sandbox.paypal.com'
}

✅ PayPal order created successfully: {
  orderId: '8XS123456789A',
  status: 'CREATED',
  approveUrl: 'https://www.sandbox.paypal.com/checkoutnow?token=8XS123456789A'
}
```

### After Completing Payment on PayPal

```bash
💰 Capturing PayPal order: 8XS123456789A

✅ PayPal payment captured successfully: {
  orderId: '8XS123456789A', 
  status: 'COMPLETED',
  amount: { currency_code: 'USD', value: '4.00' }
}
```

## 🔍 Troubleshooting

### Issue: Can't login to PayPal sandbox
**Solution**: Make sure you're using the correct test account credentials from your Developer Dashboard

### Issue: "Account locked" error
**Solution**: PayPal sandbox accounts can get locked. Create a new test account in your Developer Dashboard

### Issue: Payment fails
**Solution**: Ensure your test account has sufficient PayPal balance (add test money in Developer Dashboard)

### Issue: Wrong currency
**Solution**: PayPal pricing is in USD. Make sure your test account supports USD transactions

## 📊 Checking Transaction History

After completing test payments:

1. Go to PayPal Developer Dashboard
2. Navigate to **"Sandbox" > "Accounts"**
3. Click on your business account email
4. View transaction history to see completed payments

## 🎯 Demo Payment Scenarios

### Successful Payment Test
- Use valid test buyer account
- Account has sufficient balance
- Complete payment normally
- Should redirect to success page

### Failed Payment Test  
- Use account with zero balance
- Payment should fail gracefully
- User should see error message

### Cancelled Payment Test
- Start PayPal payment process
- Click "Cancel" in PayPal interface  
- Should redirect back to billing page

Your PayPal demo payment system is ready for comprehensive testing! 🎉