import { ArrowRight, Calendar, MapPin, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import SaveButton from '@/components/ui/SaveButton';
import StatusBadge from '@/components/ui/StatusBadge';
import { ALL_CATEGORY_LABELS } from '@/data/categories';
import type { Listing } from '@/types';
import { deadlineLabel, formatDate } from '@/utils/format';
import { TONE_CLASSES } from '@/utils/tones';

export default function ListingCard({ listing }: { listing: Listing }) {
  const detailPath = listing.kind === 'programme' ? `/programs/${listing.id}` : `/events/${listing.id}`;

  return (
    <article className="card-interactive group flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ${TONE_CLASSES[listing.orgTone]}`}
            aria-hidden="true"
          >
            {listing.orgMark}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{listing.organization}</p>
            <p className="truncate text-xs text-muted">
              {ALL_CATEGORY_LABELS[listing.category]}
              {listing.sourceName ? ` · ${listing.sourceName}` : ''}
            </p>
          </div>
        </div>
        <SaveButton id={listing.id} title={listing.title} />
      </div>

      <h3 className="mt-5 text-lg font-bold leading-snug text-ink transition-colors group-hover:text-violet-accent">
        {listing.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{listing.summary}</p>
      {listing.verificationStatus && (
        <p className="mt-3 text-xs text-muted">
          Source status: <span className="font-medium text-ink">{listing.verificationStatus}</span>
        </p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-3 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-violet-accent" aria-hidden="true" />
          <dd className="truncate">{deadlineLabel(listing.deadline)}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Monitor className="h-3.5 w-3.5 shrink-0 text-violet-accent" aria-hidden="true" />
          <dd>{listing.mode}</dd>
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-accent" aria-hidden="true" />
          <dd className="truncate">{listing.location}</dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <StatusBadge deadline={listing.deadline} />
        <Link
          to={detailPath}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-accent transition duration-200 group-hover:gap-2.5"
        >
          View details
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      {listing.startDate && <span className="sr-only">Starts {formatDate(listing.startDate)}</span>}
    </article>
  );
}
