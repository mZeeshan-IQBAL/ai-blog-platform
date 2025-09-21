// app/profile/page.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileClient from "@/components/profile/ProfileClient";

export const metadata = {
  title: "Profile | AI Knowledge Hub",
  description: "Manage your profile and view your activity",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/api/auth/signin");
  }

  return <ProfileClient />;
}