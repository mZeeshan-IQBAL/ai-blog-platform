import { connectToDB } from "./db";
import Post from "@/models/Post";

export async function incrementViews(postId) {
  try {
    await connectToDB();
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
  } catch (e) {
    console.error("Failed to increment views:", e);
  }
}