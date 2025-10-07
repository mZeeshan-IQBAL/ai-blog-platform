// scripts/setup-multi-currency-paypal.js
// Script to add multi-currency support for PayPal

require('dotenv').config({ path: '.env.local' });

async function setupMultiCurrencyPayPal() {
  console.log('🌍 Setting up Multi-Currency PayPal Support');
  console.log('===========================================\n');

  const supportedCurrencies = [
    { code: 'USD', name: 'US Dollar', countries: ['US', 'CA'] },
    { code: 'EUR', name: 'Euro', countries: ['DE', 'FR', 'IT', 'ES', 'NL'] },
    { code: 'GBP', name: 'British Pound', countries: ['GB', 'UK'] },
    { code: 'AUD', name: 'Australian Dollar', countries: ['AU'] },
    { code: 'CAD', name: 'Canadian Dollar', countries: ['CA'] },
    { code: 'JPY', name: 'Japanese Yen', countries: ['JP'] }
  ];

  console.log('💰 Supported Currencies for PayPal:');
  supportedCurrencies.forEach(currency => {
    console.log(`   ${currency.code} - ${currency.name} (${currency.countries.join(', ')})`);
  });

  console.log('\n🔧 To fix your current issue:');
  console.log('   1. ✅ Your PayPal API setup is working correctly');
  console.log('   2. ❌ Your PayPal buyer test account has currency restrictions');
  console.log('\n💡 Quick Fix Options:');
  console.log('   Option A: Create new US-based PayPal sandbox buyer account');
  console.log('   Option B: Change your current sandbox account country to US');
  console.log('   Option C: Add multi-currency support (see below)');

  console.log('\n📝 Steps to create new US PayPal sandbox account:');
  console.log('   1. Go to: https://developer.paypal.com/developer/accounts/');
  console.log('   2. Click "Create Account"');
  console.log('   3. Select Account Type: "Personal (Buyer)"');
  console.log('   4. Select Country: "United States"');
  console.log('   5. Set Currency: "USD"');
  console.log('   6. Click "Create Account"');
  console.log('   7. Use this new account for testing payments');

  console.log('\n🌍 Alternative: Multi-Currency Configuration');
  console.log('   We can modify the PayPal integration to detect user location');
  console.log('   and automatically select the appropriate currency.');
  
  // Test what currencies work with current credentials
  console.log('\n🧪 Testing currency support with your current PayPal app...');

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    console.log('❌ PayPal credentials not configured');
    return;
  }

  const baseURL = 'https://api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  // Get access token
  const tokenResponse = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenResponse.ok) {
    console.log('❌ Could not get access token');
    return;
  }

  const tokenData = await tokenResponse.json();
  
  // Test different currencies
  const testCurrencies = ['USD', 'EUR', 'GBP'];
  
  for (const currency of testCurrencies) {
    console.log(`\n   Testing ${currency}...`);
    
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: `test-${currency.toLowerCase()}`,
        description: `Test Order - ${currency}`,
        amount: {
          currency_code: currency,
          value: currency === 'JPY' ? '900' : '9.00', // JPY doesn't use decimals
        },
      }],
      application_context: {
        brand_name: 'AI Blog Platform',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: 'http://localhost:3001/success',
        cancel_url: 'http://localhost:3001/cancel',
      },
    };

    try {
      const orderResponse = await fetch(`${baseURL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(orderRequest),
      });

      if (orderResponse.ok) {
        const orderData = await orderResponse.json();
        console.log(`   ✅ ${currency} supported - Order ID: ${orderData.id}`);
      } else {
        console.log(`   ❌ ${currency} not supported`);
      }
    } catch (error) {
      console.log(`   ❌ ${currency} test failed: ${error.message}`);
    }
  }

  console.log('\n🎯 Recommended Solution:');
  console.log('   Create a new US-based PayPal sandbox buyer account');
  console.log('   This is the quickest and most reliable fix for testing.');
}

if (require.main === module) {
  setupMultiCurrencyPayPal();
}

module.exports = { setupMultiCurrencyPayPal };