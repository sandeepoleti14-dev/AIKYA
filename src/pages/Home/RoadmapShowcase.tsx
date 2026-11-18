import { ArrowRight, BookOpen, Compass, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Reveal from '@/components/ui/Reveal';
import RoadmapCard from '@/components/ui/RoadmapCard';
import SectionHeading from '@/components/ui/SectionHeading';
import { ROADMAPS } from '@/data/roadmaps';

export function RoadmapShowcase() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Learning roadmaps"
        title="Structured paths to real skills"
        description="Follow a clear sequence of modules, track your progress and build something new at every step."
        action={
          <Link to="/learn" className="btn-secondary">
            Browse all roadmaps
          </Link>
        }
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ROADMAPS.map((roadmap, index) => (
          <Reveal key={roadmap.id} delay={index * 90}>
            <RoadmapCard roadmap={roadmap} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const PILLARS = [
  { icon: Compass, title: 'Discover', text: 'Find opportunities in one place.' },
  { icon: BookOpen, title: 'Learn', text: 'Follow structured learning journeys.' },
  { icon: TrendingUp, title: 'Grow', text: 'Develop skills through practical experiences.' },
  { icon: Users, title: 'Together', text: 'Discover a community of ambitious people.' },
];

export function WhyAikya() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Why AIKYA" title="Everything you need to move forward" align="center" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <Reveal key={pillar.title} delay={index * 80}>
              <div className="card-interactive group h-full p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet/25 to-electric/25 text-violet-accent transition duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="eyebrow mt-6">{pillar.title}</p>
                <p className="mt-2 text-base leading-relaxed text-ink">{pillar.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] border border-line/10 bg-card px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-violet/20 blur-[100px]" />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Your next opportunity could change everything.
          </h2>
          <div className="relative mt-8 flex justify-center">
            <Link to="/events" className="btn-primary group">
              Start Exploring
              <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
