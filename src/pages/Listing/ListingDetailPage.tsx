import type { ReactNode } from 'react';
import { ArrowLeft, Bookmark, Calendar, ExternalLink, Globe, MapPin, Monitor, SearchX, Target } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SaveButton from '@/components/ui/SaveButton';
import StatusBadge from '@/components/ui/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';
import Reveal from '@/components/ui/Reveal';
import { ALL_CATEGORY_LABELS } from '@/data/categories';
import { TONE_CLASSES } from '@/utils/tones';
import { getListing } from '@/utils/listings';
import { formatDate } from '@/utils/format';
import type { Listing } from '@/types';
import { useApp } from '@/hooks/useApp';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    greenhouseJobs,
    greenhouseJobsLoading,
    greenhouseJobsError,
    publicListings,
    publicListingsLoading,
    publicListingsError,
  } = useApp();
  const listing = id ? getListing(id, publicListings, greenhouseJobs) : undefined;
  const isLiveJobRoute = id ? /^(gitlab|hackerrank)-/.test(id) : false;
  const isLoading = isLiveJobRoute ? greenhouseJobsLoading : publicListingsLoading;

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <EmptyState
          icon={SearchX}
          title={isLoading ? 'Loading opportunity details' : 'We could not find that listing'}
          description={
            isLoading
              ? 'Fetching the latest public listing details...'
              : isLiveJobRoute && greenhouseJobsError
                ? `Greenhouse job listings could not be fully loaded: ${greenhouseJobsError}`
                : publicListingsError
                  ? `Public event feeds could not be fully loaded: ${publicListingsError}`
                  : 'It may have expired or been removed from the source.'
          }
          action={
            <Link to="/events" className="btn-primary">
              Browse opportunities
            </Link>
          }
        />
      </div>
    );
  }

  const isProgramme = listing.kind === 'programme';
  const backTo = listing.category === 'jobs' ? '/jobs' : isProgramme ? '/learn' : '/events';

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to={backTo} className="btn-ghost -ml-4 mb-6 animate-fade-in">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to {listing.category === 'jobs' ? 'jobs' : isProgramme ? 'learning' : 'opportunities'}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
        <article className="min-w-0 space-y-12">
          <header className="animate-fade-up">
            <div className="flex items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold ring-1 ${TONE_CLASSES[listing.orgTone]}`} aria-hidden="true">
                {listing.orgMark}
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{listing.organization}</p>
                <p className="text-xs text-muted">{ALL_CATEGORY_LABELS[listing.category]}</p>
              </div>
            </div>
            <h1 className="mt-6 text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">{listing.title}</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge deadline={listing.deadline} />
              <span className="chip">{listing.mode}</span>
              <span className="chip">{listing.level}</span>
              {listing.verificationStatus && <span className="chip">{listing.verificationStatus}</span>}
            </div>
            <p className="mt-6 text-lg leading-relaxed text-muted">{listing.summary}</p>
          </header>

          <Section title="About this opportunity">
            <p className="whitespace-pre-line leading-relaxed text-muted">{listing.description}</p>
          </Section>

          {(listing.eligibility.length > 0 || listing.benefits.length > 0) && (
            <div className="grid gap-8 md:grid-cols-2">
              {listing.eligibility.length > 0 && (
                <Section title="Eligibility">
                  <BulletList items={listing.eligibility} />
                </Section>
              )}
              {listing.benefits.length > 0 && (
                <Section title="Benefits">
                  <BulletList items={listing.benefits} />
                </Section>
              )}
            </div>
          )}

          <Section title="Important dates">
            <dl className="grid gap-4 sm:grid-cols-3">
              {listing.postedAt && (
                <DateItem label={listing.postedAtLabel ?? 'Posted'} value={formatDate(listing.postedAt)} />
              )}
              {listing.deadline && <DateItem label="Application deadline" value={formatDate(listing.deadline)} />}
              {listing.startDate && (
                <DateItem label={isProgramme ? 'Programme starts' : 'Event starts'} value={formatDate(listing.startDate)} />
              )}
              {listing.endDate && <DateItem label="Event ends" value={formatDate(listing.endDate)} />}
              {listing.startAt && <DateItem label="Start time" value={formatDateTime(listing.startAt)} />}
              {listing.endAt && <DateItem label="End time" value={formatDateTime(listing.endAt)} />}
              {!listing.postedAt && !listing.deadline && !listing.startDate && (
                <DateItem label="Dates" value="Not specified" />
              )}
            </dl>
          </Section>

          {listing.instructions.length > 0 && (
            <Section title="Application instructions">
              <ol className="list-decimal space-y-3 pl-5 text-muted marker:text-violet-accent">
                {listing.instructions.map((step) => (
                  <li key={step} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </Section>
          )}

          {listing.skills.length > 0 && (
            <Section title="Skills to prepare">
              <div className="flex flex-wrap gap-2">
                {listing.skills.map((skill) => (
                  <span key={skill} className="chip px-3.5 py-1.5 text-sm">{skill}</span>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted">
                Want to build these skills first?{' '}
                <Link to="/learn" className="font-medium text-violet-accent hover:underline">
                  Explore learning roadmaps
                </Link>
              </p>
            </Section>
          )}

        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <div className="card space-y-6 p-6">
              <div className="space-y-3">
                <ApplyButton listing={listing} />
                <div className="flex items-center gap-3">
                  <SaveButton id={listing.id} title={listing.title} />
                  <SaveLabel />
                </div>
              </div>
              <ul className="space-y-4 border-t border-line/10 pt-6 text-sm">
                <FactRow icon={Calendar} label="Deadline" value={formatDate(listing.deadline)} />
                <FactRow icon={MapPin} label="Location" value={listing.location} />
                <FactRow icon={Monitor} label="Mode" value={listing.mode} />
                <FactRow icon={Target} label="Level" value={listing.level} />
                <FactRow icon={Calendar} label="Duration" value={listing.duration} />
                <FactRow icon={Globe} label="Entry fee" value="Not specified" />
                <FactRow icon={Calendar} label="Certificate" value="Not confirmed" />
                {listing.lastFetchedAt && <FactRow icon={Calendar} label="Last checked" value={formatDateTime(listing.lastFetchedAt)} />}
              </ul>
              <a
                href={listing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-line/10 px-4 py-3 text-sm text-muted transition hover:border-violet/40 hover:text-ink"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  {listing.sourceName ? `Official listing · ${listing.sourceName}` : 'Official source'}
                </span>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}

function SaveLabel() {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted">
      <Bookmark className="h-4 w-4" aria-hidden="true" />
      Save to dashboard
    </span>
  );
}

function ApplyButton({ listing }: { listing: Listing }) {
  const label = listing.category === 'jobs'
    ? 'View job on official site'
    : listing.category === 'competitions'
      ? 'View contest on official site'
      : 'Open official event page';
  return (
    <a
      href={listing.applyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary w-full"
    >
      {label}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal>
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        {children}
      </section>
    </Reveal>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function DateItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line/10 bg-card/60 p-4">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}

function FactRow({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-accent" aria-hidden="true" />
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="font-medium text-ink">{value}</p>
      </div>
    </li>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not specified' : date.toLocaleString();
}
