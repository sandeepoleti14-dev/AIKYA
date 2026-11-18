import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, Calendar, Code2, BriefcaseBusiness, Play } from 'lucide-react';
import CountUp from '@/components/ui/CountUp';
import ListingCard from '@/components/ui/ListingCard';
import OpportunityFeedsNotice from '@/components/ui/OpportunityFeedsNotice';
import Reveal from '@/components/ui/Reveal';
import { useApp } from '@/hooks/useApp';
import { ROADMAPS, getRoadmap } from '@/data/roadmaps';
import { getAllListings } from '@/utils/listings';

export default function OverviewPage() {
  const {
    profile,
    savedIds,
    lastRoadmapId,
    progress,
    publicListings,
    publicListingsLoading,
    publicListingsSources,
    greenhouseJobs,
  } = useApp();
  const firstName = profile.name.trim().split(/\s+/)[0] || 'there';
  const lastRoadmap = getRoadmap(lastRoadmapId) ?? ROADMAPS[0];
  const lastDone = (progress[lastRoadmap.id] ?? []).length;
  const savedListings = getAllListings(publicListings, greenhouseJobs)
    .filter((listing) => savedIds.includes(listing.id))
    .slice(0, 3);
  const stats = [
    { label: 'Public listings', value: publicListings.length, icon: Calendar },
    { label: 'Online contests', value: publicListings.filter((listing) => listing.category === 'competitions').length, icon: Code2 },
    { label: 'Jobs (secondary)', value: greenhouseJobs.length, icon: BriefcaseBusiness },
    { label: 'Saved', value: savedIds.length, icon: Bookmark },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <p className="eyebrow mb-3">Overview</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Welcome back, {firstName}</h1>
        <p className="mt-2 text-muted">Discover opportunities. Build skills. Connect with the tech community.</p>
      </Reveal>

      <OpportunityFeedsNotice sources={publicListingsSources} loading={publicListingsLoading} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 70} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{stat.label}</span>
              <stat.icon className="h-4 w-4 text-violet-accent" aria-hidden="true" />
            </div>
            <CountUp value={stat.value} className="mt-3 block text-3xl font-bold text-ink" />
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal className="card flex flex-col p-6">
          <p className="text-sm text-muted">Continue learning</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{lastRoadmap.title}</h2>
          <p className="mt-1 text-sm text-muted">{lastDone} of {lastRoadmap.steps.length} modules complete</p>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet to-electric transition-[width] duration-700"
              style={{ width: `${Math.round((lastDone / lastRoadmap.steps.length) * 100)}%` }}
            />
          </div>
          <div className="mt-auto flex flex-col gap-3 pt-6">
            <Link to={`/learn/${lastRoadmap.id}`} className="btn-primary justify-center">
              <Play className="h-4 w-4" aria-hidden="true" />
              Continue learning
            </Link>
            <Link to="/events" className="btn-secondary justify-center">
              Browse opportunities
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100} className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Saved opportunities</h2>
            <Link to="/dashboard/saved" className="text-sm font-medium text-violet-accent hover:underline">View all</Link>
          </div>
          {savedListings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line/20 p-6 text-center text-sm text-muted">
              Nothing saved yet. Bookmark an opportunity to see it here.
            </p>
          ) : (
            <div className="grid gap-4">
              {savedListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
