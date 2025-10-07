// scripts/fix-subscription-to-business.js
// Manual fix to update subscription to Business plan

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import your User model
const User = require('../src/models/User.js').default;

async function fixSubscriptionToBusiness() {
  try {
    console.log('🔧 Connecting to database to fix subscription...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    const userEmail = 'zeshansos510@gmail.com';
    console.log(`\n🔍 Finding user: ${userEmail}`);
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ Found user: ${user.name}`);
    console.log('\n📋 Current Subscription:');
    console.log(`   Plan: ${user.subscription.plan}`);
    console.log(`   Status: ${user.subscription.status}`);
    console.log(`   Cancelled At: ${user.subscription.cancelledAt}`);
    console.log(`   Expires At: ${user.subscription.expiresAt}`);

    console.log('\n🔧 Applying Business Plan Fix...');
    console.log('=====================================');

    // Update to Business plan with active status
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    user.subscription = {
      ...user.subscription,
      plan: 'business', // Change to business plan
      status: 'active', // Set to active
      cancelledAt: null, // Clear cancellation
      startDate: now,
      expiresAt: expiresAt,
      updatedAt: now,
      amount: 29, // Business plan price (adjust as needed)
      currency: 'USD',
      interval: 'month',
      gateway: 'stripe', // Assuming Stripe payment
      stripeSubscriptionId: 'sub_business_manual_' + Date.now(), // Mock subscription ID
    };

    // This will trigger the updatePlanLimits method
    await user.save();

    console.log('✅ Successfully updated subscription!');
    console.log('\n📋 New Subscription Details:');
    console.log(`   Plan: ${user.subscription.plan}`);
    console.log(`   Status: ${user.subscription.status}`);
    console.log(`   Cancelled At: ${user.subscription.cancelledAt}`);
    console.log(`   Expires At: ${user.subscription.expiresAt}`);
    console.log(`   Amount: $${user.subscription.amount}`);

    console.log('\n🎯 Business Plan Features Activated:');
    console.log(`   Storage: ${user.subscription.limits.storage / 1024}GB`);
    console.log(`   Posts: ${user.subscription.limits.posts === -1 ? 'Unlimited' : user.subscription.limits.posts}`);
    console.log(`   AI Calls: ${user.subscription.limits.aiCalls === -1 ? 'Unlimited' : user.subscription.limits.aiCalls}`);
    console.log(`   Max File Size: ${user.subscription.limits.maxFileSize === -1 ? 'Unlimited' : user.subscription.limits.maxFileSize + 'MB'}`);
    console.log(`   Team Members: ${user.subscription.limits.teamMembers}`);
    console.log(`   Custom Domains: ${user.subscription.limits.customDomains}`);
    console.log(`   Priority Support: ${user.subscription.limits.prioritySupport ? 'Yes' : 'No'}`);
    console.log(`   API Access: ${user.subscription.limits.apiAccess ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the fix
if (require.main === module) {
  fixSubscriptionToBusiness();
}

module.exports = { fixSubscriptionToBusiness };