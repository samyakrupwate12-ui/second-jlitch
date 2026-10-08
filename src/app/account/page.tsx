'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { User, Heart, ShoppingBag } from 'lucide-react';
import SkyBackground from '@/components/ui/SkyBackground';
import { useShop } from '@/context/ShopContext';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'reset';
const field = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-sky-500';
const button = 'w-full rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50';

export default function AccountPage() {
  const { user, authReady, recovery, finishRecovery, busy: shopBusy } = useShop();
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const email = String(values.get('email') || '').trim();
    const password = String(values.get('password') || '');
    const name = String(values.get('name') || '').trim();
    setBusy(true); setMessage(''); setError('');
    try {
      if (recovery) {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        finishRecovery(); setMessage('Your password has been updated.');
      } else if (user) {
        const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
        if (error) throw error;
        setMessage('Your profile has been saved.');
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Welcome back.');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/account` } });
        if (error) throw error;
        setMessage(data.session ? 'Your account is ready.' : 'Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/account?reset=1` });
        if (error) throw error;
        setMessage('If an account exists for this email, you’ll receive a password reset link.');
      }
      form.reset();
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true); setError(''); setMessage('');
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
    } catch (err) { setError(err instanceof Error ? err.message : 'Couldn’t sign out. Please try again.'); }
    finally { setBusy(false); }
  }

  return <div className="flex-grow pb-12">
    <div className="relative pt-10 pb-16 px-4 sky-hero-gradient border-b border-sky-100 overflow-hidden">
      <SkyBackground />
      <div className="relative z-10 max-w-xl mx-auto flex items-center gap-5">
        <div className="rounded-full bg-white p-5 text-sky-500 shadow-sm"><User size={34} /></div>
        <div><h1 className="font-serif text-3xl text-slate-900">{user ? `Hello, ${user.user_metadata.full_name || 'there'}` : 'Your Account'}</h1><p className="mt-2 text-sm text-slate-600">A second life. A new story.</p></div>
      </div>
    </div>
    <div className="relative z-10 max-w-xl mx-auto -mt-7 px-4 space-y-4">
      <section className="rounded-3xl bg-white p-6 sm:p-8 border border-sky-100 shadow-sm">
        {!authReady ? <p role="status">Loading your account…</p> : <>
          <h2 className="font-serif text-2xl mb-5">{recovery ? 'Choose a new password' : user ? 'Personal information' : mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'}</h2>
          {message && <p role="status" className="mb-4 rounded-xl bg-sky-50 p-3 text-sm text-sky-900">{message}</p>}
          {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
          <form key={`${user?.id || 'guest'}-${mode}-${recovery}`} onSubmit={submit} className="space-y-4">
            {!recovery && (user || mode === 'signup') && <label className="block text-sm">Name<input name="name" autoComplete="name" required maxLength={80} defaultValue={user?.user_metadata.full_name || ''} className={`${field} mt-1`} /></label>}
            {!recovery && <label className="block text-sm">Email<input name="email" type="email" autoComplete="email" required readOnly={!!user} defaultValue={user?.email || ''} className={`${field} mt-1`} /></label>}
            {(recovery || (!user && mode !== 'reset')) && <label className="block text-sm">Password<input name="password" type="password" autoComplete={mode === 'login' && !recovery ? 'current-password' : 'new-password'} minLength={mode === 'login' && !recovery ? undefined : 8} required className={`${field} mt-1`} />{(mode === 'signup' || recovery) && <span className="text-xs text-slate-500">Use at least 8 characters.</span>}</label>}
            <button disabled={busy || shopBusy} className={button}>{busy ? 'Please wait…' : recovery ? 'Update password' : user ? 'Save profile' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}</button>
          </form>
          {!user && !recovery && <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm text-sky-800">
            <button disabled={busy} onClick={() => {setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); setMessage('');}}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</button>
            <button disabled={busy} onClick={() => {setMode(mode === 'reset' ? 'login' : 'reset'); setError(''); setMessage('');}}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button>
          </div>}
          {user && !recovery && <button disabled={busy || shopBusy} onClick={() => void signOut()} className="mt-5 text-sm text-rose-600">Sign out</button>}
        </>}
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/wishlist" className="bg-white border border-sky-100 rounded-2xl p-5 flex gap-3 items-center"><Heart size={20} className="text-sky-600" />Wishlist</Link>
        <Link href="/cart" className="bg-white border border-sky-100 rounded-2xl p-5 flex gap-3 items-center"><ShoppingBag size={20} className="text-sky-600" />Your bag</Link>
      </div>
      {!user && <p className="text-xs text-center text-slate-500">You can save favourites and build your bag as a guest. Sign in to keep them with your account.</p>}
    </div>
  </div>;
}
