import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center animate-fade-up">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/15 text-violet-accent">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h3 className="text-xl font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
