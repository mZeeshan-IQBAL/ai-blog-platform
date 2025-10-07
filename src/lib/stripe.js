// src/lib/stripe.js
import Stripe from 'stripe';
import { STRIPE_CONFIG } from '@/config/payments';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Initialize Stripe with the secret key (test mode)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Use latest API version
});

// Use centralized plan configurations
export const STRIPE_PLANS = STRIPE_CONFIG.plans;

// Helper function to create or retrieve a Stripe product
export async function getOrCreateStripeProduct(plan) {
  const planConfig = STRIPE_PLANS[plan];
  if (!planConfig) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  // Get the actual plan name from PAYMENT_PLANS
  const { getPlan } = await import('@/config/payments');
  const fullPlanConfig = getPlan(plan);
  const planName = fullPlanConfig.name;

  // List existing products to see if we already have this plan
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  });

  // Look for existing product with this plan name
  let product = products.data.find(p => p.name === `AI Blog Platform - ${planName}`);

  if (!product) {
    // Create new product
    product = await stripe.products.create({
      name: `AI Blog Platform - ${planName}`,
      description: `${planName} plan for AI Blog Platform ($${fullPlanConfig.price}/month)`,
      metadata: {
        plan: plan,
        platform: 'ai-blog-platform',
        price_usd: fullPlanConfig.price.toString()
      }
    });
  }

  return product;
}

// Helper function to create or retrieve a Stripe price
export async function getOrCreateStripePrice(plan) {
  const planConfig = STRIPE_PLANS[plan];
  if (!planConfig) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const product = await getOrCreateStripeProduct(plan);

  // List existing prices for this product
  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
  });

  // Look for existing price with matching amount and currency
  let price = prices.data.find(p => 
    p.unit_amount === planConfig.price && // Already in cents from STRIPE_CONFIG
    p.currency === planConfig.currency &&
    p.recurring?.interval === planConfig.interval
  );

  if (!price) {
    // Create new price
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: planConfig.price, // Already in cents from STRIPE_CONFIG
      currency: planConfig.currency,
      recurring: {
        interval: planConfig.interval,
      },
      metadata: {
        plan: plan,
        platform: 'ai-blog-platform'
      }
    });
  }

  return price;
}

export default stripe;