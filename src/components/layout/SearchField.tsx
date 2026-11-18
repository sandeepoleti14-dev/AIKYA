import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

interface SearchFieldProps {
  onSubmitted?: () => void;
  className?: string;
  placeholder?: string;
}

export default function SearchField({ onSubmitted, className = '', placeholder = 'Search events, contests and learning' }: SearchFieldProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/events?q=${encodeURIComponent(term)}` : '/events');
    setQuery('');
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} role="search" className={`relative flex items-center ${className}`}>
      <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="Search opportunities"
        className="field h-10 rounded-full py-2 pl-10 pr-10 text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          aria-label="Clear search"
          className="absolute right-2.5 rounded-full p-1 text-muted transition hover:text-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
