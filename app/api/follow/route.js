import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json([], { status: 200 });
  await connectToDB();
  const user = await User.findById(session.user.id).select("follows");
  return Response.json((user?.follows || []).map(String));
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDB();
  const { userId } = await request.json();
  if (userId === session.user.id) return Response.json({ error: "Cannot follow yourself" }, { status: 400 });
  await User.findByIdAndUpdate(session.user.id, { $addToSet: { follows: userId } });
  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await connectToDB();
  const { userId } = await request.json();
  await User.findByIdAndUpdate(session.user.id, { $pull: { follows: userId } });
  return Response.json({ ok: true });
}