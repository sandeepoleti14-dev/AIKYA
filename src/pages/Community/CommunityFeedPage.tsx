import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CommunityOpportunityCard } from '@/pages/Community/CommunityComponents';
import { communityRequest, type CommunityFeedItem } from '@/services/communityApi';

type Category = 'events' | 'workshops' | 'hackathons' | 'courses';
const categories: { id: Category; label: string; subcategories: string[] }[] = [
  { id: 'events', label: 'Events', subcategories: ['Tech events', 'MNC events', 'Developer community events', 'Conferences', 'Meetups'] },
  { id: 'workshops', label: 'Workshops', subcategories: ['Technical workshops', 'Webinars', 'Bootcamps', 'Hands-on sessions'] },
  { id: 'hackathons', label: 'Hackathons', subcategories: ['AI/ML', 'Cybersecurity', 'Cloud', 'Software development', 'Other technical competitions'] },
  { id: 'courses', label: 'Courses & Certifications', subcategories: ['Free courses', 'Paid courses', 'Certifications', 'Digital badges', 'Learning paths'] },
];
const domains = ['AI/ML', 'Cybersecurity', 'Cloud', 'Software development', 'Data science', 'Design', 'Open source', 'Mobile development'];

export default function CommunityFeedPage({ category }: { category?: Category }) {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<CommunityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('');
  const [mode, setMode] = useState('');
  const [feeType, setFeeType] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [from, setFrom] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const activeCategory = categories.find((item) => item.id === category);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    const query = new URLSearchParams({ limit: '30', ...filters });
    if (category) query.set('category', category);
    communityRequest<{ items: CommunityFeedItem[] }>(`/community/feed?${query}`)
      .then((result) => {
        if (active) setItems(result.items);
      })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load community listings.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [category, filters]);

  useEffect(() => {
    const postId = searchParams.get('post');
    if (!postId || loading) return;
    window.setTimeout(() => document.getElementById(`community-post-${postId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }, [items, loading, searchParams]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (domain) next.domain = domain;
    if (location.trim()) next.location = location.trim();
    if (mode) next.mode = mode;
    if (feeType) next.feeType = feeType;
    if (subcategory) next.subcategory = subcategory;
    if (from) next.from = from;
    setFilters(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Community discovery</p>
          <h2 className="text-2xl font-bold text-ink">{activeCategory?.label ?? 'Community Feed'}</h2>
          <p className="mt-2 text-sm text-muted">Only opportunities approved by Aikya moderators appear here.</p>
        </div>
        <Link to="/community/share" className="btn-primary">Share an Opportunity</Link>
      </div>

      <nav aria-label="Community opportunity categories" className="flex flex-wrap gap-2">
        <Link to="/community" className={`chip ${!category ? 'border-violet/40 bg-violet/15 text-ink' : ''}`}>All</Link>
        {categories.map((item) => (
          <Link key={item.id} to={`/community/${item.id}`} className={`chip ${category === item.id ? 'border-violet/40 bg-violet/15 text-ink' : ''}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      <form onSubmit={applyFilters} className="card grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {activeCategory && (
          <label className="text-xs font-medium text-muted">
            {activeCategory.id === 'courses' ? 'Course / certification type' : `${activeCategory.label} type`}
            <select className="field mt-1.5" value={subcategory} onChange={(event) => setSubcategory(event.target.value)}>
              <option value="">All types</option>
              {activeCategory.subcategories.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
        )}
        <label className="text-xs font-medium text-muted">
          Domain
          <select className="field mt-1.5" value={domain} onChange={(event) => setDomain(event.target.value)}>
            <option value="">All domains</option>
            {domains.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Location
          <input className="field mt-1.5" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or region" />
        </label>
        <label className="text-xs font-medium text-muted">
          Format
          <select className="field mt-1.5" value={mode} onChange={(event) => setMode(event.target.value)}>
            <option value="">Any format</option><option>Online</option><option>Offline</option><option>Hybrid</option>
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Price
          <select className="field mt-1.5" value={feeType} onChange={(event) => setFeeType(event.target.value)}>
            <option value="">Any price</option><option value="free">Free</option><option value="paid">Paid</option><option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="text-xs font-medium text-muted">
          Starting after
          <input type="date" className="field mt-1.5" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <button type="submit" className="btn-secondary self-end">Apply filters</button>
      </form>

      {error && <div role="alert" className="rounded-2xl border border-warning/25 bg-warning/5 p-5 text-sm text-muted">{error}</div>}
      {loading ? (
        <p role="status" className="py-8 text-center text-sm text-muted">Loading approved community opportunities…</p>
      ) : items.length > 0 ? (
        <div className="space-y-5">{items.map((item) => <CommunityOpportunityCard key={item.postId} item={item} />)}</div>
      ) : !error ? (
        <div className="card p-8 text-center">
          <h3 className="text-lg font-semibold text-ink">No approved opportunities match yet</h3>
          <p className="mt-2 text-sm text-muted">Try another filter or share a genuine opportunity for review.</p>
          <Link to="/community/share" className="btn-primary mt-5">Share an Opportunity</Link>
        </div>
      ) : null}
    </div>
  );
}
