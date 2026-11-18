import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAdmin, requireAuth } from '../auth.js';
import { CommunityPost, CommunityReport, CommunitySubmission, ModerationLog, WebsiteReview } from '../models.js';
import { moderationSchema, normalizeOpportunityUrl, submissionSchema } from '../validation.js';
import { z } from 'zod';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/submissions', async (req, res) => {
  const parsedStatus = z.enum([
    'PENDING_REVIEW',
    'UNDER_VERIFICATION',
    'APPROVED',
    'REJECTED',
    'EXPIRED',
    'NEEDS_MORE_INFORMATION',
  ]).safeParse(req.query.status ?? 'PENDING_REVIEW');
  if (!parsedStatus.success) {
    res.status(400).json({ error: 'Invalid moderation status.' });
    return;
  }
  const status = parsedStatus.data;
  const submissions = await CommunitySubmission.find({ status })
    .select('+adminNotes')
    .sort({ submittedAt: 1 })
    .limit(100)
    .populate('userId', 'displayName joinedAt');
  res.json({ submissions });
});

router.get('/submissions/:id/duplicates', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid submission.' });
    return;
  }
  const submission = await CommunitySubmission.findById(id);
  if (!submission) {
    res.status(404).json({ error: 'Submission not found.' });
    return;
  }
  const escapedTitle = submission.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const duplicates = await CommunitySubmission.find({
    _id: { $ne: submission._id },
    $or: [
      { normalizedUrls: { $in: submission.normalizedUrls } },
      { title: new RegExp(`^${escapedTitle}$`, 'i'), category: submission.category },
    ],
  }).select('title category status startDate officialUrl registrationUrl submittedAt').limit(20);
  res.json({ duplicates });
});

router.patch('/submissions/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid submission.' });
    return;
  }
  const parsed = submissionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Check the opportunity fields before saving.', details: parsed.error.flatten() });
    return;
  }
  const submission = await CommunitySubmission.findById(id);
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
    res.status(400).json({ error: error instanceof Error ? error.message : 'Enter a public HTTP or HTTPS URL.' });
    return;
  }
  Object.assign(submission, {
    ...parsed.data,
    normalizedUrls,
    reviewedBy: req.user!._id,
    reviewedAt: new Date(),
  });
  await submission.save();
  await ModerationLog.create({
    submissionId: submission._id,
    adminId: req.user!._id,
    action: 'EDITED',
    reason: 'Admin corrected submission formatting or details.',
  });
  res.json({ submission });
});

router.patch('/submissions/:id/moderate', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid submission.' });
    return;
  }
  const parsed = moderationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Choose a valid moderation action.' });
    return;
  }
  if (['REJECTED', 'NEEDS_MORE_INFORMATION'].includes(parsed.data.action) && !parsed.data.reason) {
    res.status(400).json({ error: 'Add a reason or the information requested from the contributor.' });
    return;
  }

  const submission = await CommunitySubmission.findById(id);
  if (!submission) {
    res.status(404).json({ error: 'Submission not found.' });
    return;
  }
  submission.status = parsed.data.action;
  submission.reviewedAt = new Date();
  submission.reviewedBy = req.user!._id;
  submission.contributorMessage = parsed.data.reason;
  submission.adminNotes = parsed.data.adminNotes;
  if (parsed.data.action === 'APPROVED') submission.contributorMessage = '';
  await submission.save();

  if (parsed.data.action === 'APPROVED') {
    await CommunityPost.findOneAndUpdate(
      { submissionId: submission._id },
      { submissionId: submission._id, contributorUserId: submission.userId, visibilityStatus: 'visible', publishedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  } else {
    await CommunityPost.updateOne({ submissionId: submission._id }, { visibilityStatus: 'hidden' });
  }
  await ModerationLog.create({
    submissionId: submission._id,
    adminId: req.user!._id,
    action: parsed.data.action,
    reason: parsed.data.reason,
    verificationChecks: parsed.data.verificationChecks,
  });
  res.json({ submission });
});

router.get('/reviews', async (_req, res) => {
  const reviews = await WebsiteReview.find({ status: 'PENDING_REVIEW' })
    .sort({ submittedAt: 1 })
    .limit(100)
    .populate('userId', 'displayName joinedAt');
  res.json({ reviews });
});

router.patch('/reviews/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    res.status(400).json({ error: 'Invalid review.' });
    return;
  }
  const actionSchema = z.object({
    action: z.enum(['APPROVED', 'REJECTED']),
    reason: z.string().trim().max(2000).default(''),
  }).strict();
  const parsed = actionSchema.safeParse(req.body);
  if (!parsed.success || (parsed.data.action === 'REJECTED' && !parsed.data.reason)) {
    res.status(400).json({ error: 'Choose an action and include a reason when rejecting a review.' });
    return;
  }
  const review = await WebsiteReview.findById(id);
  if (!review) {
    res.status(404).json({ error: 'Review not found.' });
    return;
  }
  review.status = parsed.data.action;
  review.reviewedAt = new Date();
  review.reviewedBy = req.user!._id;
  await review.save();
  await ModerationLog.create({
    reviewId: review._id,
    adminId: req.user!._id,
    action: parsed.data.action === 'APPROVED' ? 'REVIEW_APPROVED' : 'REVIEW_REJECTED',
    reason: parsed.data.reason,
  });
  res.json({ review });
});

router.get('/reports', async (_req, res) => {
  const reports = await CommunityReport.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .limit(100)
    .populate('reporterId', 'displayName');
  const withTargets = await Promise.all(reports.map(async (report) => {
    const target = report.targetType === 'submission'
      ? await CommunitySubmission.findById(report.targetId).select('title description category status officialUrl registrationUrl')
      : await WebsiteReview.findById(report.targetId).select('rating feedback status').populate('userId', 'displayName');
    return { ...report.toObject(), target };
  }));
  res.json({ reports: withTargets });
});

router.patch('/reports/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string' || !mongoose.isValidObjectId(id) || !['resolved', 'dismissed'].includes(req.body?.status)) {
    res.status(400).json({ error: 'Choose resolved or dismissed for this report.' });
    return;
  }
  const report = await CommunityReport.findByIdAndUpdate(
    id,
    { status: req.body.status },
    { new: true, runValidators: true },
  );
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }
  await ModerationLog.create({
    reportId: report._id,
    adminId: req.user!._id,
    action: report.status === 'resolved' ? 'REPORT_RESOLVED' : 'REPORT_DISMISSED',
  });
  res.json({ report });
});

router.get('/logs', async (_req, res) => {
  const logs = await ModerationLog.find()
    .sort({ timestamp: -1 })
    .limit(200)
    .populate('adminId', 'displayName');
  res.json({ logs });
});

export default router;
