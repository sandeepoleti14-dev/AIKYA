interface GreenhouseJobsNoticeProps {
  count: number;
  loading: boolean;
  error: string | null;
}

export default function GreenhouseJobsNotice({ count, loading, error }: GreenhouseJobsNoticeProps) {
  if (loading) {
    return (
      <p role="status" className="text-sm text-muted">
        Loading India-based jobs from GitLab and HackerRank...
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-danger">
        Some India-based Greenhouse job listings could not be loaded: {error}
      </p>
    );
  }

  return (
    <p className="text-sm text-muted">
      {count} live India-based {count === 1 ? 'job' : 'jobs'} from GitLab and HackerRank. Apply through the official link.
    </p>
  );
}
