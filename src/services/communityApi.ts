export interface CommunityUser {
  id: string;
  displayName: string;
  bio: string;
  domains: string[];
  academicYear: string;
  avatarPath: string;
  publicProfile: boolean;
  showDomains: boolean;
  showAcademicYear: boolean;
  joinedAt: string;
  email?: string;
  role?: 'member' | 'admin';
}

export interface CommunitySubmission {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  category: 'events' | 'workshops' | 'hackathons' | 'courses';
  subcategory: string;
  domains: string[];
  organizerName: string;
  officialUrl?: string;
  registrationUrl?: string;
  startDate?: string;
  endDate?: string;
  deadline?: string;
  mode: 'Online' | 'Offline' | 'Hybrid' | 'Not specified';
  location: string;
  feeType: 'free' | 'paid' | 'unknown';
  certificateStatus: 'available' | 'not_offered' | 'unknown';
  goodiesOrPrizes: 'yes' | 'no' | 'unknown';
  eligibility: string;
  posterPath?: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  contributorMessage?: string;
  adminNotes?: string;
}

export interface CommunityFeedItem {
  postId: string;
  submission: CommunitySubmission;
  author: CommunityUser;
  helpfulCount: number;
  isHelpful: boolean;
  isSaved: boolean;
}

export interface CommunityReview {
  id: string;
  rating: number;
  feedback: string;
  submittedAt: string;
  author: CommunityUser;
}

export class CommunityApiError extends Error {
  constructor(message: string, public readonly status = 0) {
    super(message);
    this.name = 'CommunityApiError';
  }
}

export async function communityRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...init.headers,
      },
    });
  } catch {
    throw new CommunityApiError('Community services are unavailable. Configure and start the MongoDB API server.');
  }

  if (!response.ok) {
    let message = response.status >= 500
      ? 'Community API is unavailable. Check MongoDB configuration and start the API server.'
      : `Request failed (${response.status}).`;
    try {
      const body = await response.json() as { error?: string };
      if (body.error) message = body.error;
    } catch {
      if (response.status < 500) message = `Request failed (${response.status}).`;
    }
    throw new CommunityApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function uploadCommunityImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('image', file);
  const result = await communityRequest<{ path: string }>('/uploads/image', { method: 'POST', body });
  return result.path;
}
