import { Link } from 'react-router-dom';
import ListingCard from '@/components/ui/ListingCard';
import OfficialCatalogSection from '@/components/ui/OfficialCatalogSection';
import OpportunityFeedsNotice from '@/components/ui/OpportunityFeedsNotice';
import SectionHeading from '@/components/ui/SectionHeading';
import { EVENT_SOURCES, HACKATHON_SOURCES } from '@/data/officialSources';
import { useApp } from '@/hooks/useApp';
import { getRecommendedListings } from '@/utils/listings';

export default function ExplorePage() {
  const { profile, publicListings, publicListingsLoading, publicListingsSources } = useApp();
  const recommendations = getRecommendedListings(publicListings, profile.interests);

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow mb-3">For You</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Your interest-based feed</h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Only public listings with a matching technology domain appear here. Your interests stay in this browser.
        </p>
        <Link to="/dashboard/settings" className="btn-secondary mt-6">Update interests</Link>
      </header>

      <OpportunityFeedsNotice sources={publicListingsSources} loading={publicListingsLoading} />

      <section className="space-y-8">
        <SectionHeading title="Recommended for you" description={`Selected domains: ${profile.interests.length ? profile.interests.join(', ') : 'none yet'}`} />
        {!profile.interests.length ? (
          <p className="card p-6 text-sm text-muted">Choose one or more domains in Settings to get relevant recommendations.</p>
        ) : recommendations.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <p className="card p-6 text-sm text-muted">There are no current public listings tagged with your selected domains.</p>
        )}
      </section>

      <OfficialCatalogSection
        title="Official event sources"
        description="Use provider catalogs for events that do not have a confirmed public API feed."
        sources={EVENT_SOURCES}
      />
      <OfficialCatalogSection
        title="Hackathons and competitions"
        description="Open the organizer or platform’s own catalog for current registration details."
        sources={HACKATHON_SOURCES}
      />
      <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-ink">Jobs are listed separately</h2>
          <p className="mt-1 text-sm text-muted">India-based GitLab and HackerRank jobs remain available as a secondary section.</p>
        </div>
        <Link to="/jobs" className="btn-secondary shrink-0">Browse jobs</Link>
      </section>
    </div>
  );
}
