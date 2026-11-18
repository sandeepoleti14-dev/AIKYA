import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center animate-fade-up">
      <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet/15 text-violet-accent">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="eyebrow mb-3">Error 404</p>
      <h1 className="text-4xl font-bold tracking-tight text-ink">We could not find that page</h1>
      <p className="mt-4 text-muted">The link may be outdated, or the page may have moved.</p>
      <Link to="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </div>
  );
}
