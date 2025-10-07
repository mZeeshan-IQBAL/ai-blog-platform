// src/config/payments.js
// Centralized payment configuration for Stripe and PayPal

export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  NAME: 'US Dollars'
};

export const PAYMENT_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: CURRENCY.CODE,
    interval: 'month',
    features: [
      'Up to 3 blog posts',
      'Basic AI assistance',
      'Community support',
      'Basic analytics'
    ],
    popular: false,
    stripePriceId: null, // No Stripe price for free plan
    description: 'Perfect for getting started with AI blogging'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9,
    currency: CURRENCY.CODE,
    interval: 'month',
    features: [
      'Up to 10 blog posts per month',
      'Advanced AI writing assistance',
      'SEO optimization tools',
      'Basic analytics dashboard',
      'Email support'
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_usd', // Replace with actual Stripe price ID
    description: 'Ideal for individual bloggers and content creators'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    currency: CURRENCY.CODE,
    interval: 'month',
    features: [
      'Up to 50 blog posts per month',
      'Premium AI writing assistance',
      'Advanced SEO tools',
      'Full analytics suite',
      'Priority email support',
      'Custom templates',
      'Social media integration'
    ],
    popular: false,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_usd', // Replace with actual Stripe price ID
    description: 'Perfect for professional bloggers and small businesses'
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 39,
    currency: CURRENCY.CODE,
    interval: 'month',
    features: [
      'Unlimited blog posts',
      'Premium AI writing assistance',
      'Advanced SEO and analytics',
      'Priority support (24/7)',
      'Custom branding',
      'Team collaboration tools',
      'API access',
      'White-label options'
    ],
    popular: false,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business_usd', // Replace with actual Stripe price ID
    description: 'Designed for agencies and large organizations'
  }
};

// Helper functions for pricing
export const formatPrice = (price, currency = CURRENCY.CODE) => {
  if (price === 0) return 'Free';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(price);
};

export const getPlan = (planId) => {
  return PAYMENT_PLANS[planId] || PAYMENT_PLANS.starter;
};

export const getAllPlans = () => {
  return Object.values(PAYMENT_PLANS);
};

export const getPaidPlans = () => {
  return Object.values(PAYMENT_PLANS).filter(plan => plan.price > 0);
};

// PayPal specific configuration (matching the existing structure)
export const PAYPAL_PLANS = {
  starter: {
    name: 'Starter',
    amountUSD: PAYMENT_PLANS.starter.price,
    currency: CURRENCY.CODE,
    interval: 'month',
    features: PAYMENT_PLANS.starter.features
  },
  pro: {
    name: 'Pro',
    amountUSD: PAYMENT_PLANS.pro.price,
    currency: CURRENCY.CODE,
    interval: 'month',
    features: PAYMENT_PLANS.pro.features
  },
  business: {
    name: 'Business',
    amountUSD: PAYMENT_PLANS.business.price,
    currency: CURRENCY.CODE,
    interval: 'month',
    features: PAYMENT_PLANS.business.features
  }
};

// Stripe configuration helper
export const STRIPE_CONFIG = {
  currency: CURRENCY.CODE,
  plans: {
    starter: {
      price: PAYMENT_PLANS.starter.price * 100, // Stripe uses cents
      currency: CURRENCY.CODE,
      interval: 'month'
    },
    pro: {
      price: PAYMENT_PLANS.pro.price * 100,
      currency: CURRENCY.CODE,
      interval: 'month'
    },
    business: {
      price: PAYMENT_PLANS.business.price * 100,
      currency: CURRENCY.CODE,
      interval: 'month'
    }
  }
};

export default {
  CURRENCY,
  PAYMENT_PLANS,
  PAYPAL_PLANS,
  STRIPE_CONFIG,
  formatPrice,
  getPlan,
  getAllPlans,
  getPaidPlans
};