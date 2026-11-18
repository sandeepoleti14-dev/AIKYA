import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroScene from '@/pages/Home/HeroScene';
import SearchField from '@/components/layout/SearchField';
import { useApp } from '@/hooks/useApp';

export default function HeroSection() {
  const { profile } = useApp();
  const firstName = profile.name.trim().split(/\s+/)[0];

  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-violet/15 blur-[120px]" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 md:pt-20 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-28">
        <div className="max-w-xl">
          <span className="chip animate-fade-up mb-6 border-violet/30 text-violet-accent" style={{ animationDelay: '0.1s' }}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            India-first opportunity discovery
          </span>
          <h1 className="animate-fade-up text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl" style={{ animationDelay: '0.2s' }}>
            Welcome{firstName ? ` back, ${firstName}` : ' to AIKYA'}
          </h1>
          <p className="mt-6 animate-fade-up text-base leading-relaxed text-muted sm:text-lg" style={{ animationDelay: '0.3s' }}>
            Discover opportunities. Build skills. Connect with the tech community.
          </p>
          <div className="mt-8 max-w-xl animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <SearchField placeholder="Search hackathons, events, contests and learning..." />
          </div>
          <div className="mt-5 flex animate-fade-up flex-col gap-3 sm:flex-row" style={{ animationDelay: '0.5s' }}>
            <Link to="/events" className="btn-primary group">
              Explore opportunities
              <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link to="/dashboard/settings" className="btn-secondary">
              Choose your interests
            </Link>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
