import ListingsBrowser from '@/components/filters/ListingsBrowser';
import GreenhouseJobsNotice from '@/components/ui/GreenhouseJobsNotice';
import SectionHeading from '@/components/ui/SectionHeading';
import { JOB_CATEGORIES } from '@/data/categories';
import { useApp } from '@/hooks/useApp';

export default function JobsPage() {
  const { greenhouseJobs, greenhouseJobsLoading, greenhouseJobsError } = useApp();

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 lg:px-8">
      <header className="max-w-3xl animate-fade-up">
        <p className="eyebrow mb-3">Secondary section</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">India-based jobs</h1>
        <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
          Live listings from GitLab and HackerRank. Aikya links to each company’s official application page.
        </p>
      </header>
      <GreenhouseJobsNotice count={greenhouseJobs.length} loading={greenhouseJobsLoading} error={greenhouseJobsError} />
      <SectionHeading title="GitLab and HackerRank" description="Job listings are separate from events, hackathons, and learning." />
      <ListingsBrowser
        listings={greenhouseJobs}
        categories={JOB_CATEGORIES}
        categoryLabel="Listing type"
        loading={greenhouseJobsLoading}
        sourceNote="India-based Greenhouse listings"
      />
    </div>
  );
}
