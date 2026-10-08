'use client';
import { supabase } from '@/lib/supabase';

export async function checkoutFetch(path: string, body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in again to continue.');
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET', cache: 'no-store',
    headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    ...(body ? {body:JSON.stringify(body)} : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Checkout is temporarily unavailable. Please try again.');
  return result;
}

export async function checkoutRequestId(userId: string, value: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)), b=>b.toString(16).padStart(2,'0')).join('');
  const key = `second-jlitch:checkout:${userId}`;
  try {
    const previous = JSON.parse(sessionStorage.getItem(key) || 'null');
    if (previous?.hash === hash && typeof previous.requestId === 'string') return previous.requestId as string;
  } catch { /* A damaged browser record is not a saved checkout. */ }
  const requestId = crypto.randomUUID();
  sessionStorage.setItem(key,JSON.stringify({hash,requestId}));
  return requestId;
}
