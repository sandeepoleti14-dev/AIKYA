import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { CommunityAuthContext } from '@/store/CommunityAuthContext';
import { communityRequest, type CommunityUser } from '@/services/communityApi';
import { useApp } from '@/hooks/useApp';

export function CommunityAuthProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useApp();
  const [user, setUser] = useState<CommunityUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncProfile = useCallback((account: CommunityUser | null) => {
    if (!account) return;
    if (
      profile.name === account.displayName &&
      profile.email === (account.email ?? profile.email) &&
      profile.interests.join('|') === account.domains.join('|')
    ) return;
    updateProfile({
      ...profile,
      name: account.displayName,
      email: account.email ?? profile.email,
      interests: account.domains,
    });
  }, [profile, updateProfile]);

  const refresh = useCallback(async () => {
    try {
      const result = await communityRequest<{ user: CommunityUser | null }>('/auth/me');
      setUser(result.user);
      syncProfile(result.user);
      setError(null);
    } catch (requestError) {
      setUser(null);
      setError(requestError instanceof Error ? requestError.message : 'Unable to load your Aikya account.');
    } finally {
      setLoading(false);
    }
  }, [syncProfile]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await communityRequest<{ user: CommunityUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(result.user);
    syncProfile(result.user);
    setError(null);
  }, [syncProfile]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const result = await communityRequest<{ user: CommunityUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setUser(result.user);
    syncProfile(result.user);
    setError(null);
  }, [syncProfile]);

  const signOut = useCallback(async () => {
    await communityRequest<void>('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const updateAccount = useCallback((nextUser: CommunityUser) => {
    setUser(nextUser);
    syncProfile(nextUser);
  }, [syncProfile]);
  const value = useMemo(
    () => ({ user, loading, error, signIn, signUp, signOut, refresh, updateAccount }),
    [user, loading, error, signIn, signUp, signOut, refresh, updateAccount],
  );

  return <CommunityAuthContext.Provider value={value}>{children}</CommunityAuthContext.Provider>;
}
