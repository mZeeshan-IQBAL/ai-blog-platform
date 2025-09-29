// app/profile/[id]/page.js
import { notFound } from "next/navigation";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import PublicProfileClient from "@/components/profile/PublicProfileClient";

function isObjectIdLike(val) {
  return /^[a-f\d]{24}$/i.test(String(val));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  await connectToDB();
  let user;
  if (isObjectIdLike(id)) {
    user = await User.findById(id).lean();
  } else {
    user = await User.findOne({ providerId: id }).lean();
  }
  if (!user) return { title: "User Not Found" };
  return {
    title: `${user.name} | AI Knowledge Hub`,
    description: `View ${user.name}'s profile and posts on AI Knowledge Hub`,
  };
}

const toPlain = (obj) => JSON.parse(JSON.stringify(obj));

export default async function PublicProfilePage({ params }) {
  const { id } = await params;
  if (!id) notFound();

  await connectToDB();

  let userDoc;
  if (isObjectIdLike(id)) {
    userDoc = await User.findById(id).lean();
  } else {
    userDoc = await User.findOne({ providerId: id }).lean();
  }
  if (!userDoc) notFound();

  // IMPORTANT: Select minimal fields (do NOT include content)
  const authorId = String(userDoc._id);
  const postDocs = await Post.find(
    { authorId, published: true },
    "slug title summary coverImage category tags authorId authorName authorImage likes comments views createdAt"
  )
    .sort({ createdAt: -1 })
    .lean();

  const user = {
    id: authorId,
    name: userDoc.name || "Anonymous",
    email: userDoc.email || "",
    image: userDoc.image || "",
    bio: userDoc.bio || "",
    website: userDoc.website || "",
    location: userDoc.location || "",
    verified: !!userDoc.verified,
    createdAt: userDoc.createdAt ? new Date(userDoc.createdAt).toISOString() : null,
  };

  const posts = postDocs.map((p) => ({
    id: p._id?.toString(),
    _id: p._id?.toString(),
    slug: p.slug || "",
    title: p.title || "",
    // Use summary/excerpt only, no content
    content: "",
    summary: p.summary || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    category: p.category || "General",
    authorId: p.authorId,
    authorName: p.authorName || "Anonymous",
    authorImage: p.authorImage || "",
    coverImage: p.coverImage || "",
    likes: Array.isArray(p.likes) ? p.likes.map(String) : [],
    comments: Array.isArray(p.comments) ? p.comments.map((c) => c.toString()) : [],
    views: p.views || 0,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
  }));

  const stats = {
    posts: posts.length,
    followers: await User.countDocuments({ follows: userDoc._id }),
    following: Array.isArray(userDoc.follows) ? userDoc.follows.length : 0,
    totalLikes: postDocs.reduce((sum, p) => sum + (Array.isArray(p.likes) ? p.likes.length : 0), 0),
    totalViews: postDocs.reduce((sum, p) => sum + (p.views || 0), 0),
  };

  return (
    <PublicProfileClient
      user={toPlain(user)}
      stats={toPlain(stats)}
      initialPosts={toPlain(posts)}
    />
  );
}