import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { z } from 'zod';
import { requireAuth, publicUser } from '../auth.js';
import { CommunityPost, CommunityReport, CommunitySubmission, User, type ICommunitySubmission, type IUser } from '../models.js';
import { normalizeOpportunityUrl, profileSchema, submissionSchema } from '../validation.js';

const router = Router();
const submissionLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false });
const reportLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false });
const idIsValid = (id: string) => mongoose.isValidObjectId(id);
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function publicSubmission(submission: ICommunitySubmission) {
  return {
    id: submission._id.toString(),
    title: submission.title,
    description: submission.description,
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
    status: submission.status,
    submittedAt: submission.submittedAt,
    reviewedAt: submission.reviewedAt,
  };
}

router.get('/feed', async (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;
  const mode = typeof req.query.mode === 'string' ? req.query.mode : undefined;
  const feeType = typeof req.query.feeType === 'string' ? req.query.feeType : undefined;
  const location = typeof req.query.location === 'string' ? req.query.location.trim() : '';
  const subcategory = typeof req.query.subcategory === 'string' ? req.query.subcategory : undefined;
  const page = Math.floor(Math.max(1, Math.min(1000, Number(req.query.page) || 1)));
  const limit = Math.floor(Math.max(1, Math.min(30, Number(req.query.limit) || 12)));
  const filters: Record<string, unknown> = { status: 'APPROVED' };
  if (category && ['events', 'workshops', 'hackathons', 'courses'].includes(category)) filters.category = category;
  if (subcategory) filters.subcategory = subcategory;
  if (domain) filters.domains = domain;
  if (mode && ['Online', 'Offline', 'Hybrid'].includes(mode)) filters.mode = mode;
  if (feeType && ['free', 'paid', 'unknown'].includes(feeType)) filters.feeType = feeType;
  if (location) filters.location = new RegExp(escapeRegex(location.slice(0, 80)), 'i');
  if (typeof req.query.from === 'string' && !Number.isNaN(Date.parse(req.query.from))) {
    filters.$or = [{ startDate: { $gte: new Date(req.query.from) } }, { startDate: null }];
  }

  const submissions = await CommunitySubmission.find(filters)
    .sort({ submittedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const posts = await CommunityPost.find({
    submissionId: { $in: submissions.map((submission) => submission._id) },
    visibilityStatus: 'visible',
  }).populate<{ contributorUserId: IUser | null }>(
    'contributorUserId',
    'displayName bio domains academicYear avatarPath publicProfile showDomains showAcademicYear joinedAt',
  );
  const viewer = req.session.userId ? await User.findById(req.session.userId).select('savedPostIds') : null;
  const postBySubmission = new Map(posts.map((post) => [post.submissionId.toString(), post]));
  const viewerId = req.session.userId;
  res.json({
    items: submissions.flatMap((submission) => {
      const post = postBySubmission.get(submission.id);
      if (!post) return [];
      const author = post.contributorUserId;
      if (!author) return [];
      return [{
        postId: post.id,
        submission: publicSubmission(submission),
        author: publicUser(author),
        helpfulCount: post.helpfulBy.length,
        isHelpful: viewerId ? post.helpfulBy.some((id) => id.toString() === viewerId) : false,
        isSaved: viewer ? viewer.savedPostIds.some((id) => id.toString() === post.id) : false,
      }];
    }),
    page,
    limit,
  });
});

router.get('/members/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !idIsValid(id)) {
    res.status(400).json({ error: 'Invalid member profile.' });
    return;
  }
  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ error: 'Member not found.' });
    return;
  }
  if (!user.publicProfile && req.session.userId !== user.id) {
    res.status(404).json({ error: 'Member profile is private.' });
    return;
  }
  const [contributions, approvedSubmissions, recentPosts] = await Promise.all([
    CommunityPost.countDocuments({ contributorUserId: user._id, visibilityStatus: 'visible' }),
    CommunitySubmission.countDocuments({ userId: user._id, status: 'APPROVED' }),
    CommunityPost.find({ contributorUserId: user._id, visibilityStatus: 'visible' })
      .sort({ publishedAt: -1 })
      .limit(20)
      .populate<{ submissionId: ICommunitySubmission | null }>('submissionId'),
  ]);
  res.json({
    user: publicUser(user, req.session.userId === user.id),
    contributions,
    approvedSubmissions,
    posts: recentPosts.flatMap((post) => {
      if (!post.submissionId) return [];
      return [{
        postId: post.id,
        submission: publicSubmission(post.submissionId),
        author: publicUser(user),
        helpfulCount: post.helpfulBy.length,
        isHelpful: false,
        isSaved: false,
      }];
    }),
  });
});

router.patch('/profile', requireAuth, async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Check the profile fields and try again.', details: parsed.error.flatten() });
    return;
  }
  Object.assign(req.user!, parsed.data);
  await req.user!.save();
  res.json({ user: publicUser(req.user!, true) });
});

router.get('/mine', requireAuth, async (req, res) => {
  const submissions = await CommunitySubmission.find({ userId: req.user!._id }).sort({ submittedAt: -1 });
  res.json({ submissions: submissions.map((submission) => ({
    ...publicSubmission(submission),
    contributorMessage: submission.contributorMessage,
  })) });
});

