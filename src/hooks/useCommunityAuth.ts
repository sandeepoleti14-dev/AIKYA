import { useContext } from 'react';
import { CommunityAuthContext } from '@/store/CommunityAuthContext';

export function useCommunityAuth() {
  const context = useContext(CommunityAuthContext);
  if (!context) throw new Error('useCommunityAuth must be used within CommunityAuthProvider');
  return context;
}
