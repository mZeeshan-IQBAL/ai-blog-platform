// app/api/analytics/route.js
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Comment from "@/models/Comment";

export async function GET() {
  try {
    await connectToDB();
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();

    const mostViewed = await Post.find().sort({ views: -1 }).limit(5).lean();
    const mostLiked = await Post.find().sort({ likes: -1 }).limit(5).lean();

    return Response.json({ totalPosts, totalUsers, totalComments, mostViewed, mostLiked });
  } catch (e) {
    return Response.json({ error: "Analytics failed" }, { status: 500 });
  }
}