import { Link } from 'react-router-dom';
import ListingCard from '@/components/ui/ListingCard';
import OfficialCatalogSection from '@/components/ui/OfficialCatalogSection';
import OpportunityFeedsNotice from '@/components/ui/OpportunityFeedsNotice';
import SectionHeading from '@/components/ui/SectionHeading';
import HeroSection from '@/pages/Home/HeroSection';
import { EVENT_SOURCES, HACKATHON_SOURCES, LEARNING_SOURCES } from '@/data/officialSources';
import { useApp } from '@/hooks/useApp';
import { getRecommendedListings } from '@/utils/listings';
import { RoadmapShowcase } from '@/pages/Home/RoadmapShowcase';
import CommunityReviewsSection from '@/pages/Home/CommunityReviewsSection';

export default function HomePage() {
  const { profile, publicListings, publicListingsLoading, publicListingsSources } = useApp();
  const recommendations = getRecommendedListings(publicListings, profile.interests);
  const indiaFocusedEvents = publicListings.filter((listing) => listing.sourceName === 'Pretalx');
  const onlineListings = publicListings.filter((listing) => listing.mode === 'Online' && listing.category !== 'competitions');
  const nearbyListings = publicListings.filter(
    (listing) =>
      listing.location !== 'Venue not specified' &&
      profile.location.trim() &&
      listing.location.toLowerCase().includes(profile.location.trim().toLowerCase()),
  );
  const contests = publicListings.filter((listing) => listing.category === 'competitions' || listing.category === 'hackathons');

  return (
    <div className="space-y-20 pb-8">
      <HeroSection />
      <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
        <OpportunityFeedsNotice sources={publicListingsSources} loading={publicListingsLoading} />
      </div>

      <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Recommended for you"
          description="Recommendations only use technology domains you selected in Settings."
          action={<Link to="/explore" className="btn-secondary">See your feed</Link>}
        />
        {recommendations.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.slice(0, 3).map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <div className="card p-6 text-sm text-muted">
            <p>
              {profile.interests.length === 0
                ? 'Select your technology interests to personalize recommendations.'
                : 'No current public listings match your selected interests.'}
            </p>
            <Link to="/dashboard/settings" className="mt-3 inline-flex font-medium text-violet-accent hover:underline">
              Update interests
            </Link>
          </div>
        )}
      </section>

      {nearbyListings.length > 0 && (
        <ListingSection title="Upcoming near you" listings={nearbyListings} />
      )}

      {indiaFocusedEvents.length > 0 && (
        <ListingSection title="India-focused technology events" listings={indiaFocusedEvents} />
      )}

      {onlineListings.length > 0 && (
        <ListingSection title="Online opportunities" listings={onlineListings} />
      )}

      {contests.length > 0 && (
        <ListingSection title="Hackathons and competitions" listings={contests} />
      )}

      <OfficialCatalogSection
        title="Technology events"
        description="Explore current events directly from official providers and developer communities."
        sources={EVENT_SOURCES}
      />
      <OfficialCatalogSection
        title="Hackathons and competitions"
        description="These providers do not currently expose a confirmed public listing feed to Aikya."
        sources={HACKATHON_SOURCES}
      />
      <OfficialCatalogSection
        title="Free learning and certifications"
        description="Browse official provider catalogs and confirm course or exam costs on each provider’s site."
        sources={LEARNING_SOURCES}
      />
      <RoadmapShowcase />
      <CommunityReviewsSection />
    </div>
  );
}

function ListingSection({ title, listings }: { title: string; listings: ReturnType<typeof getRecommendedListings> }) {
  if (listings.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <SectionHeading title={title} />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.slice(0, 3).map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </section>
  );
}
