import { ExternalLink } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import type { OfficialSource } from '@/data/officialSources';

interface OfficialCatalogSectionProps {
  title: string;
  description: string;
  sources: OfficialSource[];
}

export default function OfficialCatalogSection({ title, description, sources }: OfficialCatalogSectionProps) {
  if (sources.length === 0) return null;

  return (
    <section className="space-y-6">
      <SectionHeading title={title} description={description} />
      <p className="text-sm text-muted">
        These are links to official provider catalogs, not individual listings verified or fetched by Aikya.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <a
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-interactive group flex h-full items-start gap-4 p-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/15 font-display text-sm font-bold text-violet-accent">
              {source.name.slice(0, 1)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3 font-semibold text-ink">
                {source.name}
                <ExternalLink className="h-4 w-4 shrink-0 text-muted transition group-hover:text-violet-accent" aria-hidden="true" />
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{source.description}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
