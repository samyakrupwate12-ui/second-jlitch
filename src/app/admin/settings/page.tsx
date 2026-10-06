'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Settings, ShieldCheck, Database, Server, User } from 'lucide-react';

export default function AdminSettingsPage() {
  const { user } = useAdminAuth();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-serif font-bold text-slate-900">Admin Settings & Environment</h1>
        <p className="text-xs text-slate-500 font-sans mt-0.5">
          System configuration and administrator session verification
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-semibold font-sans text-slate-900">
            Authenticated Admin Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <span className="block text-slate-400 font-medium">Logged-In Admin Email:</span>
            <span className="font-semibold text-slate-900">{user?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium">Supabase Auth User ID:</span>
            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
              {user?.id || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-sky-600" />
          <h2 className="text-sm font-semibold font-sans text-slate-900">
            Database & Storage Infrastructure
          </h2>
        </div>

        <div className="space-y-3 text-xs font-sans text-slate-700">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Supabase Project URL</p>
              <p className="font-mono text-slate-500 text-[11px] mt-0.5">{supabaseUrl}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Storage Bucket</p>
              <p className="font-mono text-slate-500 text-[11px] mt-0.5">product-images (public)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-900">Authorization Table</p>
              <p className="font-mono text-slate-500 text-[11px] mt-0.5">public.admin_users</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
              Enforced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
