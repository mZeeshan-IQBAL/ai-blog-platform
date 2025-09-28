'use client';
export const dynamic = "force-dynamic";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectUrl = searchParams.get('redirect');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn("credentials", {
      name,
      email,
      password,
      callbackUrl: redirectUrl || "/dashboard",
      redirect: false,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      if (redirectUrl && redirectUrl.includes('/pricing/')) {
        const planSlug = redirectUrl.split('/').pop();
        router.push(`/billing?plan=${planSlug}`);
      } else {
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Auth", href: "/auth/signup" }, { label: "Sign Up" }]} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Join Our Writing Community</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 characters)"
            className="w-full p-3 border rounded"
            required
          />
          <div className="text-xs text-gray-500">By joining, you agree to our terms and become part of our storytelling community.</div>
          <button disabled={loading} className="bg-blue-600 text-white w-full py-3 rounded">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 space-y-2">
          <button onClick={() => signIn("google")} className="w-full border p-3 rounded">
            Continue with Google
          </button>
          <button onClick={() => signIn("github")} className="w-full border p-3 rounded">
            Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}