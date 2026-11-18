import { useCallback, useEffect, useState, type FormEvent } from 'react';
import SectionHeading from '@/components/ui/SectionHeading';
import { communityRequest, type CommunitySubmission } from '@/services/communityApi';

type Queue = 'submissions' | 'reviews' | 'reports' | 'audit';
type ModerationRecord = CommunitySubmission & { userId?: { displayName?: string; joinedAt?: string }; _id?: string; id?: string };
type ReviewRecord = { id?: string; _id?: string; rating: number; feedback: string; submittedAt: string; userId?: { displayName?: string } };
type ReportRecord = { id?: string; _id?: string; targetType: string; targetId: string; target?: { title?: string; description?: string; feedback?: string; rating?: number; status?: string } | null; reporterId?: { displayName?: string }; reason: string; createdAt: string };
type LogRecord = { action: string; reason: string; timestamp: string; adminId?: { displayName?: string }; submissionId?: string; reviewId?: string };
const verificationLabels = {
  organizerGenuine: 'Organizer is genuine',
  opportunityExists: 'Event or course actually exists',
  registrationProviderAuthorized: 'Registration URL belongs to organizer or authorized provider',
  datesAndDeadlineAccurate: 'Dates and deadline are accurate',
  feeAndCertificateClaimsSupported: 'Fee and certificate claims are supported',
  activeAndNotDuplicate: 'Opportunity is active and not a duplicate',
};

const statuses = ['PENDING_REVIEW', 'UNDER_VERIFICATION', 'NEEDS_MORE_INFORMATION', 'APPROVED', 'REJECTED', 'EXPIRED'];
const label = (status: string) => status.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (letter: string) => letter.toUpperCase());
const host = (value: string) => {
  try { return new URL(value).hostname; } catch { return 'External website'; }
};

