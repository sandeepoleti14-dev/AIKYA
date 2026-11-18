import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '@/components/ui/SectionHeading';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';
import { CommunityReviewCard } from '@/pages/Community/CommunityComponents';
import { communityRequest, type CommunityReview } from '@/services/communityApi';

export default function CommunityReviewPage() {
  const { user } = useCommunityAuth();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [existingReview, setExistingReview] = useState<{ rating: number; feedback: string; status: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    communityRequest<{ review: { rating: number; feedback: string; status: string } | null }>('/reviews/me')
      .then(({ review }) => {
        setExistingReview(review);
        if (review) {
          setRating(review.rating);
          setFeedback(review.feedback);
        }
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load your review.'));
  }, [user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice('');
    if (rating < 1 || rating > 5) {
      setError('Choose a star rating from 1 to 5.');
      return;
    }
    setBusy(true);
    try {
      await communityRequest('/reviews/me', { method: 'PUT', body: JSON.stringify({ rating, feedback: feedback.trim() }) });
      setExistingReview({ rating, feedback: feedback.trim(), status: 'PENDING_REVIEW' });
      setNotice('Your review was sent for moderation. It will appear after approval.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit your review.');
    } finally {
      setBusy(false);
    }
  };

  if (!user) {
    return (
      <div className="card p-7 text-center">
        <h2 className="text-xl font-bold text-ink">Sign in to share your experience</h2>
        <p className="mt-2 text-sm text-muted">Website reviews are linked to your Aikya account and moderated before publication.</p>
        <Link to="/community/login?next=%2Fcommunity%2Freviews%2Fwrite" className="btn-primary mt-5">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Community Reviews" title="Share Your Experience" description="Your review will be visible only after a moderator approves it. Editing a review sends it through moderation again." />
      {existingReview && <p className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm text-muted">Your current review is {existingReview.status.replace(/_/g, ' ').toLowerCase()}. Submitting updates it and returns it to Pending Review.</p>}
      <form onSubmit={submit} className="card space-y-5 p-5 sm:p-7">
        <fieldset>
          <legend className="text-sm font-semibold text-ink">Star rating</legend>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }, (_, index) => {
              const value = index + 1;
              return (
                <button key={value} type="button" aria-label={`${value} star${value === 1 ? '' : 's'}`} aria-pressed={rating === value} onClick={() => setRating(value)} className={`text-3xl ${value <= rating ? 'text-amber-400' : 'text-muted/40'}`}>
                  ★
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="block text-sm font-medium text-ink">
          Written feedback
          <textarea required minLength={1} maxLength={2000} rows={5} className="field mt-1.5 resize-y" value={feedback} onChange={(event) => setFeedback(event.target.value)} />
        </label>
        <p className="text-xs leading-relaxed text-muted">
          Your display name and join month/year will be shown if approved. Your current Aikya profile photo is used only if you have chosen to make it public. Email stays private.
        </p>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {notice && <p role="status" className="text-sm text-success">{notice}</p>}
        <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Sending…' : 'Submit review'}</button>
      </form>
    </div>
  );
}

export function CommunityReviewsPage() {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    communityRequest<{ reviews: CommunityReview[]; averageRating: number | null; totalReviews: number }>('/reviews')
      .then((result) => {
        setReviews(result.reviews);
        setAverage(result.averageRating);
        setTotal(result.totalReviews);
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load reviews.'));
  }, []);

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Aikya Community" title="What Our Community Says" description="Real experiences from students growing together with Aikya." />
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-sm text-muted">
          {error ? 'Review summary is unavailable.' : average === null ? 'No approved reviews yet' : `${average.toFixed(1)} / 5 average · ${total} approved ${total === 1 ? 'review' : 'reviews'}`}
        </p>
        <Link to="/community/reviews/write" className="btn-primary">Share Your Experience</Link>
      </div>
      {error && <p role="alert" className="rounded-xl border border-warning/20 p-4 text-sm text-muted">{error}</p>}
      {reviews.length ? <div className="grid gap-4 md:grid-cols-2">{reviews.map((review) => <CommunityReviewCard key={review.id} review={review} />)}</div> : !error && <div className="card p-7 text-center text-sm text-muted">No approved reviews yet. We do not publish sample or unmoderated testimonials.</div>}
    </div>
  );
}
