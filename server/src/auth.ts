import type { NextFunction, Request, Response } from 'express';
import type { IUser } from './models.js';
import { User } from './models.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Sign in to continue.' });
    return;
  }

  const user = await User.findById(req.session.userId);
  if (!user) {
    req.session.destroy(() => undefined);
    res.status(401).json({ error: 'Your session has expired. Sign in again.' });
    return;
  }

  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Administrator access is required.' });
    return;
  }
  next();
}

export function publicUser(user: IUser, includePrivateProfile = false) {
  const profileIsPublic = includePrivateProfile || user.publicProfile;
  return {
    id: user._id.toString(),
    displayName: user.displayName,
    bio: profileIsPublic ? user.bio : '',
    domains: profileIsPublic && user.showDomains ? user.domains : [],
    academicYear: profileIsPublic && user.showAcademicYear ? user.academicYear ?? '' : '',
    avatarPath: profileIsPublic ? user.avatarPath ?? '' : '',
    publicProfile: user.publicProfile,
    showDomains: user.showDomains,
    showAcademicYear: user.showAcademicYear,
    joinedAt: user.joinedAt,
    ...(includePrivateProfile ? { email: user.email, role: user.role } : {}),
  };
}
