import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppContext, type AppContextValue, type AppState } from '@/store/AppContext';
import { DEFAULT_PREFERENCES, DEFAULT_PROFILE } from '@/data/dashboard';
import { ToastStack, type ToastItem } from '@/components/feedback/ToastStack';
import { fetchGreenhouseJobs } from '@/services/greenhouse';
import { fetchOpportunityFeeds, type OpportunitySourceStatus } from '@/services/opportunityFeeds';
import type { Listing, Preferences, Profile } from '@/types';

const STORAGE_KEY = 'aikya:state:v1';

const INITIAL_STATE: AppState = {
  savedIds: [],
  progress: {},
  lastRoadmapId: 'full-stack-development',
  profile: DEFAULT_PROFILE,
  preferences: DEFAULT_PREFERENCES,
  submissions: [],
};

function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const profile = { ...DEFAULT_PROFILE, ...parsed.profile };
    const savedProfile = {
      ...profile,
      ...(profile.name === 'Aarav Mehta' && profile.email === 'you@example.com' ? DEFAULT_PROFILE : {}),
      ...(profile.email === 'you@example.com' ? { email: '' } : {}),
      ...(profile.interests.join('|') === 'Web development|Artificial intelligence|Hackathons' ? { interests: [] } : {}),
    };
    return {
      savedIds: Array.isArray(parsed.savedIds) ? parsed.savedIds : INITIAL_STATE.savedIds,
      progress: parsed.progress && typeof parsed.progress === 'object' ? parsed.progress : INITIAL_STATE.progress,
      lastRoadmapId: typeof parsed.lastRoadmapId === 'string' ? parsed.lastRoadmapId : INITIAL_STATE.lastRoadmapId,
      profile: savedProfile,
      preferences: {
        ...DEFAULT_PREFERENCES,
        ...parsed.preferences,
        notifications: { ...DEFAULT_PREFERENCES.notifications, ...parsed.preferences?.notifications },
      },
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : INITIAL_STATE.submissions,
    };
  } catch {
    return INITIAL_STATE;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [publicListings, setPublicListings] = useState<Listing[]>([]);
  const [publicListingsLoading, setPublicListingsLoading] = useState(true);
  const [publicListingsSources, setPublicListingsSources] = useState<OpportunitySourceStatus[]>([]);
  const [publicListingsError, setPublicListingsError] = useState<string | null>(null);
  const [greenhouseJobs, setGreenhouseJobs] = useState<Listing[]>([]);
  const [greenhouseJobsLoading, setGreenhouseJobsLoading] = useState(true);
  const [greenhouseJobsError, setGreenhouseJobsError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const isLight = state.preferences.theme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    document.documentElement.classList.toggle('dark', !isLight);
  }, [state.preferences.theme]);

  useEffect(() => {
    let active = true;
    fetchOpportunityFeeds()
      .then((result) => {
        if (!active) return;
        setPublicListings(result.listings);
        setPublicListingsSources(result.sources);
        const errors = result.sources.filter((source) => source.status === 'error').map((source) => `${source.name}: ${source.error}`);
        setPublicListingsError(errors.length > 0 ? errors.join(' ') : null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPublicListingsError(error instanceof Error ? error.message : 'Unable to load public opportunity feeds.');
      })
      .finally(() => {
        if (active) setPublicListingsLoading(false);
      });

    fetchGreenhouseJobs()
      .then((result) => {
        if (!active) return;
        setGreenhouseJobs(result.jobs);
        setGreenhouseJobsError(result.errors.length > 0 ? result.errors.join(' ') : null);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setGreenhouseJobsError(error instanceof Error ? error.message : 'Unable to load Greenhouse jobs.');
      })
      .finally(() => {
        if (active) setGreenhouseJobsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const notify = useCallback((message: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const isSaved = useCallback((id: string) => state.savedIds.includes(id), [state.savedIds]);

  const toggleSaved = useCallback(
    (id: string) => {
      const nowSaved = !state.savedIds.includes(id);
      setState((current) => ({
        ...current,
        savedIds: nowSaved ? [...current.savedIds, id] : current.savedIds.filter((savedId) => savedId !== id),
      }));
      return nowSaved;
    },
    [state.savedIds],
  );

  const setStepComplete = useCallback((roadmapId: string, stepId: string, complete: boolean) => {
    setState((current) => {
      const done = current.progress[roadmapId] ?? [];
      const next = complete
        ? Array.from(new Set([...done, stepId]))
        : done.filter((id) => id !== stepId);
      return { ...current, progress: { ...current.progress, [roadmapId]: next } };
    });
  }, []);

  const setLastRoadmap = useCallback((id: string) => {
    setState((current) => (current.lastRoadmapId === id ? current : { ...current, lastRoadmapId: id }));
  }, []);

  const updateProfile = useCallback((profile: Profile) => {
    setState((current) => ({ ...current, profile }));
  }, []);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setState((current) => ({ ...current, preferences: { ...current.preferences, ...patch } }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      greenhouseJobs,
      greenhouseJobsLoading,
      greenhouseJobsError,
      publicListings,
      publicListingsLoading,
      publicListingsSources,
      publicListingsError,
      isSaved,
      toggleSaved,
      setStepComplete,
      setLastRoadmap,
      updateProfile,
      updatePreferences,
      notify,
    }),
    [
      state,
      publicListings,
      publicListingsLoading,
      publicListingsSources,
      publicListingsError,
      greenhouseJobs,
      greenhouseJobsLoading,
      greenhouseJobsError,
      isSaved,
      toggleSaved,
      setStepComplete,
      setLastRoadmap,
      updateProfile,
      updatePreferences,
      notify,
    ],
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </AppContext.Provider>
  );
}
