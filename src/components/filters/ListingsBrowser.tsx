import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import ListingFilterBar from '@/components/filters/ListingFilterBar';
import EmptyState from '@/components/ui/EmptyState';
import ListingCard from '@/components/ui/ListingCard';
import { CardSkeletonGrid } from '@/components/ui/CardSkeleton';
import Reveal from '@/components/ui/Reveal';
import type { Category, Listing } from '@/types';
import { DEFAULT_FILTERS, filtersFromParams, paramsWithFilters } from '@/utils/filterParams';
import { filterListings, type ListingFilters } from '@/utils/listings';

interface ListingsBrowserProps {
  listings: Listing[];
  categories: Category[];
  categoryLabel: string;
  loading?: boolean;
  sourceNote?: string;
}

export default function ListingsBrowser({
  listings,
  categories,
  categoryLabel,
  loading = false,
  sourceNote = 'Demonstration data',
}: ListingsBrowserProps) {
  const [params, setParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const filters = useMemo(() => filtersFromParams(params), [params]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  const results = useMemo(() => filterListings(listings, filters), [listings, filters]);

  const updateFilters = (patch: Partial<ListingFilters>) => {
    setParams(paramsWithFilters(params, { ...filters, ...patch }), { replace: true });
  };

  const resetFilters = () => setParams(paramsWithFilters(params, DEFAULT_FILTERS), { replace: true });
  const isLoading = loading || !ready;

  return (
    <div className="space-y-8">
      <ListingFilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        categories={categories}
        categoryLabel={categoryLabel}
        listings={listings}
      />

      <div className="flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>
          {isLoading ? 'Loading opportunities' : `${results.length} ${results.length === 1 ? 'result' : 'results'}`}
        </span>
        <span className="hidden sm:inline">{sourceNote}</span>
      </div>

      {isLoading && <CardSkeletonGrid />}

      {!isLoading && results.length === 0 && (
        <EmptyState
          icon={SearchX}
          title="No matches yet"
          description="Try a broader search or clear a filter."
          action={
            <button type="button" onClick={resetFilters} className="btn-primary">
              Clear all filters
            </button>
          }
        />
      )}

      {!isLoading && results.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((listing, index) => (
            <Reveal key={listing.id} delay={Math.min(index, 6) * 50}>
              <ListingCard listing={listing} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
