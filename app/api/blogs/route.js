import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  await connectToDB();
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, image } = await req.json();
  if (!title || !content)
    return Response.json({ error: "Missing fields" }, { status: 400 });

  const newPost = new Post({
    title,
    content,
    coverImage: image || "",
    author: session.user.id,
    published: true,
  });

  await newPost.save();
  return Response.json(newPost, { status: 201 });
}