router.post('/submissions', requireAuth, submissionLimit, async (req, res) => {
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Check the required opportunity details.', details: parsed.error.flatten() });
    return;
  }

  let normalizedUrls: string[];
  try {
    normalizedUrls = [parsed.data.officialUrl, parsed.data.registrationUrl]
      .filter((value): value is string => !!value)
      .map(normalizeOpportunityUrl);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Enter a valid public HTTP or HTTPS URL.' });
    return;
  }

  const duplicate = await CommunitySubmission.findOne({ normalizedUrls: { $in: normalizedUrls } }).select('title status');
  if (duplicate) {
    res.status(409).json({ error: 'A submission with the same official URL is already in the community.', duplicateTitle: duplicate.title });
    return;
  }

  const submission = await CommunitySubmission.create({
    ...parsed.data,
    officialUrl: parsed.data.officialUrl ? normalizeOpportunityUrl(parsed.data.officialUrl) : undefined,
    registrationUrl: parsed.data.registrationUrl ? normalizeOpportunityUrl(parsed.data.registrationUrl) : undefined,
    normalizedUrls,
    userId: req.user!._id,
    status: 'PENDING_REVIEW',
  });
  res.status(201).json({ submission });
});

router.patch('/submissions/:id', requireAuth, submissionLimit, async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !idIsValid(id)) {
    res.status(400).json({ error: 'Invalid submission.' });
    return;
  }
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Check the required opportunity details.', details: parsed.error.flatten() });
    return;
  }
  const submission = await CommunitySubmission.findOne({ _id: id, userId: req.user!._id });
  if (!submission) {
    res.status(404).json({ error: 'Submission not found.' });
    return;
  }

  let normalizedUrls: string[];
  try {
    normalizedUrls = [parsed.data.officialUrl, parsed.data.registrationUrl]
      .filter((value): value is string => !!value)
      .map(normalizeOpportunityUrl);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Enter a valid public HTTP or HTTPS URL.' });
    return;
  }
  const duplicate = await CommunitySubmission.findOne({
    _id: { $ne: submission._id },
    normalizedUrls: { $in: normalizedUrls },
  }).select('title');
  if (duplicate) {
    res.status(409).json({ error: 'Another submission already uses the same official URL.', duplicateTitle: duplicate.title });
    return;
  }

  Object.assign(submission, {
    ...parsed.data,
    officialUrl: parsed.data.officialUrl ? normalizeOpportunityUrl(parsed.data.officialUrl) : undefined,
    registrationUrl: parsed.data.registrationUrl ? normalizeOpportunityUrl(parsed.data.registrationUrl) : undefined,
    normalizedUrls,
    status: 'PENDING_REVIEW',
    reviewedAt: undefined,
    reviewedBy: undefined,
    contributorMessage: '',
  });
  await submission.save();
  await CommunityPost.updateOne({ submissionId: submission._id }, { visibilityStatus: 'hidden' });
  res.json({ submission });
});

router.post('/posts/:id/helpful', requireAuth, async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !idIsValid(id)) {
    res.status(400).json({ error: 'Invalid post.' });
    return;
  }
  const post = await CommunityPost.findOne({ _id: id, visibilityStatus: 'visible' });
  if (!post) {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }
  const alreadyHelpful = post.helpfulBy.some((id) => id.equals(req.user!._id));
  await CommunityPost.updateOne(
    { _id: post._id },
    alreadyHelpful ? { $pull: { helpfulBy: req.user!._id } } : { $addToSet: { helpfulBy: req.user!._id } },
  );
  res.json({ helpful: !alreadyHelpful, helpfulCount: Math.max(0, post.helpfulBy.length + (alreadyHelpful ? -1 : 1)) });
});

router.post('/posts/:id/save', requireAuth, async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !idIsValid(id)) {
    res.status(400).json({ error: 'Invalid post.' });
    return;
  }
  const post = await CommunityPost.findOne({ _id: id, visibilityStatus: 'visible' });
  if (!post) {
    res.status(404).json({ error: 'Post not found.' });
    return;
  }
  const saved = req.user!.savedPostIds.some((id) => id.equals(post._id));
  await User.updateOne(
    { _id: req.user!._id },
    saved ? { $pull: { savedPostIds: post._id } } : { $addToSet: { savedPostIds: post._id } },
  );
  res.json({ saved: !saved });
});

router.get('/saved', requireAuth, async (req, res) => {
  const posts = await CommunityPost.find({
    _id: { $in: req.user!.savedPostIds },
    visibilityStatus: 'visible',
  }).populate<{ submissionId: ICommunitySubmission | null; contributorUserId: IUser | null }>([
    { path: 'submissionId' },
    { path: 'contributorUserId', select: 'displayName bio domains academicYear avatarPath publicProfile showDomains showAcademicYear joinedAt' },
  ]);
  res.json({
    items: posts.flatMap((post) => {
      if (!post.submissionId || !post.contributorUserId) return [];
      return { postId: post.id, submission: publicSubmission(post.submissionId), author: publicUser(post.contributorUserId) };
    }),
  });
});

router.post('/reports', requireAuth, reportLimit, async (req, res) => {
  const schema = z.object({
    targetType: z.enum(['submission', 'review']),
    targetId: z.string().refine(idIsValid),
    reason: z.string().trim().min(1).max(1000),
  }).strict();
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Choose a report reason and a valid item.' });
    return;
  }
  await CommunityReport.create({ ...parsed.data, reporterId: req.user!._id });
  res.status(201).json({ message: 'Thanks. Your report was sent to the moderation team.' });
});

export default router;
