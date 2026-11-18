export type DeadlineStatus = 'open' | 'closing-soon' | 'closed' | 'not-specified';

function parseDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const dateOnly = iso.slice(0, 10);
  const date = new Date(`${dateOnly}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function daysUntil(iso?: string, now: Date = new Date()): number {
  const date = parseDate(iso);
  if (!date) return Number.POSITIVE_INFINITY;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date.getTime() - startOfToday.getTime()) / 86_400_000);
}

export function deadlineStatus(iso?: string): DeadlineStatus {
  if (!parseDate(iso)) return 'not-specified';
  const days = daysUntil(iso);
  if (days < 0) return 'closed';
  if (days <= 7) return 'closing-soon';
  return 'open';
}

export function formatDate(iso?: string): string {
  return parseDate(iso)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) ?? 'Not specified';
}

export function formatShortDate(iso?: string): string {
  return parseDate(iso)?.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) ?? 'Not specified';
}

export function deadlineLabel(iso?: string): string {
  if (!parseDate(iso)) return 'No deadline listed';
  const days = daysUntil(iso);
  if (days < 0) return 'Closed';
  if (days === 0) return 'Closes today';
  if (days === 1) return 'Closes tomorrow';
  if (days <= 7) return `${days} days left`;
  return `Due ${formatShortDate(iso)}`;
}
