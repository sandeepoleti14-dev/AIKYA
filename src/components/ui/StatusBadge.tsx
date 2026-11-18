import { deadlineStatus, type DeadlineStatus } from '@/utils/format';

const STATUS_STYLES: Record<DeadlineStatus, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-success/15 text-success' },
  'closing-soon': { label: 'Closing soon', className: 'bg-warning/15 text-warning' },
  closed: { label: 'Closed', className: 'bg-danger/15 text-danger' },
  'not-specified': { label: 'No deadline listed', className: 'bg-line/10 text-muted' },
};

export default function StatusBadge({ deadline }: { deadline?: string }) {
  const style = STATUS_STYLES[deadlineStatus(deadline)];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {style.label}
    </span>
  );
}
