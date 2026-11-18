import { Schema, model, type Document, type Types } from 'mongoose';

export type UserRole = 'member' | 'admin';
export type SubmissionStatus =
  | 'PENDING_REVIEW'
  | 'UNDER_VERIFICATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'NEEDS_MORE_INFORMATION';
export type OpportunityCategory = 'events' | 'workshops' | 'hackathons' | 'courses';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  displayName: string;
  bio: string;
  domains: string[];
  academicYear?: string;
  avatarPath?: string;
  publicProfile: boolean;
  showDomains: boolean;
  showAcademicYear: boolean;
  role: UserRole;
  joinedAt: Date;
  savedPostIds: Types.ObjectId[];
}

export interface ICommunitySubmission extends Document {
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: OpportunityCategory;
  subcategory: string;
  domains: string[];
  organizerName: string;
  officialUrl?: string;
  registrationUrl?: string;
  normalizedUrls: string[];
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  mode: 'Online' | 'Offline' | 'Hybrid' | 'Not specified';
  location: string;
  feeType: 'free' | 'paid' | 'unknown';
  certificateStatus: 'available' | 'not_offered' | 'unknown';
  goodiesOrPrizes: 'yes' | 'no' | 'unknown';
  eligibility: string;
  posterPath?: string;
  status: SubmissionStatus;
  adminNotes: string;
  contributorMessage: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
}

export interface ICommunityPost extends Document {
  submissionId: Types.ObjectId;
  contributorUserId: Types.ObjectId;
  publishedAt: Date;
  visibilityStatus: 'visible' | 'hidden';
  helpfulBy: Types.ObjectId[];
}

export interface IWebsiteReview extends Document {
  userId: Types.ObjectId;
  rating: number;
  feedback: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, select: false },
    passwordHash: { type: String, required: true, select: false },
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    bio: { type: String, default: '', maxlength: 320 },
    domains: { type: [String], default: [] },
    academicYear: { type: String, trim: true, maxlength: 40 },
    avatarPath: { type: String },
    publicProfile: { type: Boolean, default: false },
    showDomains: { type: Boolean, default: false },
    showAcademicYear: { type: Boolean, default: false },
    role: { type: String, enum: ['member', 'admin'], default: 'member', immutable: true },
    joinedAt: { type: Date, default: Date.now, immutable: true },
    savedPostIds: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true, strict: 'throw' },
);

const submissionSchema = new Schema<ICommunitySubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, enum: ['events', 'workshops', 'hackathons', 'courses'], required: true },
    subcategory: { type: String, required: true, trim: true, maxlength: 80 },
    domains: { type: [String], default: [] },
    organizerName: { type: String, default: '', trim: true, maxlength: 120 },
    officialUrl: { type: String, trim: true },
    registrationUrl: { type: String, trim: true },
    normalizedUrls: { type: [String], required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    deadline: { type: Date },
    mode: { type: String, enum: ['Online', 'Offline', 'Hybrid', 'Not specified'], default: 'Not specified' },
    location: { type: String, default: '', trim: true, maxlength: 160 },
    feeType: { type: String, enum: ['free', 'paid', 'unknown'], default: 'unknown' },
    certificateStatus: { type: String, enum: ['available', 'not_offered', 'unknown'], default: 'unknown' },
    goodiesOrPrizes: { type: String, enum: ['yes', 'no', 'unknown'], default: 'unknown' },
    eligibility: { type: String, default: '', trim: true, maxlength: 1000 },
    posterPath: { type: String },
    status: {
      type: String,
      enum: ['PENDING_REVIEW', 'UNDER_VERIFICATION', 'APPROVED', 'REJECTED', 'EXPIRED', 'NEEDS_MORE_INFORMATION'],
      default: 'PENDING_REVIEW',
      index: true,
    },
    adminNotes: { type: String, default: '', maxlength: 2000, select: false },
    contributorMessage: { type: String, default: '', maxlength: 1000 },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, strict: 'throw' },
);
submissionSchema.index({ normalizedUrls: 1 }, { unique: true, name: 'unique_opportunity_urls' });
submissionSchema.index({ title: 1, category: 1, startDate: 1 });

const postSchema = new Schema<ICommunityPost>(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'CommunitySubmission', required: true, unique: true },
    contributorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    publishedAt: { type: Date, default: Date.now },
    visibilityStatus: { type: String, enum: ['visible', 'hidden'], default: 'visible', index: true },
    helpfulBy: { type: [Schema.Types.ObjectId], default: [] },
  },
  { timestamps: true },
);

const reviewSchema = new Schema<IWebsiteReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, enum: ['PENDING_REVIEW', 'APPROVED', 'REJECTED'], default: 'PENDING_REVIEW', index: true },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, strict: 'throw' },
);

const moderationLogSchema = new Schema(
  {
    submissionId: { type: Schema.Types.ObjectId, ref: 'CommunitySubmission', index: true },
    reviewId: { type: Schema.Types.ObjectId, ref: 'WebsiteReview', index: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'CommunityReport', index: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, enum: ['UNDER_VERIFICATION', 'APPROVED', 'REJECTED', 'EXPIRED', 'NEEDS_MORE_INFORMATION', 'REVIEW_APPROVED', 'REVIEW_REJECTED', 'REPORT_RESOLVED', 'REPORT_DISMISSED', 'EDITED'] },
    reason: { type: String, default: '', maxlength: 2000 },
    verificationChecks: {
      organizerGenuine: Boolean,
      opportunityExists: Boolean,
      registrationProviderAuthorized: Boolean,
      datesAndDeadlineAccurate: Boolean,
      feeAndCertificateClaimsSupported: Boolean,
      activeAndNotDuplicate: Boolean,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false, strict: 'throw' },
);

const reportSchema = new Schema(
  {
    targetType: { type: String, enum: ['submission', 'review'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending', index: true },
  },
  { timestamps: true, strict: 'throw' },
);
reportSchema.index({ targetType: 1, targetId: 1, reporterId: 1 }, { unique: true });

export const User = model<IUser>('User', userSchema);
export const CommunitySubmission = model<ICommunitySubmission>('CommunitySubmission', submissionSchema);
export const CommunityPost = model<ICommunityPost>('CommunityPost', postSchema);
export const WebsiteReview = model<IWebsiteReview>('WebsiteReview', reviewSchema);
export const ModerationLog = model('ModerationLog', moderationLogSchema);
export const CommunityReport = model('CommunityReport', reportSchema);
