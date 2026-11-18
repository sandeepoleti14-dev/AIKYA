export type Mode = 'Online' | 'Offline' | 'Hybrid' | 'Not specified';
export type Level = 'Beginner' | 'Intermediate' | 'Advanced' | 'Not specified';
export type VerificationStatus = 'Verified' | 'Pending Verification' | 'Expired' | 'Cancelled';
type ListingKind = 'opportunity' | 'programme';

export interface Listing {
  id: string;
  kind: ListingKind;
  title: string;
  organization: string;
  orgMark: string;
  orgTone: 'violet' | 'electric' | 'success' | 'warning' | 'danger';
  category: string;
  summary: string;
  description: string;
  eligibility: string[];
  skills: string[];
  benefits: string[];
  instructions: string[];
  location: string;
  mode: Mode;
  level: Level;
  duration: string;
  deadline?: string;
  startDate?: string;
  postedAt?: string;
  postedAtLabel?: string;
  sourceUrl: string;
  applyUrl: string;
  sourceName?: string;
  sourceId?: string;
  sourceType?: 'public-api' | 'official-catalog' | 'manual' | 'submission';
  verificationStatus?: VerificationStatus;
  lastVerifiedAt?: string;
  lastFetchedAt?: string;
  domains?: string[];
  endDate?: string;
  startAt?: string;
  endAt?: string;
  featured: boolean;
  isLive?: boolean;
}

export interface Category {
  id: string;
  label: string;
  description: string;
}

interface RoadmapResource {
  label: string;
  url: string;
}

export interface RoadmapStep {
  id: string;
  title: string;
  objective: string;
  topics: string[];
  resources: RoadmapResource[];
  task: string;
  miniProject: string;
}

export interface Roadmap {
  id: string;
  title: string;
  category: string;
  level: Level;
  duration: string;
  summary: string;
  skills: string[];
  steps: RoadmapStep[];
}

export interface Profile {
  name: string;
  email: string;
  education: string;
  location: string;
  interests: string[];
  skills: string[];
  learningGoals: string;
}

export interface Preferences {
  theme: 'dark' | 'light';
  notifications: { deadlines: boolean; newEvents: boolean; roadmapReminders: boolean };
  profileVisibility: 'private' | 'community';
}

export interface EventSubmission {
  id: string;
  title: string;
  organization: string;
  contactName: string;
  contactEmail: string;
  category: string;
  submittedAt: string;
  status: 'draft';
}
