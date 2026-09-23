import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

/**
 * Admin session handling. Uses the existing Supabase architecture when it is
 * configured; otherwise the app runs in demo mode so the portal stays usable
 * without credentials.
 */

export type AdminSessionState = {
  ready: boolean;
  authenticated: boolean;
  demo: boolean;
  email: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

export function useAdminSession(): AdminSessionState {
  const demo = !isSupabaseConfigured;
  const [ready, setReady] = useState(demo);
  const [authenticated, setAuthenticated] = useState(demo);
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!mounted) return;
        if (sessionError) setError('We could not restore your session. Please sign in again.');
        setAuthenticated(Boolean(data.session));
        setEmail(data.session?.user?.email ?? null);
        setReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setError('We could not reach the sign-in service. Please try again.');
        setReady(true);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') setError(null);
      setAuthenticated(Boolean(session));
      setEmail(session?.user?.email ?? null);
      setReady(true);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (nextEmail: string, nextPassword: string) => {
    if (!supabase) return true;
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: nextEmail, password: nextPassword });
    if (signInError) {
      setError(signInError.message.toLowerCase().includes('invalid') ? 'That email or password was not accepted.' : signInError.message);
      return false;
    }
    return true;
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    if (!supabase) {
      setAuthenticated(false);
      return;
    }
    await supabase.auth.signOut();
    setAuthenticated(false);
    setEmail(null);
  }, []);

  return useMemo(
    () => ({ ready, authenticated, demo, email, error, signIn, signOut }),
    [ready, authenticated, demo, email, error, signIn, signOut],
  );
}
