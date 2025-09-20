// app/auth/signin/page.js
'use client';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === "authenticated") router.push("/dashboard");
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    if (result?.error) setError(result.error);
    setLoading(false);
  };

  if (status === "loading") return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Auth", href: "/auth/signin" }, { label: "Sign In" }]} />
        </div>
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="Email" className="w-full p-3 border rounded"
          />
          <input
            type="password" value={password} onChange={e=>setPassword(e.target.value)}
            placeholder="Password" className="w-full p-3 border rounded"
          />
          <button disabled={loading} className="bg-blue-600 text-white w-full py-3 rounded">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-6 space-y-2">
          <button onClick={() => signIn("google")} className="w-full border p-3 rounded">Continue with Google</button>
          <button onClick={() => signIn("github")} className="w-full border p-3 rounded">Continue with GitHub</button>
        </div>
      </div>
    </div>
  );
}