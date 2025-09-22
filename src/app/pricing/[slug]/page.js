// src/app/pricing/[slug]/page.js
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function PlanPage({ params }) {
  const { slug } = params;

  // Extra safety: check the session on the server
  const session = await getServerSession(authOptions);

  if (!session) {
    // Should already be handled by middleware, but just in case:
    redirect(`/auth/signup?redirect=/pricing/${slug}`);
  }

  // User is authenticated → forward them to billing with ?plan
  redirect(`/billing?plan=${slug}`);
}