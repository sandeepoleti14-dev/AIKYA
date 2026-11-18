import type { Listing, Mode } from '@/types';

const GREENHOUSE_BOARDS = [
  { token: 'gitlab', name: 'GitLab', mark: 'GL', url: 'https://boards-api.greenhouse.io/v1/boards/gitlab/jobs?content=true' },
  { token: 'hackerrank', name: 'HackerRank', mark: 'HR', url: 'https://boards-api.greenhouse.io/v1/boards/hackerrank/jobs?content=true' },
] as const;
let greenhouseJobsRequest: Promise<GreenhouseJobsResult> | undefined;

export interface GreenhouseJobsResult {
  jobs: Listing[];
  errors: string[];
}

interface GreenhouseJob {
  id: number | string;
  title: string;
  absolute_url: string;
  company_name?: string;
  location?: string | { name?: string };
  application_deadline?: string | null;
  first_published?: string | null;
  updated_at?: string | null;
  content?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGreenhouseJob(value: unknown): value is GreenhouseJob {
  if (!isRecord(value)) return false;
  const optionalString = (field: unknown) => field === undefined || field === null || typeof field === 'string';
  const locationIsValid =
    value.location === undefined ||
    typeof value.location === 'string' ||
    (isRecord(value.location) && optionalString(value.location.name));

  return (
    (typeof value.id === 'number' || typeof value.id === 'string') &&
    typeof value.title === 'string' &&
    typeof value.absolute_url === 'string' &&
    optionalString(value.company_name) &&
    locationIsValid &&
    optionalString(value.application_deadline) &&
    optionalString(value.first_published) &&
    optionalString(value.updated_at) &&
    optionalString(value.content)
  );
}

function officialUrl(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Greenhouse job data included a non-secure job URL.');
  return url.toString();
}

function dateOnly(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value.slice(0, 10);
  return Number.isNaN(new Date(`${date}T00:00:00`).getTime()) ? undefined : date;
}

function shortenText(value: string, maxLength: number): string {
  const text = value.replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;

  const excerpt = text.slice(0, maxLength + 1);
  const sentenceEnd = excerpt.lastIndexOf('. ');
  if (sentenceEnd >= maxLength * 0.55) return excerpt.slice(0, sentenceEnd + 1);

  const wordEnd = excerpt.lastIndexOf(' ');
  return `${excerpt.slice(0, wordEnd).trimEnd()}…`;
}

function getMode(location: string): Mode {
  const modes = new Set<Mode>();
  if (/\bremote\b/i.test(location)) modes.add('Online');
  if (/\bhybrid\b/i.test(location)) modes.add('Hybrid');
  if (/\b(in[- ]office|on[- ]?site|office)\b/i.test(location)) modes.add('Offline');
  return modes.size === 1 ? Array.from(modes)[0] : 'Not specified';
}

function extractJobContent(
  content: string | null | undefined,
  companyName: string,
): { summary: string; description: string } {
  if (!content) {
    return {
      summary: `View the official ${companyName} listing for job details.`,
      description: `View the official ${companyName} listing for job details.`,
    };
  }

  const textarea = document.createElement('textarea');
  textarea.innerHTML = content;
  const parsed = new DOMParser().parseFromString(textarea.value, 'text/html');
  const text = (element: Element | null | undefined) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
  const overviewHeading = Array.from(parsed.querySelectorAll('h1, h2, h3, h4')).find((heading) =>
    /(overview of this role|about (the|this) role|role overview)/i.test(text(heading)),
  );
  const roleOverview =
    text(overviewHeading?.nextElementSibling) ||
    Array.from(parsed.querySelectorAll('p')).map(text).find(Boolean) ||
    `View the official ${companyName} listing for job details.`;

  return {
    summary: shortenText(roleOverview, 180),
    description: shortenText(roleOverview, 320),
  };
}

function toListing(job: GreenhouseJob, board: (typeof GREENHOUSE_BOARDS)[number]): Listing {
  const location =
    (typeof job.location === 'string' ? job.location : job.location?.name)?.trim() || 'Not specified';
  const companyName = job.company_name?.trim() || board.name;
  const officialJobUrl = officialUrl(job.absolute_url);
  const { summary, description } = extractJobContent(job.content, companyName);

  return {
    id: `${board.token}-${job.id}`,
    kind: 'opportunity',
    title: job.title,
    organization: companyName,
    orgMark: board.mark,
    orgTone: 'electric',
    category: 'jobs',
    summary,
    description,
    eligibility: [],
    skills: [],
    benefits: [],
    instructions: [],
    location,
    mode: getMode(location),
    level: 'Not specified',
    duration: 'Not specified',
    deadline: dateOnly(job.application_deadline),
    startDate: undefined,
    postedAt: dateOnly(job.first_published) ?? dateOnly(job.updated_at),
    postedAtLabel: dateOnly(job.first_published) ? 'First published' : 'Last updated',
    sourceUrl: officialJobUrl,
    applyUrl: officialJobUrl,
    featured: false,
    isLive: true,
  };
}

async function requestBoardJobs(board: (typeof GREENHOUSE_BOARDS)[number]): Promise<Listing[]> {
  const response = await fetch(board.url);
  if (!response.ok) {
    throw new Error(`${board.name} jobs request failed with HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.jobs)) {
    throw new Error(`${board.name} jobs response did not contain a jobs list.`);
  }
  if (!payload.jobs.every(isGreenhouseJob)) {
    throw new Error(`${board.name} jobs response contained an invalid job record.`);
  }

  return payload.jobs
    .filter((job) =>
      /\bindia\b/i.test(typeof job.location === 'string' ? job.location : job.location?.name ?? ''),
    )
    .map((job) => toListing(job, board));
}

async function requestGreenhouseJobs(): Promise<GreenhouseJobsResult> {
  const results = await Promise.allSettled(GREENHOUSE_BOARDS.map(requestBoardJobs));
  const jobs: Listing[] = [];
  const errors: string[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      jobs.push(...result.value);
      return;
    }

    const reason = result.reason;
    errors.push(reason instanceof Error ? reason.message : `${GREENHOUSE_BOARDS[index].name} jobs request failed.`);
  });

  return { jobs, errors };
}

export function fetchGreenhouseJobs(): Promise<GreenhouseJobsResult> {
  if (!greenhouseJobsRequest) {
    greenhouseJobsRequest = requestGreenhouseJobs().catch((error: unknown) => {
      greenhouseJobsRequest = undefined;
      throw error;
    });
  }
  return greenhouseJobsRequest;
}
