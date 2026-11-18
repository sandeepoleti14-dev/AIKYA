import { Link } from 'react-router-dom';
import { ROADMAPS } from '@/data/roadmaps';
import { useApp } from '@/hooks/useApp';
import SectionHeading from '@/components/ui/SectionHeading';
import { getProgressPercent } from '@/utils/progress';

export default function ProgressPage() {
  const { progress } = useApp();
  const overall = getProgressPercent(ROADMAPS, progress);
  const completedModules = ROADMAPS.reduce((sum, roadmap) => sum + (progress[roadmap.id] ?? []).length, 0);
  const totalModules = ROADMAPS.reduce((sum, roadmap) => sum + roadmap.steps.length, 0);

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="My progress" title="How your learning is going" description="Progress is saved in this browser." />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted">Overall</p>
          <p className="mt-2 text-3xl font-bold text-ink">{overall}%</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Modules completed</p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {completedModules} / {totalModules}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Roadmaps started</p>
          <p className="mt-2 text-3xl font-bold text-ink">
            {ROADMAPS.filter((roadmap) => (progress[roadmap.id] ?? []).length > 0).length} / {ROADMAPS.length}
          </p>
        </div>
      </div>

      <ul className="space-y-4">
        {ROADMAPS.map((roadmap) => {
          const done = (progress[roadmap.id] ?? []).length;
          const percent = Math.round((done / roadmap.steps.length) * 100);
          return (
            <li key={roadmap.id} className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-ink">{roadmap.title}</h2>
                <p className="mt-1 text-sm text-muted">
                  {done} of {roadmap.steps.length} modules complete
                </p>
                <div
                  className="mt-4 h-1.5 overflow-hidden rounded-full bg-line/10"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${roadmap.title} progress`}
                >
                  <div className="h-full rounded-full bg-gradient-to-r from-violet to-electric transition-[width] duration-700" style={{ width: `${percent}%` }} />
                </div>
              </div>
              <Link to={`/learn/${roadmap.id}`} className="btn-secondary shrink-0">
                {done === 0 ? 'Start roadmap' : 'Continue'}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
