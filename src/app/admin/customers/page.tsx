'use client';

import React from 'react';
import { Users, Clock } from 'lucide-react';

export default function AdminCustomersPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-sky-100 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
          <Users className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider font-sans">
          <Clock className="w-3.5 h-3.5" />
          <span>Planned for Future Phase</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-900">Customer Management</h1>
        <p className="text-sm text-slate-500 font-sans max-w-md mx-auto leading-relaxed">
          Customer profiles, order histories, saved addresses, and loyalty metrics will be enabled in the customer account management phase.
        </p>
      </div>
    </div>
  );
}
