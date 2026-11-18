import { RotateCcw, Search } from 'lucide-react';
import type { Category, Listing } from '@/types';
import { DEFAULT_FILTERS } from '@/utils/filterParams';
import { uniqueValues, type ListingFilters } from '@/utils/listings';

interface ListingFilterBarProps {
  filters: ListingFilters;
  onChange: (patch: Partial<ListingFilters>) => void;
  onReset: () => void;
  categories: Category[];
  categoryLabel: string;
  listings: Listing[];
}

const DEADLINE_OPTIONS = [
  { value: 'all', label: 'Any deadline' },
  { value: '7', label: 'Next 7 days' },
  { value: '30', label: 'Next 30 days' },
  { value: '90', label: 'Next 90 days' },
];

const MODE_OPTIONS = [
  { value: 'all', label: 'Online and offline' },
  { value: 'Online', label: 'Online' },
  { value: 'Offline', label: 'Offline' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Not specified', label: 'Not specified' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Any status' },
  { value: 'open', label: 'Open' },
  { value: 'closing-soon', label: 'Closing soon' },
];

const LEVEL_OPTIONS = [
  { value: 'all', label: 'Any level' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
  { value: 'Not specified', label: 'Not specified' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'deadline', label: 'Upcoming deadline' },
];

export default function ListingFilterBar({
  filters,
  onChange,
  onReset,
  categories,
  categoryLabel,
  listings,
}: ListingFilterBarProps) {
  const locations = uniqueValues(listings, (listing) => listing.location);
  const organizations = uniqueValues(listings, (listing) => listing.organization);
  const isDirty = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder="Search by name, organisation or skill"
          aria-label="Search by name"
          className="field py-3 pl-11"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField label={categoryLabel} value={filters.category} onChange={(value) => onChange({ category: value })}>
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Location" value={filters.location} onChange={(value) => onChange({ location: value })}>
          <option value="all">Any location</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </SelectField>
        <SelectField label="Mode" value={filters.mode} onChange={(value) => onChange({ mode: value })}>
          {MODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Deadline" value={filters.deadline} onChange={(value) => onChange({ deadline: value as ListingFilters['deadline'] })}>
          {DEADLINE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Organisation" value={filters.organization} onChange={(value) => onChange({ organization: value })}>
          <option value="all">All organisations</option>
          {organizations.map((organization) => (
            <option key={organization} value={organization}>
              {organization}
            </option>
          ))}
        </SelectField>
        <SelectField label="Level" value={filters.level} onChange={(value) => onChange({ level: value })}>
          {LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Status" value={filters.status} onChange={(value) => onChange({ status: value })}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
        <SelectField label="Sort by" value={filters.sort} onChange={(value) => onChange({ sort: value as ListingFilters['sort'] })}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>

      {isDirty && (
        <div className="flex justify-end">
          <button type="button" onClick={onReset} className="btn-ghost">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="field appearance-none py-2.5">
        {children}
      </select>
    </label>
  );
}
