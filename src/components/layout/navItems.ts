export const PUBLIC_NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'For You', end: true },
  { to: '/events', label: 'All Opportunities', end: false },
  { to: '/community', label: 'Community', end: false },
  { to: '/learn', label: 'Free Learning', end: false },
  { to: '/jobs', label: 'Jobs', end: false },
] as const;
