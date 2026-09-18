import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * AuthProvider 컴포넌트
 *
 * Props:
 * @param {node} children - 하위 트리 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      setIsProfileLoading(false);
      return;
    }

    setIsProfileLoading(true);

    supabase
      .from('cu_profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          setProfile(data);
          setIsProfileLoading(false);
          return;
        }

        const pendingRaw = window.localStorage.getItem('chuus_pending_profile');
        if (!pendingRaw) {
          setProfile(null);
          setIsProfileLoading(false);
          return;
        }

        const pending = JSON.parse(pendingRaw);
        const { data: created } = await supabase
          .from('cu_profiles')
          .insert({ id: session.user.id, ...pending })
          .select()
          .single();

        window.localStorage.removeItem('chuus_pending_profile');
        setProfile(created ?? null);
        setIsProfileLoading(false);
      });
  }, [session?.user?.id]);

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isProfileLoading,
    refreshProfile: async () => {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('cu_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      setProfile(data);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}
