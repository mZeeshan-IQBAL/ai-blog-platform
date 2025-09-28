// app/api/posts/[id]/versions/route.js
export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import PostVersion from "@/models/PostVersion";

export async function GET(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDB();
  const { id } = await params;
  const versions = await PostVersion.find({ postId: id }).sort({ version: -1 }).lean();
  return Response.json(versions);
}