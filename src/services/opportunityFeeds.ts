import type { Listing } from '@/types';

const PRETALX_EVENTS_URL = 'https://pretalx.com/api/events/?is_public=true';
const CODEFORCES_CONTESTS_URL = 'https://codeforces.com/api/contest.list?gym=false';
const REQUEST_TIMEOUT_MS = 12_000;
const MAX_PRETALX_PAGES = 10;
let opportunityFeedsRequest: Promise<OpportunityFeedsResult> | undefined;

export interface OpportunitySourceStatus {
  id: string;
  name: string;
  status: 'loaded' | 'error';
  count: number;
  checkedAt: string;
  skippedCount?: number;
  error?: string;
}

export interface OpportunityFeedsResult {
  listings: Listing[];
  sources: OpportunitySourceStatus[];
}

interface SourceFetchResult {
  listings: Listing[];
  skippedCount?: number;
}

interface PretalxEvent {
  name: string | Record<string, unknown>;
  slug: string;
  is_public: boolean;
  date_from: string;
  date_to: string;
  timezone: string;
  custom_domain?: string | null;
}

interface CodeforcesContest {
  id: number;
  name: string;
  phase: string;
  durationSeconds: number;
  startTimeSeconds?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDateOnly(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isPretalxEvent(value: unknown): value is PretalxEvent {
  if (!isRecord(value)) return false;
  const nameIsValid =
    (typeof value.name === 'string' && value.name.trim().length > 0) ||
    (isRecord(value.name) &&
      Object.values(value.name).some((entry) => typeof entry === 'string' && entry.trim().length > 0));

  return (
    nameIsValid &&
    typeof value.slug === 'string' &&
    typeof value.is_public === 'boolean' &&
    isDateOnly(value.date_from) &&
    isDateOnly(value.date_to) &&
    typeof value.timezone === 'string' &&
    (value.custom_domain === undefined || value.custom_domain === null || typeof value.custom_domain === 'string')
  );
}

function eventName(value: PretalxEvent['name']): string {
  if (typeof value === 'string') return value.trim();
  const englishName = value.en;
  if (typeof englishName === 'string' && englishName.trim()) return englishName.trim();
  const firstName = Object.values(value).find((entry): entry is string => typeof entry === 'string' && !!entry.trim());
  return firstName?.trim() ?? '';
}

function safeHttpsUrl(value: string, fallback: string): string {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function pretalxEventUrl(event: PretalxEvent): string {
  const fallback = `https://pretalx.com/${encodeURIComponent(event.slug)}/`;
  return event.custom_domain ? safeHttpsUrl(event.custom_domain, fallback) : fallback;
}

function asListing(event: PretalxEvent, fetchedAt: string): Listing | undefined {
  const title = eventName(event.name);
  const indiaReference = `${title} ${event.slug}`.toLowerCase().includes('india');
  if (!event.is_public || !indiaReference || event.timezone !== 'Asia/Kolkata' || event.date_to < new Date().toISOString().slice(0, 10)) {
    return undefined;
  }

  const url = pretalxEventUrl(event);
  return {
    id: `pretalx-${event.slug}`,
    kind: 'opportunity',
    title,
    organization: 'Organizer not specified',
    orgMark: 'P',
    orgTone: 'violet',
    category: /workshop/i.test(title) ? 'workshops' : 'conferences',
    summary: 'Public event listing scheduled in an India time zone. Venue, registration, fees, and eligibility are not specified by the public feed.',
    description: 'This listing comes from the public Pretalx events feed. Open the event page to confirm the venue, registration details, fees, and eligibility with the organizer.',
    eligibility: [],
    skills: [],
    benefits: [],
    instructions: [],
    location: 'Venue not specified',
    mode: 'Not specified',
    level: 'Not specified',
    duration: 'Not specified',
    startDate: event.date_from,
    endDate: event.date_to,
    sourceUrl: url,
    applyUrl: url,
    sourceName: 'Pretalx',
    sourceId: event.slug,
    sourceType: 'public-api',
    verificationStatus: 'Pending Verification',
    lastFetchedAt: fetchedAt,
    domains: [],
    featured: false,
  };
}

function getPretalxPage(payload: unknown): { events: unknown[]; next?: string | null } {
  if (Array.isArray(payload)) return { events: payload };
  if (!isRecord(payload) || !Array.isArray(payload.results)) {
    throw new Error('Pretalx response did not contain a valid public events list.');
  }
  if (payload.next !== undefined && payload.next !== null && typeof payload.next !== 'string') {
    throw new Error('Pretalx response contained an invalid pagination link.');
  }
  return { events: payload.results, next: payload.next as string | null | undefined };
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed with HTTP ${response.status}.`);
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Request timed out.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function nextPretalxUrl(next: string, currentUrl: string): string {
  const url = new URL(next, currentUrl);
  if (url.protocol !== 'https:' || url.hostname !== 'pretalx.com') {
    throw new Error('Pretalx returned an unexpected pagination host.');
  }
  return url.toString();
}

async function fetchPretalxEvents(fetchedAt: string): Promise<SourceFetchResult> {
  const records: unknown[] = [];
  const visited = new Set<string>();
  let url: string | undefined = PRETALX_EVENTS_URL;

  for (let page = 0; url && page < MAX_PRETALX_PAGES; page += 1) {
    if (visited.has(url)) throw new Error('Pretalx pagination returned a repeated page.');
    visited.add(url);
    const pageData = getPretalxPage(await fetchJson(url));
    records.push(...pageData.events);
    url = pageData.next ? nextPretalxUrl(pageData.next, url) : undefined;
  }

  if (url) throw new Error(`Pretalx feed exceeded the ${MAX_PRETALX_PAGES}-page safety limit.`);
  const validRecords = records.filter(isPretalxEvent);
  const skippedCount = records.length - validRecords.length;
  if (records.length > 0 && validRecords.length === 0) {
    throw new Error('Pretalx response contained no usable event records.');
  }

  const today = new Date().toISOString().slice(0, 10);
  const listings = validRecords
    .filter((event) => event.is_public && event.date_to >= today)
    .map((event) => asListing(event, fetchedAt))
    .filter((listing): listing is Listing => listing !== undefined);
  return { listings, skippedCount };
}

function isCodeforcesContest(value: unknown): value is CodeforcesContest {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    typeof value.phase === 'string' &&
    typeof value.durationSeconds === 'number' &&
    (value.startTimeSeconds === undefined || typeof value.startTimeSeconds === 'number')
  );
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours && minutes) return `${hours}h ${minutes}m`;
  if (hours) return `${hours}h`;
  return `${minutes}m`;
}

async function fetchCodeforcesContests(fetchedAt: string): Promise<Listing[]> {
  const payload = await fetchJson(CODEFORCES_CONTESTS_URL);
  if (!isRecord(payload) || payload.status !== 'OK' || !Array.isArray(payload.result)) {
    throw new Error('Codeforces response did not contain a valid contest list.');
  }
  if (!payload.result.every(isCodeforcesContest)) {
    throw new Error('Codeforces response contained an invalid contest record.');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return payload.result
    .filter(
      (contest): contest is CodeforcesContest & { startTimeSeconds: number } =>
        contest.phase === 'BEFORE' &&
        typeof contest.startTimeSeconds === 'number' &&
        contest.startTimeSeconds > nowSeconds,
    )
    .map((contest) => {
      const start = new Date(contest.startTimeSeconds * 1000);
      const end = new Date(start.getTime() + contest.durationSeconds * 1000);
      const url = `https://codeforces.com/contest/${contest.id}`;
      return {
        id: `codeforces-${contest.id}`,
        kind: 'opportunity',
        title: contest.name,
        organization: 'Codeforces',
        orgMark: 'CF',
        orgTone: 'electric',
        category: 'competitions',
        summary: 'Official online programming contest listed by Codeforces.',
        description: 'Contest schedule is provided by the official Codeforces API. Check the Codeforces contest page for rules, eligibility, registration, and any updates.',
        eligibility: [],
        skills: ['Programming'],
        benefits: [],
        instructions: [],
        location: 'Online',
        mode: 'Online',
        level: 'Not specified',
        duration: formatDuration(contest.durationSeconds),
        startDate: dateOnly(start),
        endDate: dateOnly(end),
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        sourceUrl: url,
        applyUrl: url,
        sourceName: 'Codeforces API',
        sourceId: String(contest.id),
        sourceType: 'public-api',
        verificationStatus: 'Verified',
        lastFetchedAt: fetchedAt,
        lastVerifiedAt: fetchedAt,
        domains: ['Software Development'],
        featured: false,
      };
    });
}

async function requestOpportunityFeeds(): Promise<OpportunityFeedsResult> {
  const fetchedAt = new Date().toISOString();
  const providers = [
    { id: 'pretalx', name: 'Pretalx', fetch: () => fetchPretalxEvents(fetchedAt) },
    {
      id: 'codeforces',
      name: 'Codeforces',
      fetch: async (): Promise<SourceFetchResult> => ({ listings: await fetchCodeforcesContests(fetchedAt) }),
    },
  ];
  const results = await Promise.allSettled(providers.map((provider) => provider.fetch()));
  const listings: Listing[] = [];
  const sources: OpportunitySourceStatus[] = [];

  results.forEach((result, index) => {
    const provider = providers[index];
    if (result.status === 'fulfilled') {
      listings.push(...result.value.listings);
      sources.push({
        id: provider.id,
        name: provider.name,
        status: 'loaded',
        count: result.value.listings.length,
        skippedCount: result.value.skippedCount,
        checkedAt: fetchedAt,
      });
      return;
    }

    const reason = result.reason;
    sources.push({
      id: provider.id,
      name: provider.name,
      status: 'error',
      count: 0,
      checkedAt: fetchedAt,
      error: reason instanceof Error ? reason.message : `${provider.name} feed request failed.`,
    });
  });

  const uniqueListings = Array.from(new Map(listings.map((listing) => [listing.id, listing])).values());
  return { listings: uniqueListings, sources };
}

export function fetchOpportunityFeeds(): Promise<OpportunityFeedsResult> {
  if (!opportunityFeedsRequest) {
    opportunityFeedsRequest = requestOpportunityFeeds().finally(() => {
      opportunityFeedsRequest = undefined;
    });
  }
  return opportunityFeedsRequest;
}
