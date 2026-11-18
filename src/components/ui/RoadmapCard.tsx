import { ArrowRight, Clock, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import type { Roadmap } from '@/types';

export default function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  const { progress } = useApp();
  const done = (progress[roadmap.id] ?? []).length;
  const total = roadmap.steps.length;
  const percent = Math.round((done / total) * 100);

  return (
    <article className="card-interactive group flex h-full flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="chip">{roadmap.level}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {roadmap.duration}
        </span>
      </div>
      <h3 className="mt-5 text-xl font-bold text-ink">{roadmap.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{roadmap.summary}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {roadmap.skills.slice(0, 4).map((skill) => (
          <span key={skill} className="rounded-lg bg-line/5 px-2.5 py-1 text-xs text-muted">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            {total} modules
          </span>
          <span>{percent}% complete</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-line/10" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${roadmap.title} progress`}>
          <div className="h-full rounded-full bg-gradient-to-r from-violet to-electric transition-[width] duration-700" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <Link to={`/learn/${roadmap.id}`} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-violet-accent transition-all duration-300 group-hover:gap-3">
        View roadmap
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </article>
  );
}
