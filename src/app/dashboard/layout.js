// app/dashboard/layout.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { connectToDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  // Connect to DB first
  try {
    await connectToDB();
  } catch (err) {
    console.error("DB connection failed:", err);
    redirect("/auth/signin");
  }

  // Get session
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.error("Session fetch error:", err);
    redirect("/auth/signin");
  }

  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {children}
    </div>
  );
}
