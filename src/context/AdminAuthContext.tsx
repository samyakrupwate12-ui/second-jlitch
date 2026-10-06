'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAdminAuthorization: (userId: string) => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Helper to verify if user ID is in public.admin_users
  const checkAdminAuthorization = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.warn('User ID not found in admin_users:', userId, error?.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error checking admin_users table:', err);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          const authorized = await checkAdminAuthorization(initialSession.user.id);
          if (isMounted) {
            setSession(initialSession);
            setUser(initialSession.user);
            setIsAdmin(authorized);

            if (!authorized) {
              // Sign out non-admin users attempting to hold admin session
              await supabase.auth.signOut();
              setUser(null);
              setSession(null);
              setIsAdmin(false);
            }
          }
        } else if (isMounted) {
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error initializing admin auth:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (currentSession?.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        const authorized = await checkAdminAuthorization(currentSession.user.id);
        setIsAdmin(authorized);

        if (!authorized && event === 'SIGNED_IN') {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error || !data.user) {
        setLoading(false);
        return {
          success: false,
          error: error?.message || 'Invalid login credentials.',
        };
      }

      // Verify that the user ID exists in public.admin_users
      const authorized = await checkAdminAuthorization(data.user.id);

      if (!authorized) {
        // Revoke session for non-admin
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setLoading(false);
        return {
          success: false,
          error: 'Access denied. Account is not registered in public.admin_users.',
        };
      }

      setUser(data.user);
      setSession(data.session);
      setIsAdmin(true);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred during login.',
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setLoading(false);
    router.push('/admin/login');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        login,
        logout,
        checkAdminAuthorization,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
