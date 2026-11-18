import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '@/components/ui/SectionHeading';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';
import { CommunityReviewCard } from '@/pages/Community/CommunityComponents';
import { communityRequest, type CommunityReview } from '@/services/communityApi';

export default function CommunityReviewsSection() {
  const { user } = useCommunityAuth();
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    communityRequest<{ reviews: CommunityReview[]; averageRating: number | null; totalReviews: number }>('/reviews')
      .then((result) => {
        setReviews(result.reviews.slice(0, 3));
        setAverage(result.averageRating);
        setTotal(result.totalReviews);
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load community reviews.'));
  }, []);

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Aikya Community"
        title="What Our Community Says"
        description="Real experiences from students growing together with Aikya."
      />
      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="text-sm text-muted">
          {error ? 'Review summary is unavailable.' : average === null ? 'No approved reviews yet' : `${average.toFixed(1)} / 5 average · ${total} approved ${total === 1 ? 'review' : 'reviews'}`}
        </p>
        <Link to={user ? '/community/reviews/write' : '/community/login?next=%2Fcommunity%2Freviews%2Fwrite'} className="btn-primary">
          Share Your Experience
        </Link>
      </div>
      {error ? (
        <p role="status" className="text-sm text-muted">Community reviews are unavailable until the MongoDB API is configured.</p>
      ) : reviews.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reviews.map((review) => <CommunityReviewCard key={review.id} review={review} />)}
        </div>
      ) : (
        <p className="card p-6 text-sm text-muted">No approved reviews yet. Aikya never displays sample testimonials.</p>
      )}
      {total > 3 && <Link to="/community/reviews" className="btn-secondary">Read community reviews</Link>}
    </section>
  );
}
