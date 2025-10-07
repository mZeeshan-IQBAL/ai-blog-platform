// scripts/direct-fix-subscription.js
// Direct MongoDB update to fix subscription

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function directFixSubscription() {
  try {
    console.log('🔧 Connecting to database for direct fix...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    const userEmail = 'zeshansos510@gmail.com';
    console.log(`\n🔍 Direct update for user: ${userEmail}`);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Direct MongoDB update bypassing Mongoose middleware
    const result = await mongoose.connection.collection('users').updateOne(
      { email: userEmail },
      {
        $set: {
          'subscription.plan': 'business',
          'subscription.status': 'active',
          'subscription.cancelledAt': null,
          'subscription.startDate': now,
          'subscription.expiresAt': expiresAt,
          'subscription.updatedAt': now,
          'subscription.amount': 29,
          'subscription.currency': 'USD',
          'subscription.interval': 'month',
          'subscription.gateway': 'stripe',
          'subscription.stripeSubscriptionId': 'sub_business_manual_' + Date.now(),
          // Business plan limits
          'subscription.limits.storage': 51200, // 50GB
          'subscription.limits.posts': -1, // Unlimited
          'subscription.limits.aiCalls': -1, // Unlimited  
          'subscription.limits.aiTokens': -1, // Unlimited
          'subscription.limits.fileUploads': -1, // Unlimited
          'subscription.limits.maxFileSize': 500, // 500MB
          'subscription.limits.customDomains': 10,
          'subscription.limits.teamMembers': 20,
          'subscription.limits.analyticsRetention': -1, // Forever
          'subscription.limits.emailsPerMonth': 10000,
          'subscription.limits.scheduledPosts': -1, // Unlimited
          'subscription.limits.exportData': true,
          'subscription.limits.prioritySupport': true,
          'subscription.limits.customBranding': true,
          'subscription.limits.apiAccess': true,
          'subscription.limits.advancedAnalytics': true,
          // Business plan features
          'subscription.features.aiWritingAssistant': 'premium',
          'subscription.features.analytics': 'premium',
          'subscription.features.customization': 'premium',
          'subscription.features.collaboration': true,
          'subscription.features.whiteLabel': true,
          'subscription.features.sslSupport': true,
          'subscription.features.backups': 'daily'
        }
      }
    );

    if (result.modifiedCount === 1) {
      console.log('✅ Successfully updated subscription directly!');
      
      // Verify the update
      const updatedUser = await mongoose.connection.collection('users').findOne(
        { email: userEmail },
        { projection: { 'subscription.plan': 1, 'subscription.status': 1, 'subscription.cancelledAt': 1 } }
      );
      
      console.log('\n📋 Verification - Updated Subscription:');
      console.log(`   Plan: ${updatedUser.subscription.plan}`);
      console.log(`   Status: ${updatedUser.subscription.status}`);
      console.log(`   Cancelled At: ${updatedUser.subscription.cancelledAt}`);
      
      console.log('\n🎉 SUCCESS! Your subscription has been fixed.');
      console.log('🔄 Please refresh your dashboard to see the changes.');
      
    } else {
      console.log('❌ Failed to update subscription');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the direct fix
if (require.main === module) {
  directFixSubscription();
}

module.exports = { directFixSubscription };