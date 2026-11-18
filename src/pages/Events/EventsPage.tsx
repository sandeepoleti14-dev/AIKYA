import ListingsBrowser from '@/components/filters/ListingsBrowser';
import OpportunityFeedsNotice from '@/components/ui/OpportunityFeedsNotice';
import OfficialCatalogSection from '@/components/ui/OfficialCatalogSection';
import { OPPORTUNITY_CATEGORIES } from '@/data/categories';
import { EVENT_SOURCES, HACKATHON_SOURCES } from '@/data/officialSources';
import { useApp } from '@/hooks/useApp';
import { getOpportunities } from '@/utils/listings';

export default function EventsPage() {
  const { publicListings, publicListingsLoading, publicListingsSources } = useApp();
  const opportunities = getOpportunities(publicListings);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6 lg:px-8">
      <header className="animate-fade-up">
        <p className="eyebrow mb-3">Events and competitions</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Discover real opportunities</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Browse public event and contest feeds. Confirm details, eligibility, and registration on the organizer’s official page.
        </p>
      </header>

      <OpportunityFeedsNotice sources={publicListingsSources} loading={publicListingsLoading} />
      <ListingsBrowser
        listings={opportunities}
        categories={OPPORTUNITY_CATEGORIES}
        categoryLabel="Category"
        loading={publicListingsLoading}
        sourceNote="Public API listings; confirm details on the official source"
      />
      <OfficialCatalogSection
        title="Official event directories"
        description="Provider directories are linked directly; they are not represented as Aikya-verified listings."
        sources={EVENT_SOURCES}
      />
      <OfficialCatalogSection
        title="Hackathon discovery"
        description="These platforms are linked as official catalogs because no public feed has been confirmed for Aikya."
        sources={HACKATHON_SOURCES}
      />
    </div>
  );
}
