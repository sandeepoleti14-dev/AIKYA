import { createContext } from 'react';
import type { CommunityUser } from '@/services/communityApi';

export interface CommunityAuthContextValue {
  user: CommunityUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateAccount: (user: CommunityUser) => void;
}

export const CommunityAuthContext = createContext<CommunityAuthContextValue | null>(null);
