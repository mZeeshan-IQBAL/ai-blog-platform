// src/lib/paypal.js - Direct REST API implementation

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.warn('⚠️  PayPal credentials not configured. PayPal payments will not work.');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is not set in environment variables');
  }
}

// Get PayPal base URL based on environment
function getPayPalBaseURL() {
  const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();
  return mode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';
}

// Get PayPal access token
async function getPayPalAccessToken() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    throw new Error('PayPal credentials not configured.');
  }

  // Check for dummy/mock credentials only
  if (process.env.PAYPAL_CLIENT_ID.includes('dummy') || 
      process.env.PAYPAL_CLIENT_ID.includes('mock') ||
      process.env.PAYPAL_CLIENT_ID.includes('test_')) {
    console.warn('🧪 Using PayPal mock mode for development');
    return 'mock_access_token_for_development';
  }

  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
  
  try {
    const response = await fetch(`${getPayPalBaseURL()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('PayPal token error:', error);
      
      // Only fallback to mock mode if using dummy credentials
      if (process.env.PAYPAL_CLIENT_ID.includes('dummy') || 
          process.env.PAYPAL_CLIENT_ID.includes('mock')) {
        console.warn('🧪 PayPal authentication failed, using mock mode');
        return 'mock_access_token_for_development';
      }
      
      throw new Error('Failed to get PayPal access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    // Only use mock mode for dummy credentials
    if (process.env.PAYPAL_CLIENT_ID.includes('dummy') || 
        process.env.PAYPAL_CLIENT_ID.includes('mock')) {
      console.warn('🧪 PayPal error, using mock mode:', error.message);
      return 'mock_access_token_for_development';
    }
    throw error;
  }
}

// Import centralized payment configuration
import { PAYPAL_PLANS } from '@/config/payments';

// Create an order for a given plan and user; returns PayPal order ID
export async function createPayPalOrder({ plan, userId, userEmail, returnUrl, cancelUrl }) {
  const planConfig = PAYPAL_PLANS[plan];
  if (!planConfig) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const accessToken = await getPayPalAccessToken();

  const orderRequest = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: `${plan}-${userId}`,
        description: `AI Blog Platform - ${planConfig.name} (1 month)`,
        custom_id: JSON.stringify({ plan, userId, userEmail }),
        amount: {
          currency_code: planConfig.currency,
          value: planConfig.amountUSD.toFixed(2),
        },
      },
    ],
    application_context: {
      brand_name: 'AI Blog Platform',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
      return_url: returnUrl || undefined,
      cancel_url: cancelUrl || undefined,
    },
  };

  // Mock mode for development
  if (accessToken === 'mock_access_token_for_development') {
    console.warn('🧪 Creating mock PayPal order for development');
    return {
      id: `mock_order_${Date.now()}`,
      status: 'CREATED',
      links: [
        {
          href: `http://localhost:3001/billing/success?plan=${plan}&gateway=paypal&mock=true`,
          rel: 'approve',
          method: 'GET'
        }
      ],
      purchase_units: orderRequest.purchase_units
    };
  }

  try {
    console.log('💳 Creating PayPal order for:', {
      plan,
      amount: `${planConfig.currency} ${planConfig.amountUSD}`,
      userId: userId.substring(0, 8) + '...',
      environment: getPayPalBaseURL()
    });

    const response = await fetch(`${getPayPalBaseURL()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(orderRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ PayPal order creation failed:', error);
      throw new Error('Failed to create PayPal order');
    }

    const result = await response.json();
    console.log('✅ PayPal order created successfully:', {
      orderId: result.id,
      status: result.status,
      approveUrl: result.links?.find(l => l.rel === 'approve')?.href
    });
    return result;
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw error;
  }
}

// Capture a PayPal order by ID; returns capture details
export async function capturePayPalOrder(orderId) {
  const accessToken = await getPayPalAccessToken();
  
  // Mock mode for development
  if (accessToken === 'mock_access_token_for_development' || orderId.startsWith('mock_order_')) {
    console.warn('🧪 Capturing mock PayPal order for development');
    return {
      id: orderId,
      status: 'COMPLETED',
      purchase_units: [{
        reference_id: 'starter-mock',
        custom_id: JSON.stringify({ plan: 'starter', userId: 'mock_user', userEmail: 'test@example.com' }),
        payments: {
          captures: [{
            id: `mock_capture_${Date.now()}`,
            amount: {
              currency_code: 'USD',
              value: '4.00'
            },
            status: 'COMPLETED'
          }]
        }
      }],
      payer: {
        email_address: 'test@example.com',
        payer_id: 'mock_payer_123'
      }
    };
  }
  
  try {
    console.log('💰 Capturing PayPal order:', orderId);

    const response = await fetch(`${getPayPalBaseURL()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ PayPal capture failed:', error);
      throw new Error('Failed to capture PayPal order');
    }

    const result = await response.json();
    console.log('✅ PayPal payment captured successfully:', {
      orderId: result.id,
      status: result.status,
      amount: result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
    });
    return result;
  } catch (error) {
    console.error('PayPal order capture error:', error);
    throw error;
  }
}
