// src/app/auth/reset/[token]/page.js
'use client';
import { useState } from 'react';

export default function ResetPasswordPage({ params }) {
  const { token } = params;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Reset Password</h1>
        {done ? (
          <div>
            <p className="text-green-700 text-sm mb-4">Password updated successfully.</p>
            <a href="/auth/signin" className="text-blue-600 underline">Go to Sign In</a>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <input type="password" className="w-full p-3 border rounded" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required />
            <input type="password" className="w-full p-3 border rounded" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-50">
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
