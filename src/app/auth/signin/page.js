'use client';
export const dynamic = "force-dynamic";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use Next.js useSearchParams instead of window.location.search
  const redirectUrl = searchParams.get('redirect');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn("credentials", {
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
          <Breadcrumbs items={[
            { label: "Home", href: "/" }, 
            { label: "Auth", href: "/auth/signin" }, 
            { label: "Sign In" }
          ]} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Sign In to Your Account</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        
        <form onSubmit={handleSignIn} className="space-y-4">
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
            placeholder="Password"
            className="w-full p-3 border rounded"
            required
          />
          <button 
            type="submit"
            disabled={loading} 
            className="bg-blue-600 text-white w-full py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <button 
            onClick={() => signIn("google")} 
            className="w-full border p-3 rounded hover:bg-gray-50 transition"
          >
            Continue with Google
          </button>
          <button 
            onClick={() => signIn("github")} 
            className="w-full border p-3 rounded hover:bg-gray-50 transition"
          >
            Continue with GitHub
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}