export default function CommunityModerationPage() {
  const [queue, setQueue] = useState<Queue>('submissions');
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [submissions, setSubmissions] = useState<ModerationRecord[]>([]);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [duplicates, setDuplicates] = useState<Record<string, ModerationRecord[]>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [action, setAction] = useState('UNDER_VERIFICATION');
  const [reason, setReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [verificationChecks, setVerificationChecks] = useState({
    organizerGenuine: false,
    opportunityExists: false,
    registrationProviderAuthorized: false,
    datesAndDeadlineAccurate: false,
    feeAndCertificateClaimsSupported: false,
    activeAndNotDuplicate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (queue === 'submissions') {
        const result = await communityRequest<{ submissions: ModerationRecord[] }>(`/admin/submissions?status=${status}`);
        setSubmissions(result.submissions);
      } else if (queue === 'reviews') {
        const result = await communityRequest<{ reviews: ReviewRecord[] }>('/admin/reviews');
        setReviews(result.reviews);
      } else if (queue === 'reports') {
        const result = await communityRequest<{ reports: ReportRecord[] }>('/admin/reports');
        setReports(result.reports);
      } else {
        const result = await communityRequest<{ logs: LogRecord[] }>('/admin/logs');
        setLogs(result.logs);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load moderation data.');
    } finally {
      setLoading(false);
    }
  }, [queue, status]);

  useEffect(() => { void load(); }, [load]);

  const moderateSubmission = async (event: FormEvent<HTMLFormElement>, id: string) => {
    event.preventDefault();
    setError(null);
    setNotice('');
    try {
      await communityRequest(`/admin/submissions/${id}/moderate`, {
        method: 'PATCH',
        body: JSON.stringify({ action, reason, adminNotes, verificationChecks }),
      });
      setNotice(`Submission marked ${label(action)}.`);
      setReason('');
      setAdminNotes('');
      setVerificationChecks({
        organizerGenuine: false,
        opportunityExists: false,
        registrationProviderAuthorized: false,
        datesAndDeadlineAccurate: false,
        feeAndCertificateClaimsSupported: false,
        activeAndNotDuplicate: false,
      });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to moderate submission.');
    }
  };

  const saveFormatting = async (event: FormEvent<HTMLFormElement>, submission: ModerationRecord) => {
    event.preventDefault();
    const id = submission.id ?? submission._id;
    if (!id) return;
    try {
      await communityRequest(`/admin/submissions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          category: submission.category,
          subcategory: submission.subcategory,
          domains: submission.domains,
          organizerName: submission.organizerName,
          officialUrl: submission.officialUrl,
          registrationUrl: submission.registrationUrl,
          startDate: submission.startDate,
          endDate: submission.endDate,
          deadline: submission.deadline,
          mode: submission.mode,
          location: submission.location,
          feeType: submission.feeType,
          certificateStatus: submission.certificateStatus,
          goodiesOrPrizes: submission.goodiesOrPrizes,
          eligibility: submission.eligibility,
          posterPath: submission.posterPath,
        }),
      });
      setEditing(null);
      setNotice('Formatting corrections saved and recorded.');
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save corrections.');
    }
  };

  const loadDuplicates = async (id: string) => {
    try {
      const result = await communityRequest<{ duplicates: ModerationRecord[] }>(`/admin/submissions/${id}/duplicates`);
      setDuplicates((current) => ({ ...current, [id]: result.duplicates }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to check duplicates.');
    }
  };

  const moderateReview = async (id: string, reviewAction: 'APPROVED' | 'REJECTED') => {
    const reviewReason = window.prompt(reviewAction === 'REJECTED' ? 'Reason for rejection (required):' : 'Optional moderation note:');
    if (reviewReason === null) return;
    try {
      await communityRequest(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ action: reviewAction, reason: reviewReason }) });
      setNotice(`Review ${label(reviewAction)}.`);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to moderate review.');
    }
  };

  const updateReport = async (id: string, reportStatus: 'resolved' | 'dismissed') => {
    try {
      await communityRequest(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status: reportStatus }) });
      setNotice('Report queue updated.');
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to update report.');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Admin only" title="Community moderation" description="Review evidence before approval. Only administrators can change verification states; every decision is logged." />
      <nav aria-label="Moderation queues" className="flex flex-wrap gap-2">
        {(['submissions', 'reviews', 'reports', 'audit'] as Queue[]).map((item) => (
          <button key={item} type="button" onClick={() => setQueue(item)} className={`chip capitalize ${queue === item ? 'border-violet/40 bg-violet/15 text-ink' : ''}`}>{item === 'audit' ? 'Audit log' : item}</button>
        ))}
      </nav>
      {queue === 'submissions' && (
        <label className="block max-w-sm text-sm font-medium text-ink">
          Submission status
          <select className="field mt-1.5" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option value={item} key={item}>{label(item)}</option>)}</select>
        </label>
      )}
      {error && <p role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-4 text-sm text-danger">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-success/20 bg-success/5 p-4 text-sm text-success">{notice}</p>}
      {loading && <p role="status" className="py-5 text-sm text-muted">Loading moderation queue…</p>}

      {queue === 'submissions' && !loading && submissions.map((submission) => {
        const id = submission.id ?? submission._id ?? '';
        return (
          <article key={id} className="card space-y-4 p-5">
            <header className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="text-lg font-bold text-ink">{submission.title}</h3><p className="text-xs text-muted">Shared by {submission.userId?.displayName ?? 'Community member'} · {submission.category} · Submitted {new Date(submission.submittedAt).toLocaleString()}</p></div>
              <span className="chip">{label(submission.status)}</span>
            </header>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted">{submission.description}</p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Organizer</dt><dd>{submission.organizerName || 'Not specified'}</dd></div>
              <div><dt className="text-xs text-muted">Date / deadline</dt><dd>{submission.startDate ? new Date(submission.startDate).toLocaleDateString() : 'Not specified'} · {submission.deadline ? new Date(submission.deadline).toLocaleDateString() : 'No deadline'}</dd></div>
              <div><dt className="text-xs text-muted">Mode / location</dt><dd>{submission.mode} · {submission.location || 'Not specified'}</dd></div>
              <div><dt className="text-xs text-muted">Fee / certificate</dt><dd>{submission.feeType} · {submission.certificateStatus}</dd></div>
              <div><dt className="text-xs text-muted">Eligibility</dt><dd>{submission.eligibility || 'Not specified'}</dd></div>
              <div><dt className="text-xs text-muted">Domains</dt><dd>{submission.domains.join(', ') || 'Not specified'}</dd></div>
            </dl>
            <div className="flex flex-wrap gap-3">
              {submission.officialUrl && <a className="btn-secondary" href={submission.officialUrl} target="_blank" rel="noopener noreferrer nofollow">Inspect official site · {host(submission.officialUrl)} ↗</a>}
              {submission.registrationUrl && <a className="btn-secondary" href={submission.registrationUrl} target="_blank" rel="noopener noreferrer nofollow">Inspect registration · {host(submission.registrationUrl)} ↗</a>}
              <button type="button" className="btn-ghost" onClick={() => void loadDuplicates(id)}>Check duplicates</button>
              <button type="button" className="btn-ghost" onClick={() => { setEditing(editing === id ? null : id); setEditTitle(submission.title); setEditDescription(submission.description); }}>Edit formatting</button>
            </div>
            {submission.posterPath && <img src={submission.posterPath} alt="Submitted event poster" className="max-h-64 rounded-xl object-contain" />}
            {duplicates[id] && <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm"><p className="font-semibold text-ink">{duplicates[id].length ? 'Possible duplicates' : 'No exact URL/title duplicates found'}</p>{duplicates[id].map((duplicate) => <p key={duplicate.id ?? duplicate._id} className="mt-2 text-muted">{duplicate.title} · {label(duplicate.status)}</p>)}</div>}
            {editing === id && (
              <form onSubmit={(event) => void saveFormatting(event, submission)} className="grid gap-3 rounded-xl border border-line/10 p-4">
                <label className="text-sm font-medium text-ink">Corrected title<input className="field mt-1" value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={160} /></label>
                <label className="text-sm font-medium text-ink">Corrected description<textarea className="field mt-1" value={editDescription} onChange={(event) => setEditDescription(event.target.value)} maxLength={5000} rows={4} /></label>
                <button className="btn-secondary w-fit" type="submit">Save corrections</button>
              </form>
            )}
            <form onSubmit={(event) => void moderateSubmission(event, id)} className="grid gap-3 border-t border-line/10 pt-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-ink">Admin action<select className="field mt-1" value={action} onChange={(event) => setAction(event.target.value)}>{statuses.filter((item) => item !== 'PENDING_REVIEW').map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label>
              <label className="text-sm font-medium text-ink">Contributor message / reason<textarea className="field mt-1" rows={2} maxLength={2000} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required for rejection or more information" /></label>
              <label className="text-sm font-medium text-ink sm:col-span-2">Private admin notes<textarea className="field mt-1" rows={2} maxLength={2000} value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} /></label>
              {action === 'APPROVED' && (
                <fieldset className="space-y-2 rounded-xl border border-success/20 p-4 sm:col-span-2">
                  <legend className="px-1 text-sm font-semibold text-ink">Required verification checklist</legend>
                  {(Object.entries(verificationLabels) as [keyof typeof verificationLabels, string][]).map(([key, text]) => (
                    <label key={key} className="flex gap-2 text-sm text-muted">
                      <input type="checkbox" checked={verificationChecks[key]} onChange={(event) => setVerificationChecks((current) => ({ ...current, [key]: event.target.checked }))} />
                      {text}
                    </label>
                  ))}
                </fieldset>
              )}
              <button className="btn-primary w-fit" type="submit" disabled={action === 'APPROVED' && !Object.values(verificationChecks).every(Boolean)}>Record moderation action</button>
            </form>
            <p className="text-xs leading-relaxed text-muted">Before approval, verify the organizer, active dates, registration domain, fees/certificate claims, active status, and duplicate status. Do not follow unexpected redirects.</p>
          </article>
        );
      })}

      {queue === 'reviews' && !loading && reviews.map((review) => {
        const id = review.id ?? review._id ?? '';
        return <article key={id} className="card space-y-3 p-5"><p className="text-sm text-muted">Review by {review.userId?.displayName ?? 'Member'} · {new Date(review.submittedAt).toLocaleString()}</p><p className="text-amber-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p><p className="whitespace-pre-wrap text-sm text-ink">{review.feedback}</p><div className="flex gap-2"><button className="btn-primary" type="button" onClick={() => void moderateReview(id, 'APPROVED')}>Approve</button><button className="btn-secondary" type="button" onClick={() => void moderateReview(id, 'REJECTED')}>Reject</button></div></article>;
      })}

      {queue === 'reports' && !loading && reports.map((report) => {
        const id = report.id ?? report._id ?? '';
        return <article key={id} className="card space-y-3 p-5"><p className="text-sm font-semibold text-ink">Report: {report.targetType} · by {report.reporterId?.displayName ?? 'Member'}</p><p className="text-sm text-muted">{report.reason}</p><div className="rounded-xl bg-base/50 p-4"><p className="font-medium text-ink">{report.target?.title ?? `Review · ${report.target?.rating ?? ''} stars`}</p><p className="mt-2 whitespace-pre-wrap text-sm text-muted">{report.target?.description ?? report.target?.feedback ?? 'The reported item is no longer available.'}</p></div><p className="text-xs text-muted">Target ID: {report.targetId}</p><div className="flex gap-2"><button className="btn-primary" type="button" onClick={() => void updateReport(id, 'resolved')}>Resolve</button><button className="btn-secondary" type="button" onClick={() => void updateReport(id, 'dismissed')}>Dismiss</button></div></article>;
      })}

      {queue === 'audit' && !loading && logs.map((log, index) => (
        <article className="card flex flex-wrap items-start justify-between gap-3 p-4" key={`${log.timestamp}-${index}`}>
          <div><p className="font-semibold text-ink">{label(log.action)}</p><p className="mt-1 text-sm text-muted">{log.reason || 'No note'} · {log.adminId?.displayName ?? 'Administrator'}</p></div>
          <time className="text-xs text-muted">{new Date(log.timestamp).toLocaleString()}</time>
        </article>
      ))}
    </div>
  );
}
