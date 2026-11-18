import { createContext } from 'react';
import type { OpportunitySourceStatus } from '@/services/opportunityFeeds';
import type { EventSubmission, Listing, Preferences, Profile } from '@/types';

export interface AppState {
  savedIds: string[];
  progress: Record<string, string[]>;
  lastRoadmapId: string;
  profile: Profile;
  preferences: Preferences;
  submissions: EventSubmission[];
}

export interface AppContextValue extends AppState {
  publicListings: Listing[];
  publicListingsLoading: boolean;
  publicListingsSources: OpportunitySourceStatus[];
  publicListingsError: string | null;
  greenhouseJobs: Listing[];
  greenhouseJobsLoading: boolean;
  greenhouseJobsError: string | null;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => boolean;
  setStepComplete: (roadmapId: string, stepId: string, complete: boolean) => void;
  setLastRoadmap: (id: string) => void;
  updateProfile: (profile: Profile) => void;
  updatePreferences: (patch: Partial<Preferences>) => void;
  notify: (message: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
