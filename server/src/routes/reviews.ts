import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth, publicUser } from '../auth.js';
import { WebsiteReview, type IUser } from '../models.js';
import { reviewSchema } from '../validation.js';

const router = Router();
const reviewLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 3, standardHeaders: 'draft-8', legacyHeaders: false });

router.get('/', async (_req, res) => {
  const [reviews, stats] = await Promise.all([
    WebsiteReview.find({ status: 'APPROVED' })
      .sort({ submittedAt: -1 })
      .limit(60)
      .populate<{ userId: IUser | null }>(
        'userId',
        'displayName bio domains academicYear avatarPath publicProfile showDomains showAcademicYear joinedAt',
      ),
    WebsiteReview.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
    ]),
  ]);
  res.json({
    averageRating: stats[0]?.averageRating ?? null,
    totalReviews: stats[0]?.totalReviews ?? 0,
    reviews: reviews.flatMap((review) => {
      if (!review.userId) return [];
      return [{
        id: review.id,
        rating: review.rating,
        feedback: review.feedback,
        submittedAt: review.submittedAt,
        author: publicUser(review.userId),
      }];
    }),
  });
});

router.get('/me', requireAuth, async (req, res) => {
  const review = await WebsiteReview.findOne({ userId: req.user!._id });
  res.json({ review });
});

router.put('/me', requireAuth, reviewLimit, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Enter a rating from 1 to 5 and feedback under 2,000 characters.' });
    return;
  }
  const review = await WebsiteReview.findOneAndUpdate(
    { userId: req.user!._id },
    {
      $set: { ...parsed.data, status: 'PENDING_REVIEW', submittedAt: new Date() },
      $unset: { reviewedAt: 1, reviewedBy: 1 },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
  res.status(202).json({ review, message: 'Your review is pending moderation.' });
});

export default router;
