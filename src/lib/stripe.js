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

// Helper function to get Stripe price ID from environment variables
export function getStripePriceId(plan) {
  const priceIdMap = {
    'starter': process.env.STRIPE_STARTER_PRICE_ID,
    'pro': process.env.STRIPE_PRO_PRICE_ID,
    'business': process.env.STRIPE_BUSINESS_PRICE_ID
  };

  const priceId = priceIdMap[plan];
  if (!priceId) {
    throw new Error(`No Stripe price ID configured for plan: ${plan}`);
  }

  return priceId;
}

// Helper function to get or retrieve a Stripe price by ID
export async function getOrCreateStripePrice(plan) {
  try {
    // Use the actual price ID from environment variables
    const priceId = getStripePriceId(plan);
    
    // Retrieve the existing price to validate it exists
    const price = await stripe.prices.retrieve(priceId);
    
    if (!price.active) {
      throw new Error(`Stripe price ${priceId} for plan ${plan} is not active`);
    }

    return price;
  } catch (error) {
    console.error(`Error retrieving Stripe price for plan ${plan}:`, error.message);
    throw new Error(`Failed to retrieve Stripe price for plan: ${plan}`);
  }
}

export default stripe;