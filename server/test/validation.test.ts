import assert from 'node:assert/strict';
import test from 'node:test';
import { moderationSchema, normalizeOpportunityUrl, submissionSchema } from '../src/validation.ts';

test('normalizes opportunity URLs for duplicate detection without tracker fragments', () => {
  const first = normalizeOpportunityUrl('https://www.example.org/events/ai/?utm_source=mail&ref=student#details');
  const second = normalizeOpportunityUrl('https://example.org/events/ai?ref=student');
  assert.equal(first, second);
});

test('rejects executable, credential-bearing, and local destinations', () => {
  for (const value of [
    'javascript:alert(1)',
    'ftp://example.org/opportunity',
    'https://user:pass@example.org/opportunity',
    'http://localhost:3000/admin',
    'http://192.168.1.20/register',
    'http://internal.local/register',
    'https://bit.ly/aikya-event',
  ]) {
    assert.throws(() => normalizeOpportunityUrl(value), value);
  }
});

test('requires a title, description, category, and at least one valid reference URL', () => {
  const base = {
    title: 'Community workshop',
    description: 'Learn together.',
    category: 'workshops',
    subcategory: 'Webinars',
  };
  assert.equal(submissionSchema.safeParse({ ...base, officialUrl: 'https://organizer.example/workshop' }).success, true);
  assert.equal(submissionSchema.safeParse({ ...base }).success, false);
  assert.equal(submissionSchema.safeParse({ ...base, title: '', registrationUrl: 'https://organizer.example/register' }).success, false);
  assert.equal(submissionSchema.safeParse({ ...base, subcategory: 'Unlisted type', registrationUrl: 'https://organizer.example/register' }).success, false);
});

test('does not allow approval until every verification check passes', () => {
  const checks = {
    organizerGenuine: true,
    opportunityExists: true,
    registrationProviderAuthorized: true,
    datesAndDeadlineAccurate: true,
    feeAndCertificateClaimsSupported: true,
    activeAndNotDuplicate: true,
  };
  assert.equal(moderationSchema.safeParse({ action: 'APPROVED' }).success, false);
  assert.equal(moderationSchema.safeParse({ action: 'APPROVED', verificationChecks: { ...checks, activeAndNotDuplicate: false } }).success, false);
  assert.equal(moderationSchema.safeParse({ action: 'APPROVED', verificationChecks: checks }).success, true);
});
