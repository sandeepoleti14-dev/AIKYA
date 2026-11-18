import { BookOpen, Bookmark, Calendar, CircleUser, Compass, LayoutDashboard, Map, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end: boolean;
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/explore', label: 'Explore', icon: Compass, end: false },
  { to: '/dashboard/events', label: 'Events', icon: Calendar, end: false },
  { to: '/dashboard/roadmaps', label: 'Learning Roadmaps', icon: Map, end: false },
  { to: '/dashboard/saved', label: 'Saved Opportunities', icon: Bookmark, end: false },
  { to: '/dashboard/progress', label: 'My Progress', icon: BookOpen, end: false },
  { to: '/dashboard/profile', label: 'Profile', icon: CircleUser, end: false },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, end: false },
];
