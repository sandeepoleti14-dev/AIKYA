import { BookOpen, Calendar, Compass, GraduationCap, Layers, Map, Sparkles, Target } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';

const PILLARS = [
  {
    icon: Compass,
    title: 'Discover',
    text: 'Browse available public event and contest feeds, plus direct links to official provider catalogs.',
  },
  {
    icon: Map,
    title: 'Prepare',
    text: 'Use Aikya learning paths to build skills; confirm opportunity details with the official organizer.',
  },
  {
    icon: Sparkles,
    title: 'Act',
    text: 'Save listings locally and continue to the official source for current registration information.',
  },
];

const OFFERINGS = [
  { icon: Calendar, title: 'Events and contests', text: 'Listings from the public Pretalx and Codeforces feeds, with source status shown.' },
  { icon: GraduationCap, title: 'Official catalogs', text: 'Direct provider links where a public Aikya listing feed is not confirmed.' },
  { icon: BookOpen, title: 'Learning roadmaps', text: 'Aikya learning paths with steps, resources, and local progress tracking.' },
  { icon: Layers, title: 'Personal dashboard', text: 'Saved listings, interests, and learning progress stored in this browser.' },
];

const DIRECTION = [
  'Public event feeds are limited; listings show their source and may require organizer confirmation.',
  'Some provider directories are links only because no authorized public listing API is confirmed.',
  'Profile, interests, saved listings, and progress currently stay in this browser.',
  'Accounts, a persistent database, source verification workflow, and admin tools require a configured backend.',
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <header className="mx-auto max-w-3xl text-center animate-fade-up">
        <p className="eyebrow mb-3">About AIKYA</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Opportunity should not depend on who you already know.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
          AIKYA brings events, programmes and learning paths into one calm, honest space, so people can find their next
          step and take it.
        </p>
      </header>

      <section aria-labelledby="vision-heading" className="grid gap-6 lg:grid-cols-2">
        <Reveal className="card p-8 sm:p-10">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet/15 text-violet">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 id="vision-heading" className="text-2xl font-bold text-ink">Our vision</h2>
          <p className="mt-4 leading-relaxed text-muted">
            A world where every curious person can see the doors that are open to them, and walk through them with a clear
            plan. Aikya means unity, and we want the opportunity ecosystem to feel connected rather than scattered.
          </p>
        </Reveal>
        <Reveal className="card p-8 sm:p-10" delay={120}>
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-electric/15 text-electric">
            <Target className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="text-2xl font-bold text-ink">Our mission</h2>
          <p className="mt-4 leading-relaxed text-muted">
            To make opportunities easier to find, easier to understand and easier to act on. We bring together what is
            happening, what is open and how to prepare, without noise or pressure.
          </p>
        </Reveal>
      </section>

      <section aria-labelledby="why-heading" className="space-y-10">
        <SectionHeading
          eyebrow="Why AIKYA"
          title="Three steps from curiosity to action"
          description="Most people do not miss opportunities because they lack talent. They miss them because the information is scattered and the next step is unclear."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 120} className="card-interactive p-7">
              <pillar.icon className="h-7 w-7 text-electric" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold text-ink">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{pillar.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="offer-heading" className="space-y-10">
        <SectionHeading eyebrow="What we offer" title="Everything you need in one place" />
        <div className="grid gap-6 sm:grid-cols-2">
          {OFFERINGS.map((item, index) => (
            <Reveal key={item.title} delay={index * 90} className="card flex gap-5 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet/15 text-violet">
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="direction-heading" className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Reveal className="space-y-5">
          <p className="eyebrow">Long-term direction</p>
          <h2 id="direction-heading" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Where we are taking AIKYA
          </h2>
          <p className="leading-relaxed text-muted">
            AIKYA is an early India-first product. Its event and contest records come from public feeds, while listings
            from providers without a confirmed public API are not fabricated. GitLab and HackerRank jobs are available
            separately as a secondary section.
          </p>
        </Reveal>
        <Reveal delay={120}>
          <ul className="space-y-4">
            {DIRECTION.map((item) => (
              <li key={item} className="card flex items-start gap-4 p-5">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-gradient-to-r from-violet to-electric" aria-hidden="true" />
                <span className="text-sm leading-relaxed text-ink">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </div>
  );
}
