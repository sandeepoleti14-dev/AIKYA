import type { ListingFilters } from '@/utils/listings';

export const DEFAULT_FILTERS: ListingFilters = {
  query: '',
  category: 'all',
  location: 'all',
  mode: 'all',
  deadline: 'all',
  organization: 'all',
  status: 'all',
  level: 'all',
  sort: 'newest',
};

const PARAM_KEYS: Record<keyof ListingFilters, string> = {
  query: 'q',
  category: 'category',
  location: 'location',
  mode: 'mode',
  deadline: 'deadline',
  organization: 'org',
  status: 'status',
  level: 'level',
  sort: 'sort',
};

export function filtersFromParams(params: URLSearchParams): ListingFilters {
  const filters: Record<keyof ListingFilters, string> = { ...DEFAULT_FILTERS };
  (Object.keys(PARAM_KEYS) as (keyof ListingFilters)[]).forEach((key) => {
    const value = params.get(PARAM_KEYS[key]);
    if (value) filters[key] = value;
  });
  return filters as ListingFilters;
}

export function paramsWithFilters(params: URLSearchParams, filters: ListingFilters): URLSearchParams {
  const next = new URLSearchParams(params);
  (Object.keys(PARAM_KEYS) as (keyof ListingFilters)[]).forEach((key) => {
    const value = filters[key];
    if (!value || value === DEFAULT_FILTERS[key]) {
      next.delete(PARAM_KEYS[key]);
    } else {
      next.set(PARAM_KEYS[key], value);
    }
  });
  return next;
}
