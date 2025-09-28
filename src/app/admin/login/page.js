// src/app/admin/login/page.js
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl: '/admin',
      redirect: false,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // /admin will hard-redirect non-admins back to home
      window.location.href = '/admin';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Admin Login</h1>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full p-3 border rounded" type="email" placeholder="Admin email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <input className="w-full p-3 border rounded" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 rounded disabled:opacity-50">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p className="text-xs text-gray-500 mt-3">Note: You must have ADMIN role to access the dashboard.</p>
      </div>
    </div>
  );
}
