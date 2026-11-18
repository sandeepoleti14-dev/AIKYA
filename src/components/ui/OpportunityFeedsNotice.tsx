import type { OpportunitySourceStatus } from '@/services/opportunityFeeds';

interface OpportunityFeedsNoticeProps {
  sources: OpportunitySourceStatus[];
  loading: boolean;
}

export default function OpportunityFeedsNotice({ sources, loading }: OpportunityFeedsNoticeProps) {
  if (loading) {
    return <p role="status" className="text-sm text-muted">Checking official public event and contest feeds...</p>;
  }

  if (sources.length === 0) {
    return <p role="alert" className="text-sm text-danger">Public opportunity feeds could not be loaded.</p>;
  }

  const errors = sources.filter((source) => source.status === 'error');
  return (
    <div aria-live="polite" className="space-y-1 text-sm text-muted">
      <p>
        Live listings are loaded from public provider APIs. India-focused Pretalx results are limited to public listings
        that name India and use the Asia/Kolkata time zone; Codeforces contests are global online events.
      </p>
      {sources.map((source) => (
        <p key={source.id}>
          {source.name}: {source.status === 'loaded'
            ? `${source.count} upcoming listing${source.count === 1 ? '' : 's'}${source.skippedCount ? `; skipped ${source.skippedCount} incomplete record${source.skippedCount === 1 ? '' : 's'}` : ''}`
            : source.error}
        </p>
      ))}
      {errors.length > 0 && <p className="text-danger">Some sources are unavailable; results may be incomplete.</p>}
    </div>
  );
}
