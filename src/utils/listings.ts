import type { Listing } from '@/types';
import { deadlineStatus, daysUntil } from '@/utils/format';

export function getOpportunities(publicListings: Listing[] = []): Listing[] {
  return publicListings.filter((listing) => listing.category !== 'jobs');
}

export function getAllListings(publicListings: Listing[] = [], greenhouseJobs: Listing[] = []): Listing[] {
  return [...getOpportunities(publicListings), ...greenhouseJobs];
}

export function getListing(id: string, publicListings: Listing[] = [], greenhouseJobs: Listing[] = []): Listing | undefined {
  return getAllListings(publicListings, greenhouseJobs).find((listing) => listing.id === id);
}

export function getRecommendedListings(listings: Listing[], interests: string[]): Listing[] {
  const selected = new Set(interests.map((interest) => interest.trim().toLowerCase()).filter(Boolean));
  if (selected.size === 0) return [];
  return listings.filter((listing) => listing.domains?.some((domain) => selected.has(domain.toLowerCase())));
}

type DeadlineFilter = 'all' | '7' | '30' | '90';
type SortOption = 'newest' | 'deadline';

export interface ListingFilters {
  query: string;
  category: string;
  location: string;
  mode: string;
  deadline: DeadlineFilter;
  organization: string;
  status: string;
  level: string;
  sort: SortOption;
}

export function filterListings(listings: Listing[], filters: ListingFilters): Listing[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = listings.filter((listing) => {
    if (query) {
      const haystack = `${listing.title} ${listing.organization} ${listing.summary} ${listing.skills.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.category !== 'all' && listing.category !== filters.category) return false;
    if (filters.location !== 'all' && listing.location !== filters.location) return false;
    if (filters.mode !== 'all' && listing.mode !== filters.mode) return false;
    if (filters.organization !== 'all' && listing.organization !== filters.organization) return false;
    if (filters.level !== 'all' && listing.level !== filters.level) return false;
    if (filters.status === 'open' && deadlineStatus(listing.deadline) === 'closed') return false;
    if (filters.status === 'closing-soon' && deadlineStatus(listing.deadline) !== 'closing-soon') return false;
    if (filters.deadline !== 'all') {
      const days = daysUntil(listing.deadline);
      if (days < 0 || days > Number(filters.deadline)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    if (filters.sort === 'deadline') {
      if (!a.deadline) return b.deadline ? 1 : 0;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    }
    return (b.postedAt ?? '').localeCompare(a.postedAt ?? '');
  });
}

export function uniqueValues(listings: Listing[], pick: (listing: Listing) => string): string[] {
  return Array.from(new Set(listings.map(pick))).sort((a, b) => a.localeCompare(b));
}
