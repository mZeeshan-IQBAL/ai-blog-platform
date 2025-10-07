// scripts/sync-stripe-prices.js
// Script to sync Stripe prices with your payment configuration

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function listProducts() {
  try {
    console.log('🔍 Fetching products from Stripe...');
    const products = await stripe.products.list({
      active: true,
      limit: 10
    });
    
    console.log('\n📦 Current Stripe Products:');
    for (const product of products.data) {
      console.log(`  - ${product.name} (ID: ${product.id})`);
    }
    return products.data;
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    return [];
  }
}

async function listPrices() {
  try {
    console.log('\n💰 Fetching prices from Stripe...');
    const prices = await stripe.prices.list({
      active: true,
      limit: 20
    });
    
    console.log('\n💵 Current Stripe Prices:');
    for (const price of prices.data) {
      const product = await stripe.products.retrieve(price.product);
      console.log(`  - ${product.name}: ${price.unit_amount / 100} ${price.currency.toUpperCase()} (ID: ${price.id})`);
    }
    return prices.data;
  } catch (error) {
    console.error('❌ Error fetching prices:', error.message);
    return [];
  }
}

async function createUSDPrices() {
  try {
    console.log('\n🛠️ Creating USD prices for existing products...');
    
    const products = await stripe.products.list({ active: true });
    const plans = {
      'AI Blog Platform - Starter': { price: 900, name: 'starter' }, // $9.00
      'AI Blog Platform - Pro': { price: 1900, name: 'pro' },       // $19.00
      'AI Blog Platform - Business': { price: 3900, name: 'business' } // $39.00
    };
    
    const priceIds = {};
    
    for (const product of products.data) {
      const planConfig = plans[product.name];
      if (planConfig) {
        console.log(`\n📋 Creating USD price for ${product.name}...`);
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: planConfig.price,
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          nickname: `${product.name} - USD Monthly`
        });
        
        priceIds[`STRIPE_${planConfig.name.toUpperCase()}_PRICE_ID`] = price.id;
        console.log(`✅ Created: ${price.id} (${planConfig.price / 100} USD)`);
      }
    }
    
    console.log('\n📝 Environment Variables to update:');
    console.log('Add these to your .env.local file:');
    for (const [key, value] of Object.entries(priceIds)) {
      console.log(`${key}=${value}`);
    }
    
    return priceIds;
  } catch (error) {
    console.error('❌ Error creating USD prices:', error.message);
    return {};
  }
}

async function main() {
  console.log('🚀 Stripe Price Sync Utility');
  console.log('============================\n');
  
  // Check if Stripe key is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
  }
  
  await listProducts();
  await listPrices();
  
  console.log('\n❓ Do you want to create USD prices for your products?');
  console.log('   Run: node scripts/sync-stripe-prices.js --create-usd');
  
  if (process.argv.includes('--create-usd')) {
    await createUSDPrices();
  }
}

if (require.main === module) {
  main();
}

module.exports = { listProducts, listPrices, createUSDPrices };