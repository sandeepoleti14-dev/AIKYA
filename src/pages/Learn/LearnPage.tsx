import { Link } from 'react-router-dom';
import RoadmapCard from '@/components/ui/RoadmapCard';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import { LEARN_CATEGORIES } from '@/data/categories';
import { LEARNING_SOURCES } from '@/data/officialSources';
import { ROADMAPS } from '@/data/roadmaps';
import OfficialCatalogSection from '@/components/ui/OfficialCatalogSection';

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow mb-3">Learn</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Build Skills. Create Possibilities.</h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Follow Aikya learning paths or open an official provider catalog. Check the provider for fees, certification terms, and availability.
        </p>
      </header>

      <OfficialCatalogSection
        title="Official learning catalogs"
        description="Providers may offer both free and paid material. Aikya links to their catalogs but does not claim individual items are free."
        sources={LEARNING_SOURCES}
      />

      <section className="space-y-8">
        <SectionHeading title="Learning categories" description="Roadmaps are available for the highlighted fields. More are on the way." />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {LEARN_CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            const roadmapCount = ROADMAPS.filter((roadmap) => roadmap.category === category.id).length;
            const available = roadmapCount > 0;
            const content = (
              <>
                <Icon className={`h-5 w-5 ${available ? 'text-violet-accent' : 'text-muted'}`} aria-hidden="true" />
                <p className="mt-4 text-sm font-bold text-ink">{category.label}</p>
                <p className="mt-1 text-xs text-muted">{available ? `${roadmapCount} roadmap` : 'Coming soon'}</p>
              </>
            );
            return (
              <Reveal key={category.id} delay={(index % 5) * 60}>
                {available ? (
                  <Link
                    to={`/learn/${ROADMAPS.find((roadmap) => roadmap.category === category.id)!.id}`}
                    className="card-interactive block h-full p-5"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="card h-full p-5 opacity-60">{content}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="space-y-8">
        <SectionHeading title="Learning roadmaps" description="Step-by-step paths with objectives, resources and practical tasks." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ROADMAPS.map((roadmap, index) => (
            <Reveal key={roadmap.id} delay={index * 80}>
              <RoadmapCard roadmap={roadmap} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
