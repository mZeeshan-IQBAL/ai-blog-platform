// app/dashboard/layout.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  // ✅ Protect route 
  // If you only want admins -> check role
  // if (!session || session.user.role !== "ADMIN") redirect("/");

  // If you want just authenticated users:
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {children}
    </div>
  );
}