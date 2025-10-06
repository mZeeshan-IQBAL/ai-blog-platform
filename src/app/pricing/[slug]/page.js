// src/app/pricing/[slug]/page.js
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PlanPage({ params }) {
  const { slug } = await params;

  // Validate plan slug
  const validPlans = ["free", "starter", "pro", "business", "enterprise"];
  if (!validPlans.includes(slug)) {
    redirect("/pricing"); // Redirect invalid slugs to pricing page
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/pricing/${slug}`);
  }

  // Handle special plans
  if (slug === "free") {
    // Free plan: go directly to dashboard
    redirect("/dashboard");
  }

  if (slug === "enterprise") {
    // Enterprise: go to contact page
    redirect("/contact");
  }

  // All other paid plans: go to billing
  redirect(`/billing?plan=${slug}`);
}