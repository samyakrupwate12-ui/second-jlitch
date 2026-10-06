'use client';

import { useAdminAuth } from '@/context/AdminAuthContext';
import { Menu, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  title?: string;
}

export default function AdminHeader({ onOpenSidebar, title }: AdminHeaderProps) {
  const { user, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-sky-100/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-lg font-serif font-semibold text-slate-900 tracking-tight">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Admin User Info Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-100 text-xs font-sans">
          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
          <span className="font-medium max-w-[180px] truncate">
            {user?.email || 'Authorized Admin'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-medium hover:bg-rose-600 transition-colors shadow-xs group"
          title="Sign out of Admin Portal"
        >
          <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
