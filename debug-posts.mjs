// Debug script to check posts in database
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectToDB } from './src/lib/db.js';
import Post from './src/models/Post.js';

async function debugPosts() {
  try {
    await connectToDB();
    console.log('✅ Connected to database');
    
    // Check total posts
    const totalPosts = await Post.countDocuments();
    console.log(`📊 Total posts in database: ${totalPosts}`);
    
    // Check published posts
    const publishedPosts = await Post.countDocuments({ published: true });
    console.log(`📝 Published posts: ${publishedPosts}`);
    
    // Check posts with scheduling
    const scheduledPosts = await Post.countDocuments({ 
      published: true,
      scheduledAt: { $exists: true, $ne: null }
    });
    console.log(`⏰ Posts with scheduling: ${scheduledPosts}`);
    
    // Check posts that should be visible now
    const visiblePosts = await Post.countDocuments({
      published: true,
      $or: [
        { scheduledAt: null },
        { scheduledAt: { $lte: new Date() } }
      ]
    });
    console.log(`👁️ Posts visible now: ${visiblePosts}`);
    
    // Get sample posts
    const samplePosts = await Post.find({
      published: true,
      $or: [
        { scheduledAt: null },
        { scheduledAt: { $lte: new Date() } }
      ]
    })
    .select('title published scheduledAt createdAt authorName')
    .limit(5)
    .lean();
    
    console.log('\n📋 Sample visible posts:');
    samplePosts.forEach((post, index) => {
      console.log(`${index + 1}. "${post.title}" by ${post.authorName || 'Unknown'}`);
      console.log(`   Published: ${post.published}, Created: ${post.createdAt}`);
      console.log(`   Scheduled: ${post.scheduledAt || 'No scheduling'}`);
    });
    
    if (samplePosts.length === 0) {
      console.log('\n❌ No posts found that match the ForYou criteria!');
      
      // Let's check what posts exist
      const allPosts = await Post.find()
        .select('title published scheduledAt createdAt authorName')
        .limit(5)
        .lean();
        
      console.log('\n🔍 All posts (sample):');
      allPosts.forEach((post, index) => {
        console.log(`${index + 1}. "${post.title}" by ${post.authorName || 'Unknown'}`);
        console.log(`   Published: ${post.published}, Created: ${post.createdAt}`);
        console.log(`   Scheduled: ${post.scheduledAt || 'No scheduling'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugPosts();