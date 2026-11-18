import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Layers, Route, Target } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '@/components/ui/EmptyState';
import { useApp } from '@/hooks/useApp';
import { getRoadmap } from '@/data/roadmaps';
import type { Roadmap } from '@/types';

export default function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const roadmap = id ? getRoadmap(id) : undefined;

  if (!roadmap) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24">
        <EmptyState
          icon={Route}
          title="Roadmap not found"
          description="This learning path is not available yet."
          action={
            <Link to="/learn" className="btn-primary">
              Back to learning
            </Link>
          }
        />
      </div>
    );
  }

  return <RoadmapView roadmap={roadmap} />;
}

function RoadmapView({ roadmap }: { roadmap: Roadmap }) {
  const { progress, setStepComplete, setLastRoadmap } = useApp();
  const completed = progress[roadmap.id] ?? [];
  const percent = Math.round((completed.length / roadmap.steps.length) * 100);
  const nextStep = roadmap.steps.find((step) => !completed.includes(step.id));

  useEffect(() => {
    setLastRoadmap(roadmap.id);
  }, [roadmap.id, setLastRoadmap]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/learn" className="btn-ghost -ml-4 mb-6">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All roadmaps
      </Link>

      <header className="animate-fade-up">
        <p className="eyebrow mb-3">
          {roadmap.level} · {roadmap.duration}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{roadmap.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{roadmap.summary}</p>
      </header>

      <div className="card mt-10 grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium text-ink">
              <Target className="h-4 w-4 text-violet-accent" aria-hidden="true" />
              {completed.length} of {roadmap.steps.length} modules complete
            </span>
            <span className="font-bold text-violet-accent">{percent}%</span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-line/10"
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Roadmap progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet via-violet-accent to-electric transition-[width] duration-700 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Layers className="h-4 w-4" aria-hidden="true" />
            {nextStep ? `Next up: ${nextStep.title}` : 'Every module is complete. Great work!'}
          </p>
        </div>
        {nextStep && (
          <Link to={`#${nextStep.id}`} className="btn-primary">
            Continue learning
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <ol className="mt-10 space-y-4">
        {roadmap.steps.map((step, index) => {
          const done = completed.includes(step.id);
          return (
            <li key={step.id} id={step.id} className="scroll-mt-28">
              <details
                className="card group overflow-hidden open:border-violet/40"
                open={step.id === nextStep?.id}
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition duration-300 ${
                      done ? 'bg-success text-base' : 'bg-violet/15 text-violet-accent'
                    }`}
                  >
                    {done ? <Check className="h-5 w-5" aria-hidden="true" /> : index + 1}
                  </span>
                  <span className="flex-1">
                    <span className="block text-xs font-medium uppercase tracking-wider text-muted">Step {index + 1}</span>
                    <span className="block font-display text-lg font-bold text-ink">{step.title}</span>
                  </span>
                  <span className="text-xs text-muted transition group-open:rotate-90">›</span>
                </summary>

                <div className="grid gap-8 border-t border-line/10 p-5 sm:p-6 md:grid-cols-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-ink">Learning objective</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{step.objective}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Topics</h3>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {step.topics.map((topic) => (
                          <li key={topic} className="chip">{topic}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink">Recommended free resources</h3>
                      <ul className="mt-2 space-y-2">
                        {step.resources.map((resource) => (
                          <li key={resource.url}>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-sm text-violet-accent hover:underline"
                            >
                              {resource.label}
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-xl bg-line/5 p-4">
                      <h3 className="text-sm font-bold text-ink">Practical task</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{step.task}</p>
                    </div>
                    <div className="rounded-xl bg-violet/10 p-4">
                      <h3 className="text-sm font-bold text-ink">Mini-project</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{step.miniProject}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStepComplete(roadmap.id, step.id, !done)}
                      aria-pressed={done}
                      className={`w-full ${done ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      {done ? 'Completed. Mark as incomplete' : 'Mark module complete'}
                    </button>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
