'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Logo from '@/components/ui/Logo';
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        router.push('/admin/products');
      } else {
        setError(res.error || 'Authentication failed. Please check your admin credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-sky-100 shadow-2xl">
        {/* Branding Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase tracking-wider border border-sky-100 font-sans">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </div>
          <p className="text-xs text-slate-500 font-sans">
            Sign in with authorized administrator credentials
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 animate-in fade-in duration-200 font-sans">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Error</p>
              <p className="text-rose-700 mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
              Admin Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@secondjlitch.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 font-sans">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-xs uppercase tracking-widest transition-all duration-200 shadow-lg shadow-slate-900/20 hover:shadow-sky-600/30 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            href="/products"
            className="text-xs text-slate-500 hover:text-sky-600 transition-colors font-sans"
          >
            ← Back to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
}
