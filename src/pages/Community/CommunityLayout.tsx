import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';

const links = [
  { to: '/community', label: 'Community Feed', end: true },
  { to: '/community/events', label: 'Events', end: true },
  { to: '/community/workshops', label: 'Workshops', end: true },
  { to: '/community/hackathons', label: 'Hackathons', end: true },
  { to: '/community/courses', label: 'Courses & Certifications', end: true },
  { to: '/community/my-submissions', label: 'My Submissions', end: true },
];

export default function CommunityLayout() {
  const { user, loading, signOut } = useCommunityAuth();
  const [accountError, setAccountError] = useState<string | null>(null);
  const logout = async () => {
    try {
      await signOut();
      setAccountError(null);
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : 'Unable to sign out.');
    }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="mb-8 rounded-3xl border border-violet/20 bg-gradient-to-br from-violet/15 via-surface to-electric/10 p-6 sm:p-8">
        <p className="eyebrow mb-2">Aikya Community</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Discover Together. Share Opportunities. Grow Together.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          Share genuine opportunities with students. Community submissions are reviewed before they are published as verified listings.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <NavLink to="/community/share" className="btn-primary">Share an Opportunity</NavLink>
          {!loading && !user && <NavLink to="/community/login" className="btn-secondary">Sign in</NavLink>}
          {user && <button type="button" onClick={() => void logout()} className="btn-secondary">Sign out</button>}
          {user?.role === 'admin' && <NavLink to="/community/admin" className="btn-secondary">Moderation dashboard</NavLink>}
        </div>
        {accountError && <p role="alert" className="mt-3 text-sm text-danger">{accountError}</p>}
      </header>

      <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-line/10 bg-surface p-4 lg:sticky lg:top-24">
          <p className="px-3 pb-3 text-xs font-bold tracking-[0.18em] text-muted">COMMUNITY</p>
          <nav aria-label="Community" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-violet/15 text-ink ring-1 ring-violet/30' : 'text-muted hover:bg-line/5 hover:text-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/community/profile"
                className={({ isActive }) =>
                  `shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? 'bg-violet/15 text-ink ring-1 ring-violet/30' : 'text-muted hover:bg-line/5 hover:text-ink'
                  }`
                }
              >
                My Community Profile
              </NavLink>
            )}
          </nav>
          <p className="mt-5 border-t border-line/10 px-3 pt-4 text-xs leading-relaxed text-muted">
            Shared information is not verified until an Aikya admin approves it.
          </p>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
