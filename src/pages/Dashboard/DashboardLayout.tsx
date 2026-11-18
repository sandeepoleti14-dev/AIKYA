import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useApp } from '@/hooks/useApp';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';
import { DASHBOARD_NAV } from '@/pages/Dashboard/dashboardNav';

const LINK_BASE =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition duration-200';
const LINK_IDLE = 'text-muted hover:bg-line/5 hover:text-ink';
const LINK_ACTIVE = 'bg-violet/15 text-ink ring-1 ring-violet/30';

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-1">
      {DASHBOARD_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) => `${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_IDLE}`}
        >
          <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const { profile } = useApp();
  const { user: account } = useCommunityAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const accountName = account?.displayName || profile.name;
  const firstName = accountName.split(' ')[0] || 'there';
  const currentLabel = DASHBOARD_NAV.find((item) => item.to === pathname)?.label ?? 'Dashboard';

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="min-h-screen bg-base text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line/10 bg-surface/95 p-5 backdrop-blur lg:flex">
        <div className="mb-8 px-2">
          <Logo />
        </div>
        <SidebarNav />
        <p className="mt-auto px-3 text-xs text-muted">Public event feeds; jobs are secondary</p>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close dashboard menu"
            className="absolute inset-0 bg-black/60 animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-surface p-5 shadow-2xl animate-fade-in">
            <div className="mb-8 flex items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setDrawerOpen(false)} className="btn-ghost h-10 w-10 p-0" aria-label="Close menu">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line/10 bg-base/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="btn-ghost h-10 w-10 p-0 lg:hidden"
              aria-label="Open dashboard menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
            <div>
              <p className="text-xs text-muted">Hello, {firstName}</p>
              <p className="text-sm font-semibold text-ink">{currentLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to={account ? '/community/profile' : '/dashboard/profile'} className="flex h-10 items-center gap-2 rounded-full border border-line/10 pl-1 pr-4 text-sm font-medium text-ink transition hover:border-violet/40">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet to-electric text-xs font-bold text-white">
                {account?.avatarPath ? <img src={account.avatarPath} alt="" className="h-full w-full rounded-full object-cover" /> : accountName.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">{accountName || 'Your profile'}</span>
            </Link>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div key={pathname} className="mx-auto max-w-6xl animate-fade-up" style={{ animationDuration: '700ms' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
