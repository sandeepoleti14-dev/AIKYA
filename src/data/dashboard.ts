import type { Preferences, Profile } from '@/types';

export const DEFAULT_PROFILE: Profile = {
  name: '',
  email: '',
  education: '',
  location: '',
  interests: [],
  skills: [],
  learningGoals: '',
};

export const DEFAULT_PREFERENCES: Preferences = {
  theme: 'dark',
  notifications: { deadlines: true, newEvents: true, roadmapReminders: false },
  profileVisibility: 'private',
};
