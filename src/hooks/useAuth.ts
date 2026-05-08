import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { AuthFormValues } from "../lib/validation";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }: AuthFormValues) => {
    if (!supabase) return { error: new Error("Supabase is not configured") };
    setError(null);
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setError(result.error.message);
    return result;
  }, []);

  const signUp = useCallback(async ({ displayName, email, password }: AuthFormValues) => {
    if (!supabase) return { error: new Error("Supabase is not configured") };
    setError(null);
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: displayName || email.split("@")[0] },
        emailRedirectTo: window.location.origin
      }
    });
    if (result.error) setError(result.error.message);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    await supabase?.auth.signOut();
    setSession(null);
  }, []);

  return {
    ready,
    session,
    user: session?.user ?? null,
    error,
    signIn,
    signUp,
    signOut
  };
}
