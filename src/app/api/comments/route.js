// src/app/api/comments/route.js
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import User from "@/models/User";
import { pusherServer } from "@/lib/pusherServer";
import { sendEmail } from "@/lib/resend";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    if (!postId) return Response.json({ error: "postId required" }, { status: 400 });

    await connectToDB();
    const comments = await Comment.find({ post: postId, status: "approved" })
      .populate("author", "name image providerId")
      .sort({ createdAt: -1 });

    return Response.json(comments);
  } catch (e) {
    return Response.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();
    const { postId, content } = await request.json();
    const providerId = session.user.providerId;
    const post = await Post.findById(postId);
    if (!post) return Response.json({ error: "Post not found" }, { status: 404 });

    const user = await User.findOne({ providerId });
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const comment = new Comment({ content, author: user._id, post: postId });
    await comment.save();
    post.comments.push(comment._id);
    await post.save();

    // Live update
    pusherServer.trigger(`post-${postId}`, "comment-update", {
      comment: {
        id: comment._id,
        content: comment.content,
        author: { id: providerId, name: session.user.name, image: session.user.image },
      },
    });

    // Notify post author - ✅ Use consistent private-user channel
    const postAuthor = await User.findById(post.author);
    if (postAuthor?.providerId && postAuthor.providerId !== providerId) {
      await pusherServer.trigger(`private-user-${postAuthor.providerId}`, "notification", {
        type: "comment",
        message: "commented on your post",
        fromUser: { id: providerId, name: session.user.name, image: session.user.image },
        postId,
        createdAt: new Date().toISOString(),
      });

      if (postAuthor.email) {
        await sendEmail({
          to: postAuthor.email,
          subject: "New comment on your post",
          html: `<p><b>${session.user.name}</b> commented: "${comment.content}"</p>`,
        });
      }
    }

    return Response.json({ ok: true, commentId: comment._id });
  } catch (e) {
    console.error("Comment POST error:", e);
    return Response.json({ error: "Failed to create comment" }, { status: 500 });
  }
}