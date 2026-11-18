import { isIP } from 'node:net';
import { z } from 'zod';

const privateHostnames = new Set(['localhost', 'localhost.localdomain', '0.0.0.0', '::1']);
const shortenerHosts = new Set([
  'bit.ly',
  't.co',
  'tinyurl.com',
  'tinyurl.co',
  'goo.gl',
  'buff.ly',
  'ow.ly',
  'is.gd',
  'cutt.ly',
  'rebrand.ly',
  'shorturl.at',
]);

export function normalizeOpportunityUrl(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Only HTTP and HTTPS opportunity URLs are allowed.');
  }
  if (url.username || url.password) throw new Error('URLs containing embedded credentials are not allowed.');

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const unwrappedHostname = hostname.replace(/^\[|\]$/g, '');
  if (shortenerHosts.has(unwrappedHostname)) {
    throw new Error('Shortened URLs are not accepted. Provide the organizer’s full destination URL.');
  }
  if (
    privateHostnames.has(unwrappedHostname) ||
    isIP(unwrappedHostname) ||
    /\.(local|internal|test|localhost)$/i.test(unwrappedHostname)
  ) {
    throw new Error('Use a public website URL, not a local or IP address.');
  }

  url.hostname = hostname;
  url.hash = '';
  for (const key of Array.from(url.searchParams.keys())) {
    if (/^(utm_.+|fbclid|gclid|mc_cid|mc_eid)$/i.test(key)) url.searchParams.delete(key);
  }
  const searchEntries = Array.from(url.searchParams.entries()).sort(([keyA, valueA], [keyB, valueB]) =>
    keyA.localeCompare(keyB) || valueA.localeCompare(valueB),
  );
  url.search = '';
  searchEntries.forEach(([key, value]) => url.searchParams.append(key, value));
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.toString();
}

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(10).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
  displayName: z.string().trim().min(1).max(80),
});

export const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(320),
  domains: z.array(z.string().trim().min(1).max(50)).max(12),
  academicYear: z.string().trim().max(40).optional(),
  avatarPath: z.string().regex(/^\/uploads\/[a-f0-9-]+\.(png|jpe?g|webp)$/i).nullable().optional(),
  publicProfile: z.boolean(),
  showDomains: z.boolean(),
  showAcademicYear: z.boolean(),
}).strict();

export const submissionSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(['events', 'workshops', 'hackathons', 'courses']),
  subcategory: z.string().trim().min(1).max(80),
  domains: z.array(z.string().trim().min(1).max(50)).max(12).default([]),
  organizerName: z.string().trim().max(120).default(''),
  officialUrl: z.string().trim().url().optional().or(z.literal('')),
  registrationUrl: z.string().trim().url().optional().or(z.literal('')),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  mode: z.enum(['Online', 'Offline', 'Hybrid', 'Not specified']).default('Not specified'),
  location: z.string().trim().max(160).default(''),
  feeType: z.enum(['free', 'paid', 'unknown']).default('unknown'),
  certificateStatus: z.enum(['available', 'not_offered', 'unknown']).default('unknown'),
  goodiesOrPrizes: z.enum(['yes', 'no', 'unknown']).default('unknown'),
  eligibility: z.string().trim().max(1000).default(''),
  posterPath: z.string().regex(/^\/uploads\/[a-f0-9-]+\.(png|jpe?g|webp)$/i).optional(),
}).strict().superRefine((value, context) => {
  const subcategories = {
    events: ['Tech events', 'MNC events', 'Developer community events', 'Conferences', 'Meetups'],
    workshops: ['Technical workshops', 'Webinars', 'Bootcamps', 'Hands-on sessions'],
    hackathons: ['AI/ML', 'Cybersecurity', 'Cloud', 'Software development', 'Other technical competitions'],
    courses: ['Free courses', 'Paid courses', 'Certifications', 'Digital badges', 'Learning paths'],
  } as const;
  const allowedSubcategories: readonly string[] = subcategories[value.category];
  if (!allowedSubcategories.includes(value.subcategory)) {
    context.addIssue({ code: 'custom', message: 'Choose a category type from the available options.', path: ['subcategory'] });
  }
  if (!value.officialUrl && !value.registrationUrl) {
    context.addIssue({ code: 'custom', message: 'Provide at least one official or registration URL.', path: ['officialUrl'] });
  }
  if (value.startDate && value.endDate && value.endDate < value.startDate) {
    context.addIssue({ code: 'custom', message: 'End date cannot be before start date.', path: ['endDate'] });
  }
  if (value.deadline && value.startDate && value.deadline > value.startDate) {
    context.addIssue({ code: 'custom', message: 'Registration deadline must be on or before the start date.', path: ['deadline'] });
  }
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().trim().min(1).max(2000),
}).strict();

export const verificationChecksSchema = z.object({
  organizerGenuine: z.boolean(),
  opportunityExists: z.boolean(),
  registrationProviderAuthorized: z.boolean(),
  datesAndDeadlineAccurate: z.boolean(),
  feeAndCertificateClaimsSupported: z.boolean(),
  activeAndNotDuplicate: z.boolean(),
}).strict();

export const moderationSchema = z.object({
  action: z.enum(['UNDER_VERIFICATION', 'APPROVED', 'REJECTED', 'EXPIRED', 'NEEDS_MORE_INFORMATION']),
  reason: z.string().trim().max(2000).default(''),
  adminNotes: z.string().trim().max(2000).default(''),
  verificationChecks: verificationChecksSchema.optional(),
}).strict().superRefine((value, context) => {
  if (value.action !== 'APPROVED') return;
  const checks = value.verificationChecks;
  if (!checks || Object.values(checks).some((checked) => !checked)) {
    context.addIssue({ code: 'custom', message: 'Complete every verification check before approval.', path: ['verificationChecks'] });
  }
});
