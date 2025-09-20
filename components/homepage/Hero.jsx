// components/homepage/Hero.jsx
'use client';
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Hero() {
  const { status } = useSession();
  return (
    <section className="text-center py-20">
      <h1 className="text-5xl font-bold">
        Welcome to <span className="text-blue-600">AI Knowledge Hub</span>
      </h1>
      <p className="mt-4 text-lg text-gray-600">Share, discover, and innovate with AI-powered insights.</p>
      <div className="mt-6 flex justify-center gap-4">
        {status === "authenticated" ? (
          <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Go to Dashboard</Link>
        ) : (
          <>
            <Link href="/auth/signin" className="bg-blue-600 text-white px-6 py-3 rounded-lg">Get Started</Link>
            <Link href="/blog" className="border px-6 py-3 rounded-lg">Browse Blogs →</Link>
          </>
        )}
      </div>
    </section>
  );
}