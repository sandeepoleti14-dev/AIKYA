import { useState, type FormEvent } from 'react';
import { Bookmark, Check, ExternalLink, Flag, Heart, Share2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';
import { communityRequest, type CommunityFeedItem, type CommunityReview, type CommunityUser } from '@/services/communityApi';

function formatMonth(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function formatDate(value?: string) {
  if (!value) return 'Date not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date not specified' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function hostLabel(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return 'External website';
  }
}

export function CommunityMemberIdentity({ user, compact = false }: { user: CommunityUser; compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link
        to={`/community/members/${user.id}`}
        aria-label={`View ${user.displayName}'s community profile`}
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet to-electric font-bold text-white"
      >
        {user.avatarPath ? (
          <img src={user.avatarPath} alt="" className="h-full w-full object-cover" />
        ) : (
          user.displayName.slice(0, 1).toUpperCase()
        )}
      </Link>
      <div className="min-w-0">
        <Link to={`/community/members/${user.id}`} className="block truncate text-sm font-semibold text-ink hover:text-violet-accent">
          {user.displayName}
        </Link>
        <p className="text-xs text-muted">
          Joined {formatMonth(user.joinedAt)}
          {user.showAcademicYear && user.academicYear ? ` · ${user.academicYear}` : ''}
        </p>
        {!compact && user.showDomains && user.domains.length > 0 && (
          <p className="mt-1 truncate text-xs text-muted">{user.domains.join(' · ')}</p>
        )}
      </div>
    </div>
  );
}

export function CommunityOpportunityCard({ item }: { item: CommunityFeedItem }) {
  const { user } = useCommunityAuth();
  const [helpful, setHelpful] = useState(item.isHelpful);
  const [helpfulCount, setHelpfulCount] = useState(item.helpfulCount);
  const [saved, setSaved] = useState(item.isSaved);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submissionId = item.submission.id ?? item.submission._id;

  const toggleHelpful = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const result = await communityRequest<{ helpful: boolean; helpfulCount: number }>(`/community/posts/${item.postId}/helpful`, { method: 'POST' });
      setHelpful(result.helpful);
      setHelpfulCount(result.helpfulCount);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update helpful action.');
    } finally {
      setBusy(false);
    }
  };

  const toggleSave = async () => {
    if (!user || busy) return;
    setBusy(true);
    try {
      const result = await communityRequest<{ saved: boolean }>(`/community/posts/${item.postId}/save`, { method: 'POST' });
      setSaved(result.saved);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update saved posts.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/community?post=${encodeURIComponent(item.postId)}`;
    try {
      if (navigator.share) await navigator.share({ title: item.submission.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setMessage('Community post link copied.');
      }
    } catch {
      setMessage('Unable to share this post from this browser.');
    }
  };

  const report = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!submissionId || !reportReason.trim()) return;
    setBusy(true);
    try {
      await communityRequest('/community/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType: 'submission', targetId: submissionId, reason: reportReason.trim() }),
      });
      setMessage('Report sent to the moderation team.');
      setReportOpen(false);
      setReportReason('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to submit report.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <article id={`community-post-${item.postId}`} className="card overflow-hidden">
      {item.submission.posterPath && (
        <img src={item.submission.posterPath} alt="" className="h-48 w-full object-cover" />
      )}
      <div className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <CommunityMemberIdentity user={item.author} />
          <div className="space-y-2 text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified by Aikya
            </span>
            <p className="text-xs text-muted">Shared {formatDate(item.submission.submittedAt)}</p>
          </div>
        </div>
        <div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-muted">
            <span className="chip">{item.submission.category}</span>
            <span className="chip">{item.submission.subcategory}</span>
            {item.submission.domains.map((domain) => <span className="chip" key={domain}>{domain}</span>)}
          </div>
          <h2 className="mt-4 text-xl font-bold text-ink">{item.submission.title}</h2>
          <p className="mt-1 text-xs font-medium text-muted">Shared by {item.author.displayName}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">{item.submission.description}</p>
        </div>
        <dl className="grid gap-3 rounded-xl bg-base/50 p-4 text-sm sm:grid-cols-2">
          {item.submission.organizerName && <div><dt className="text-xs text-muted">Organizer</dt><dd className="mt-1 text-ink">{item.submission.organizerName}</dd></div>}
          <div><dt className="text-xs text-muted">Date / deadline</dt><dd className="mt-1 text-ink">{formatDate(item.submission.startDate)}{item.submission.deadline ? ` · Deadline ${formatDate(item.submission.deadline)}` : ''}</dd></div>
          <div><dt className="text-xs text-muted">Mode / location</dt><dd className="mt-1 text-ink">{item.submission.mode} · {item.submission.location || 'Not specified'}</dd></div>
          <div><dt className="text-xs text-muted">Cost / certificate</dt><dd className="mt-1 text-ink">{item.submission.feeType} · {item.submission.certificateStatus.replace('_', ' ')}</dd></div>
        </dl>
        <p className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-xs leading-relaxed text-muted">
          Aikya checked this listing before approval. Confirm details and the destination domain with the organizer before registering.
        </p>
        <div className="flex flex-wrap gap-3">
          {item.submission.officialUrl && (
            <a href={item.submission.officialUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn-secondary">
              Official site · {hostLabel(item.submission.officialUrl)} <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {item.submission.registrationUrl && (
            <a href={item.submission.registrationUrl} target="_blank" rel="noopener noreferrer nofollow" className="btn-primary">
              Register · {hostLabel(item.submission.registrationUrl)} <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line/10 pt-4">
          {user ? (
            <>
              <button type="button" disabled={busy} onClick={() => void toggleHelpful()} className="btn-ghost">
                <Heart className={`h-4 w-4 ${helpful ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
                Helpful ({helpfulCount})
              </button>
              <button type="button" disabled={busy} onClick={() => void toggleSave()} className="btn-ghost">
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-violet text-violet' : ''}`} aria-hidden="true" />
                {saved ? 'Saved' : 'Save'}
              </button>
              <button type="button" onClick={() => setReportOpen((open) => !open)} className="btn-ghost">
                <Flag className="h-4 w-4" aria-hidden="true" /> Report
              </button>
            </>
          ) : (
            <Link to="/community/login" className="btn-ghost">Sign in to help, save or report</Link>
          )}
          <button type="button" onClick={() => void share()} className="btn-ghost">
            <Share2 className="h-4 w-4" aria-hidden="true" /> Share
          </button>
        </div>
        {reportOpen && user && (
          <form onSubmit={report} className="grid gap-3 rounded-xl border border-line/10 p-4">
            <label className="text-sm font-medium text-ink" htmlFor={`report-${item.postId}`}>Why are you reporting this opportunity?</label>
            <textarea id={`report-${item.postId}`} required maxLength={1000} value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="field min-h-20" />
            <button type="submit" disabled={busy} className="btn-secondary w-fit">Send report</button>
          </form>
        )}
        {message && <p role="status" className="text-sm text-muted">{message}</p>}
      </div>
    </article>
  );
}

