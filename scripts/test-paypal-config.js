// scripts/test-paypal-config.js
// Test script to diagnose PayPal configuration issues

require('dotenv').config({ path: '.env.local' });

async function testPayPalConfig() {
  console.log('🧪 Testing PayPal Configuration');
  console.log('================================\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`PAYPAL_CLIENT_ID: ${process.env.PAYPAL_CLIENT_ID ? process.env.PAYPAL_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log(`PAYPAL_CLIENT_SECRET: ${process.env.PAYPAL_CLIENT_SECRET ? '*'.repeat(20) : 'NOT SET'}`);
  console.log(`PAYPAL_MODE: ${process.env.PAYPAL_MODE || 'sandbox'}\n`);

  // Test getting access token
  try {
    console.log('🔑 Testing PayPal Access Token...');
    
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.log('❌ PayPal credentials not configured\n');
      return;
    }

    const baseURL = process.env.PAYPAL_MODE === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';
    
    console.log(`📡 Using PayPal API: ${baseURL}`);

    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${baseURL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ PayPal token error:', error);
      
      if (response.status === 401) {
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check if your PayPal Client ID and Secret are correct');
        console.log('   2. Make sure you are using sandbox credentials for testing');
        console.log('   3. Verify that your PayPal app has the correct permissions');
      }
      return;
    }

    const tokenData = await response.json();
    console.log('✅ PayPal access token obtained successfully');
    console.log(`   Token type: ${tokenData.token_type}`);
    console.log(`   Expires in: ${tokenData.expires_in} seconds\n`);

    // Test creating a sample order
    console.log('💳 Testing PayPal Order Creation...');
    
    const orderRequest = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: 'test-order',
          description: 'Test Order - AI Blog Platform Starter Plan',
          amount: {
            currency_code: 'USD',
            value: '9.00',
          },
        },
      ],
      application_context: {
        brand_name: 'AI Blog Platform',
        user_action: 'PAY_NOW',
        shipping_preference: 'NO_SHIPPING',
        return_url: 'http://localhost:3001/success',
        cancel_url: 'http://localhost:3001/cancel',
      },
    };

    const orderResponse = await fetch(`${baseURL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(orderRequest),
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('❌ PayPal order creation failed:', error);
      
      try {
        const errorData = JSON.parse(error);
        console.log('\n🔧 Error Details:');
        console.log(`   Error: ${errorData.name}`);
        console.log(`   Message: ${errorData.message}`);
        
        if (errorData.details) {
          errorData.details.forEach((detail, index) => {
            console.log(`   Detail ${index + 1}: ${detail.issue} - ${detail.description}`);
          });
        }
        
        if (errorData.name === 'CURRENCY_NOT_SUPPORTED_FOR_COUNTRY') {
          console.log('\n💡 Solution for Currency Issue:');
          console.log('   1. Log into your PayPal sandbox account');
          console.log('   2. Go to Account Settings > Payment Preferences');
          console.log('   3. Enable USD currency for your account');
          console.log('   4. Or try changing your PayPal account country to US');
          console.log('   5. You can also create a new US-based sandbox account');
        }
      } catch (parseError) {
        console.log('Raw error response:', error);
      }
      return;
    }

    const orderData = await orderResponse.json();
    console.log('✅ PayPal order created successfully!');
    console.log(`   Order ID: ${orderData.id}`);
    console.log(`   Status: ${orderData.status}`);
    
    const approveLink = orderData.links?.find(l => l.rel === 'approve')?.href;
    if (approveLink) {
      console.log(`   Approve URL: ${approveLink}`);
    }

  } catch (error) {
    console.error('❌ PayPal test failed:', error.message);
    
    console.log('\n🔧 Common Solutions:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify PayPal credentials are correct');
    console.log('   3. Ensure your PayPal sandbox account accepts USD');
    console.log('   4. Try creating a new US-based PayPal sandbox account');
    console.log('   5. Check PayPal developer console for account restrictions');
  }

  console.log('\n📚 PayPal Sandbox Resources:');
  console.log('   Dashboard: https://developer.paypal.com/');
  console.log('   Sandbox Accounts: https://developer.paypal.com/developer/accounts/');
  console.log('   Testing Guide: https://developer.paypal.com/docs/api-basics/sandbox/');
}

if (require.main === module) {
  testPayPalConfig();
}

module.exports = { testPayPalConfig };