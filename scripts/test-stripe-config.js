// scripts/test-stripe-config.js
// Test script to verify Stripe payment configuration

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeConfig() {
  console.log('🧪 Testing Stripe Payment Configuration');
  console.log('======================================\n');

  const plans = ['starter', 'pro', 'business'];
  const priceIds = {
    'starter': process.env.STRIPE_STARTER_PRICE_ID,
    'pro': process.env.STRIPE_PRO_PRICE_ID,
    'business': process.env.STRIPE_BUSINESS_PRICE_ID
  };

  for (const plan of plans) {
    console.log(`🔍 Testing ${plan} plan...`);
    
    const priceId = priceIds[plan];
    if (!priceId) {
      console.log(`  ❌ No price ID configured for ${plan} plan`);
      continue;
    }
    
    try {
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product);
      
      console.log(`  ✅ Price ID: ${priceId}`);
      console.log(`  ✅ Product: ${product.name}`);
      console.log(`  ✅ Amount: ${price.unit_amount / 100} ${price.currency.toUpperCase()}`);
      console.log(`  ✅ Interval: ${price.recurring?.interval || 'one-time'}`);
      console.log(`  ✅ Active: ${price.active ? 'Yes' : 'No'}\n`);
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}\n`);
    }
  }

  // Test creating a checkout session (without executing it)
  console.log('🛒 Testing Stripe Checkout Session Creation...');
  try {
    const testSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceIds.starter,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3001/cancel',
      customer_email: 'test@example.com',
    });
    
    console.log('  ✅ Checkout session created successfully');
    console.log(`  ✅ Session ID: ${testSession.id}`);
    console.log(`  ✅ Checkout URL: ${testSession.url}\n`);
    
    // Cancel the test session immediately
    await stripe.checkout.sessions.expire(testSession.id);
    console.log('  ✅ Test session cancelled successfully\n');
    
  } catch (error) {
    console.log(`  ❌ Checkout session error: ${error.message}\n`);
  }

  console.log('🎉 Stripe configuration test completed!');
}

if (require.main === module) {
  testStripeConfig();
}

module.exports = { testStripeConfig };