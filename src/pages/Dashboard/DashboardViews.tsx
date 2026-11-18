import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import ListingsBrowser from '@/components/filters/ListingsBrowser';
import ListingCard from '@/components/ui/ListingCard';
import EmptyState from '@/components/ui/EmptyState';
import RoadmapCard from '@/components/ui/RoadmapCard';
import SectionHeading from '@/components/ui/SectionHeading';
import OpportunityFeedsNotice from '@/components/ui/OpportunityFeedsNotice';
import { OPPORTUNITY_CATEGORIES } from '@/data/categories';
import { ROADMAPS } from '@/data/roadmaps';
import { useApp } from '@/hooks/useApp';
import { getAllListings, getOpportunities } from '@/utils/listings';

export function DashboardEventsView() {
  const { publicListings, publicListingsLoading, publicListingsSources } = useApp();
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Events" title="Events and competitions" description="Browse public listings and confirm details with the official source." />
      <OpportunityFeedsNotice sources={publicListingsSources} loading={publicListingsLoading} />
      <ListingsBrowser
        listings={getOpportunities(publicListings)}
        categories={OPPORTUNITY_CATEGORIES}
        categoryLabel="Category"
        loading={publicListingsLoading}
        sourceNote="Public API listings; check official source for current details"
      />
    </div>
  );
}

export function DashboardExploreView() {
  const { publicListings, publicListingsLoading, publicListingsSources } = useApp();
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Explore" title="All public opportunities" description="Jobs remain separate so events, contests, and learning stay front and center." />
      <OpportunityFeedsNotice sources={publicListingsSources} loading={publicListingsLoading} />
      <ListingsBrowser
        listings={publicListings}
        categories={OPPORTUNITY_CATEGORIES}
        categoryLabel="Category"
        loading={publicListingsLoading}
        sourceNote="Public event and contest feeds"
      />
      <Link to="/jobs" className="text-sm font-medium text-violet-accent hover:underline">Browse jobs (secondary)</Link>
    </div>
  );
}

export function DashboardRoadmapsView() {
  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Learning roadmaps" title="Your learning paths" description="Open a roadmap to tick off modules as you complete them." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ROADMAPS.map((roadmap) => (
          <RoadmapCard key={roadmap.id} roadmap={roadmap} />
        ))}
      </div>
    </div>
  );
}

export function DashboardSavedView() {
  const { savedIds, publicListings, greenhouseJobs } = useApp();
  const saved = getAllListings(publicListings, greenhouseJobs).filter((listing) => savedIds.includes(listing.id));

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Saved" title="Saved opportunities" description="Everything you bookmarked, kept in this browser." />
      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved opportunities yet"
          description="Tap the bookmark icon on an event, contest, or job to keep it here."
          action={
            <Link to="/dashboard/explore" className="btn-primary">
              Explore opportunities
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
