'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

function ProtectedAdminContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Do not wrap login page in admin shell or protection checks
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Loading spinner during session verification
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-lg animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <p className="font-serif text-lg text-slate-200">Verifying Admin Privileges...</p>
          <p className="text-xs text-slate-400 font-sans max-w-xs">
            Connecting securely with Second JLITCH Supabase Authentication.
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized guard
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            You must be logged in with an authorized administrator account listed in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">public.admin_users</code> to view this portal.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-semibold text-xs uppercase tracking-widest transition-colors shadow-md"
            >
              Go to Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Shell
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <AdminHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ProtectedAdminContent>{children}</ProtectedAdminContent>
    </AdminAuthProvider>
  );
}
