// scripts/debug-current-subscription.js
// Debug script to check and fix current subscription status

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import your User model
const User = require('../src/models/User.js').default;

async function debugCurrentSubscription() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Find user by email (replace with your actual email)
    const userEmail = 'zeshansos510@gmail.com'; // Your actual email from database
    console.log(`\n🔍 Looking for user: ${userEmail}`);
    
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('❌ User not found. Try with different email or check database.');
      
      // Show all users in database for debugging
      const allUsers = await User.find({}).select('email subscription.plan subscription.status').limit(5);
      console.log('\n📋 Available users in database:');
      allUsers.forEach(u => {
        console.log(`   Email: ${u.email}, Plan: ${u.subscription?.plan || 'none'}, Status: ${u.subscription?.status || 'none'}`);
      });
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    
    console.log('\n📋 Current Subscription Data:');
    console.log('=====================================');
    console.log(JSON.stringify(user.subscription, null, 2));

    // Check what the API endpoint would return
    console.log('\n🧪 Simulating API Response:');
    console.log('==============================');
    
    const sub = user.subscription || {};
    const now = new Date();
    let effectiveStatus = sub.status || 'inactive';
    
    if (sub.expiresAt) {
      const expirationDate = new Date(sub.expiresAt);
      
      if (expirationDate < now) {
        effectiveStatus = 'expired';
      } else if (sub.status === 'cancelled' && !sub.cancelledAt) {
        effectiveStatus = 'active';
      } else if (sub.status === 'cancelled' && sub.cancelledAt) {
        effectiveStatus = 'cancelled_active';
      }
    }
    
    // Apply the fix
    if (sub.status === 'active' && sub.stripeSubscriptionId) {
      effectiveStatus = 'active';
    }
    
    console.log(`Effective Status: ${effectiveStatus}`);
    console.log(`Plan: ${sub.plan}`);
    console.log(`Is Premium: ${sub.plan !== 'free' && effectiveStatus === 'active'}`);
    console.log(`Is Cancelled: ${effectiveStatus === 'cancelled_active'}`);

    // If subscription needs fixing, apply the fix
    if (effectiveStatus === 'cancelled_active' && sub.stripeSubscriptionId && sub.plan !== 'free') {
      console.log('\n🔧 APPLYING FIX...');
      console.log('===================');
      
      user.subscription.status = 'active';
      user.subscription.cancelledAt = null;
      user.subscription.updatedAt = new Date();
      
      await user.save();
      console.log('✅ Fixed subscription status in database');
      console.log(`   New Status: ${user.subscription.status}`);
      console.log(`   Cancelled At: ${user.subscription.cancelledAt}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the debug
if (require.main === module) {
  debugCurrentSubscription();
}

module.exports = { debugCurrentSubscription };