export function CommunityReviewCard({ review }: { review: CommunityReview }) {
  const { user } = useCommunityAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [notice, setNotice] = useState('');

  const submitReport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await communityRequest('/community/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType: 'review', targetId: review.id, reason: reportReason.trim() }),
      });
      setNotice('Report sent to the moderation team.');
      setReportOpen(false);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to send report.');
    }
  };

  return (
    <article className="card space-y-4 p-5">
      <p className="flex gap-1 text-amber-400" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => <span key={index}>{index < review.rating ? '★' : '☆'}</span>)}
      </p>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">“{review.feedback}”</p>
      <CommunityMemberIdentity user={review.author} compact />
      <p className="text-xs text-muted">Review submitted: {formatMonth(review.submittedAt)}</p>
      {user && (
        <>
          <button type="button" className="btn-ghost w-fit" onClick={() => setReportOpen((open) => !open)}>
            <Flag className="h-4 w-4" aria-hidden="true" /> Report review
          </button>
          {reportOpen && (
            <form onSubmit={submitReport} className="space-y-3">
              <label className="block text-xs font-medium text-muted" htmlFor={`review-report-${review.id}`}>Report reason</label>
              <textarea id={`review-report-${review.id}`} required maxLength={1000} className="field min-h-20" value={reportReason} onChange={(event) => setReportReason(event.target.value)} />
              <button type="submit" className="btn-secondary">Send report</button>
            </form>
          )}
        </>
      )}
      {notice && <p role="status" className="text-xs text-muted">{notice}</p>}
    </article>
  );
}

export function VerifiedMark() {
  return <span className="inline-flex items-center gap-1 text-xs font-semibold text-success"><Check className="h-3.5 w-3.5" aria-hidden="true" /> Verified by Aikya</span>;
}
