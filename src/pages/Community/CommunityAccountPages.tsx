import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import SectionHeading from '@/components/ui/SectionHeading';
import FormField from '@/components/forms/FormField';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';
import { CommunityMemberIdentity, CommunityOpportunityCard, VerifiedMark } from '@/pages/Community/CommunityComponents';
import { communityRequest, uploadCommunityImage, type CommunityFeedItem, type CommunitySubmission, type CommunityUser } from '@/services/communityApi';
import { isValidUrl } from '@/utils/validation';

type SubmissionDraft = {
  title: string;
  description: string;
  category: '' | CommunitySubmission['category'];
  subcategory: string;
  domains: string[];
  organizerName: string;
  officialUrl: string;
  registrationUrl: string;
  startDate: string;
  endDate: string;
  deadline: string;
  mode: CommunitySubmission['mode'];
  location: string;
  feeType: CommunitySubmission['feeType'];
  certificateStatus: CommunitySubmission['certificateStatus'];
  goodiesOrPrizes: CommunitySubmission['goodiesOrPrizes'];
  eligibility: string;
  posterPath?: string;
};

const domainChoices = ['AI/ML', 'Cybersecurity', 'Cloud', 'Software development', 'Data science', 'Design', 'Open source', 'Mobile development'];
const subcategoryChoices: Record<Exclude<SubmissionDraft['category'], ''>, string[]> = {
  events: ['Tech events', 'MNC events', 'Developer community events', 'Conferences', 'Meetups'],
  workshops: ['Technical workshops', 'Webinars', 'Bootcamps', 'Hands-on sessions'],
  hackathons: ['AI/ML', 'Cybersecurity', 'Cloud', 'Software development', 'Other technical competitions'],
  courses: ['Free courses', 'Paid courses', 'Certifications', 'Digital badges', 'Learning paths'],
};

const emptyDraft: SubmissionDraft = {
  title: '', description: '', category: '', subcategory: '', domains: [], organizerName: '',
  officialUrl: '', registrationUrl: '', startDate: '', endDate: '', deadline: '',
  mode: 'Not specified', location: '', feeType: 'unknown', certificateStatus: 'unknown',
  goodiesOrPrizes: 'unknown', eligibility: '',
};

function formValues(submission: CommunitySubmission): SubmissionDraft {
  const date = (value?: string) => value ? value.slice(0, 10) : '';
  return {
    ...emptyDraft,
    title: submission.title,
    description: submission.description,
    category: submission.category,
    subcategory: submission.subcategory,
    domains: submission.domains ?? [],
    organizerName: submission.organizerName ?? '',
    officialUrl: submission.officialUrl ?? '',
    registrationUrl: submission.registrationUrl ?? '',
    startDate: date(submission.startDate),
    endDate: date(submission.endDate),
    deadline: date(submission.deadline),
    mode: submission.mode ?? 'Not specified',
    location: submission.location ?? '',
    feeType: submission.feeType ?? 'unknown',
    certificateStatus: submission.certificateStatus ?? 'unknown',
    goodiesOrPrizes: submission.goodiesOrPrizes ?? 'unknown',
    eligibility: submission.eligibility ?? '',
    posterPath: submission.posterPath,
  };
}

function LoginNotice() {
  return (
    <div className="card p-7 text-center">
      <h2 className="text-xl font-bold text-ink">Sign in to continue</h2>
      <p className="mt-2 text-sm text-muted">Community contributions are tied to your Aikya account.</p>
      <Link to="/community/login" className="btn-primary mt-5">Sign in</Link>
    </div>
  );
}

export function ShareOpportunityPage() {
  const { user } = useCommunityAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [draft, setDraft] = useState<SubmissionDraft>(emptyDraft);
  const [poster, setPoster] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  useEffect(() => {
    if (!editId || !user) return;
    let active = true;
    communityRequest<{ submissions: CommunitySubmission[] }>('/community/mine')
      .then(({ submissions }) => {
        const submission = submissions.find((item) => (item.id ?? item._id) === editId);
        if (!submission) throw new Error('Your submission could not be found.');
        if (active) setDraft(formValues(submission));
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load submission.'))
      .finally(() => { if (active) setLoadingEdit(false); });
    return () => { active = false; };
  }, [editId, user]);

  const set = <K extends keyof SubmissionDraft>(key: K, value: SubmissionDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!draft.category) {
      setError('Choose an opportunity category.');
      return;
    }
    if (!draft.officialUrl.trim() && !draft.registrationUrl.trim()) {
      setError('Add at least one official website or registration URL.');
      return;
    }
    for (const value of [draft.officialUrl, draft.registrationUrl].filter(Boolean)) {
      if (!isValidUrl(value)) {
        setError('Only full HTTP or HTTPS links are accepted.');
        return;
      }
    }

    setBusy(true);
    try {
      let posterPath = draft.posterPath;
      if (poster) posterPath = await uploadCommunityImage(poster);
      const body = {
        ...draft,
        category: draft.category,
        title: draft.title.trim(),
        description: draft.description.trim(),
        officialUrl: draft.officialUrl.trim() || undefined,
        registrationUrl: draft.registrationUrl.trim() || undefined,
        startDate: draft.startDate || undefined,
        endDate: draft.endDate || undefined,
        deadline: draft.deadline || undefined,
        posterPath,
      };
      await communityRequest(editId ? `/community/submissions/${editId}` : '/community/submissions', {
        method: editId ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });
      navigate('/community/my-submissions', { state: { notice: 'Your opportunity is pending review.' } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to submit this opportunity.');
    } finally {
      setBusy(false);
    }
  };

  if (!user) return <LoginNotice />;
  if (loadingEdit) return <p role="status" className="py-8 text-center text-sm text-muted">Loading submission…</p>;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Aikya Community"
        title={editId ? 'Update your opportunity' : 'Share an Opportunity'}
        description="All submissions start as Pending Review and stay out of public discovery until an admin approves them."
      />
      {editId && <p className="rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm text-muted">Updating an approved listing returns it to review and temporarily hides its public post.</p>}
      <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <FormField id="community-title" label="Opportunity title" error={!draft.title.trim() && error ? 'Title is required.' : undefined}>
            <input id="community-title" required maxLength={160} className="field" value={draft.title} onChange={(event) => set('title', event.target.value)} />
          </FormField>
        </div>
        <FormField id="community-category" label="Category">
          <select id="community-category" required className="field" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value as SubmissionDraft['category'], subcategory: '' }))}>
            <option value="">Select category</option><option value="events">Events</option><option value="workshops">Workshops</option><option value="hackathons">Hackathons</option><option value="courses">Courses & certifications</option>
          </select>
        </FormField>
        <FormField id="community-subcategory" label="Type">
          <select id="community-subcategory" required className="field" value={draft.subcategory} onChange={(event) => set('subcategory', event.target.value)} disabled={!draft.category}>
            <option value="">Select type</option>
            {draft.category && subcategoryChoices[draft.category].map((value) => <option value={value} key={value}>{value}</option>)}
          </select>
        </FormField>
        <div className="sm:col-span-2">
          <FormField id="community-description" label="Description / details">
            <textarea id="community-description" required maxLength={5000} rows={5} className="field resize-y" value={draft.description} onChange={(event) => set('description', event.target.value)} />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-medium text-ink">Technology domains</p>
          <div className="flex flex-wrap gap-2">
            {domainChoices.map((domain) => (
              <label key={domain} className="chip cursor-pointer">
                <input type="checkbox" checked={draft.domains.includes(domain)} onChange={(event) => set('domains', event.target.checked ? [...draft.domains, domain] : draft.domains.filter((item) => item !== domain))} />
                {domain}
              </label>
            ))}
          </div>
        </div>
        <FormField id="community-organizer" label="Official organizer name">
          <input id="community-organizer" maxLength={120} className="field" value={draft.organizerName} onChange={(event) => set('organizerName', event.target.value)} />
        </FormField>
        <FormField id="community-location" label="Location">
          <input id="community-location" maxLength={160} placeholder="City, country or online" className="field" value={draft.location} onChange={(event) => set('location', event.target.value)} />
        </FormField>
        <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
          <FormField id="community-official-url" label="Official website URL" hint="At least one URL is required. Only public HTTP/HTTPS links are accepted.">
            <input id="community-official-url" type="url" placeholder="https://" className="field" value={draft.officialUrl} onChange={(event) => set('officialUrl', event.target.value)} />
          </FormField>
          <FormField id="community-registration-url" label="Official registration URL">
            <input id="community-registration-url" type="url" placeholder="https://" className="field" value={draft.registrationUrl} onChange={(event) => set('registrationUrl', event.target.value)} />
          </FormField>
        </div>
        <FormField id="community-mode" label="Online / Offline / Hybrid">
          <select id="community-mode" className="field" value={draft.mode} onChange={(event) => set('mode', event.target.value as SubmissionDraft['mode'])}>
            <option>Not specified</option><option>Online</option><option>Offline</option><option>Hybrid</option>
          </select>
        </FormField>
        <FormField id="community-fee" label="Cost">
          <select id="community-fee" className="field" value={draft.feeType} onChange={(event) => set('feeType', event.target.value as SubmissionDraft['feeType'])}>
            <option value="unknown">Unknown</option><option value="free">Free</option><option value="paid">Paid</option>
          </select>
        </FormField>
        <FormField id="community-start" label="Event / course date">
          <input id="community-start" type="date" className="field" value={draft.startDate} onChange={(event) => set('startDate', event.target.value)} />
        </FormField>
        <FormField id="community-end" label="End date">
          <input id="community-end" type="date" className="field" value={draft.endDate} onChange={(event) => set('endDate', event.target.value)} />
        </FormField>
        <FormField id="community-deadline" label="Registration deadline">
          <input id="community-deadline" type="date" className="field" value={draft.deadline} onChange={(event) => set('deadline', event.target.value)} />
        </FormField>
        <FormField id="community-certificate" label="Certificate availability">
          <select id="community-certificate" className="field" value={draft.certificateStatus} onChange={(event) => set('certificateStatus', event.target.value as SubmissionDraft['certificateStatus'])}>
            <option value="unknown">Unknown</option><option value="available">Available</option><option value="not_offered">Not offered</option>
          </select>
        </FormField>
        <FormField id="community-prizes" label="Goodies or prizes">
          <select id="community-prizes" className="field" value={draft.goodiesOrPrizes} onChange={(event) => set('goodiesOrPrizes', event.target.value as SubmissionDraft['goodiesOrPrizes'])}>
            <option value="unknown">Unknown</option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </FormField>
        <FormField id="community-eligibility" label="Eligibility">
          <textarea id="community-eligibility" maxLength={1000} rows={2} className="field resize-y" value={draft.eligibility} onChange={(event) => set('eligibility', event.target.value)} />
        </FormField>
        <FormField id="community-poster" label="Optional poster image" hint="JPEG, PNG or WebP; maximum 5 MB. No HTML or embeds.">
          <input id="community-poster" type="file" accept="image/jpeg,image/png,image/webp" className="field" onChange={(event) => setPoster(event.target.files?.[0] ?? null)} />
        </FormField>
        {error && <p role="alert" className="sm:col-span-2 rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{error}</p>}
        <p className="sm:col-span-2 text-xs leading-relaxed text-muted">
          Your email stays private. If approved, your display name and Aikya join month/year will appear as the contributor; sharing does not mean you are the organizer. Images and descriptions are not embedded as executable content.
        </p>
        <div className="sm:col-span-2 flex justify-end">
          <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Sending…' : editId ? 'Send update for review' : 'Submit for review'}</button>
        </div>
      </form>
    </div>
  );
}

const statusLabels: Record<string, string> = {
  PENDING_REVIEW: 'Pending Review',
  UNDER_VERIFICATION: 'Under Verification',
  APPROVED: 'Approved · Verified by Aikya',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  NEEDS_MORE_INFORMATION: 'Needs More Information',
};

export function MySubmissionsPage() {
  const { user } = useCommunityAuth();
  const [submissions, setSubmissions] = useState<CommunitySubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    communityRequest<{ submissions: CommunitySubmission[] }>('/community/mine')
      .then((result) => setSubmissions(result.submissions))
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'Unable to load submissions.'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return <LoginNotice />;
  return (
    <div className="space-y-5">
      <SectionHeading title="My Submissions" description="Track review status and update an opportunity. Approved listing edits return to moderation." action={<Link to="/community/share" className="btn-primary">Share an Opportunity</Link>} />
      {error && <p role="alert" className="rounded-xl border border-warning/20 p-4 text-sm text-muted">{error}</p>}
      {loading ? <p role="status" className="py-8 text-center text-sm text-muted">Loading submissions…</p> : submissions.length ? submissions.map((submission) => (
        <article className="card space-y-3 p-5" key={submission.id ?? submission._id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h3 className="font-semibold text-ink">{submission.title}</h3><p className="mt-1 text-xs text-muted">{submission.category} · Submitted {new Date(submission.submittedAt).toLocaleDateString()}</p></div>
            <span className="chip">{statusLabels[submission.status] ?? submission.status}</span>
          </div>
          {submission.status === 'APPROVED' && <VerifiedMark />}
          {submission.contributorMessage && <p className="rounded-lg bg-warning/5 p-3 text-sm text-muted">{submission.contributorMessage}</p>}
          <Link to={`/community/share?edit=${submission.id ?? submission._id}`} className="btn-secondary w-fit">Edit / update</Link>
        </article>
      )) : !error && <div className="card p-7 text-center"><p className="text-sm text-muted">You have not submitted an opportunity yet.</p><Link to="/community/share" className="btn-primary mt-4">Share an Opportunity</Link></div>}
    </div>
  );
}

export function CommunityProfilePage() {
  const { user, updateAccount } = useCommunityAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [domains, setDomains] = useState(user?.domains ?? []);
  const [academicYear, setAcademicYear] = useState(user?.academicYear ?? '');
  const [publicProfile, setPublicProfile] = useState(user?.publicProfile ?? false);
  const [showDomains, setShowDomains] = useState(user?.showDomains ?? false);
  const [showAcademicYear, setShowAcademicYear] = useState(user?.showAcademicYear ?? false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [avatarPath, setAvatarPath] = useState(user?.avatarPath ?? '');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setBio(user.bio);
    setDomains(user.domains);
    setAcademicYear(user.academicYear);
    setPublicProfile(user.publicProfile);
    setShowDomains(user.showDomains);
    setShowAcademicYear(user.showAcademicYear);
    setAvatarPath(user.avatarPath);
  }, [user]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError(null);
    setNotice('');
    try {
      const nextAvatar = photo ? await uploadCommunityImage(photo) : avatarPath || null;
      const result = await communityRequest<{ user: CommunityUser }>('/community/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: displayName.trim(),
          bio,
          domains,
          academicYear,
          avatarPath: nextAvatar,
          publicProfile,
          showDomains,
          showAcademicYear,
        }),
      });
      updateAccount(result.user);
      setAvatarPath(result.user.avatarPath);
      setPhoto(null);
      setNotice('Community profile saved.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save profile.');
    } finally {
      setBusy(false);
    }
  };

  if (!user) return <LoginNotice />;
  return (
    <div className="space-y-6">
      <SectionHeading title="My Community Profile" description="Your account is the single source for the public identity shown on community posts and reviews." />
      <form onSubmit={save} className="card space-y-5 p-5 sm:p-7">
        <CommunityMemberIdentity user={{ ...user, displayName, bio, domains, academicYear, avatarPath, publicProfile, showDomains, showAcademicYear }} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="community-display-name" label="Display name">
            <input id="community-display-name" required maxLength={80} className="field" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </FormField>
          <FormField id="community-bio" label="Short bio">
            <textarea id="community-bio" maxLength={320} rows={3} className="field resize-y" value={bio} onChange={(event) => setBio(event.target.value)} />
          </FormField>
          <FormField id="community-year" label="Academic year (optional)">
            <input id="community-year" maxLength={40} className="field" placeholder="e.g. 2nd Year" value={academicYear} onChange={(event) => setAcademicYear(event.target.value)} />
          </FormField>
        </div>
        <FormField id="community-avatar" label="Profile photo" hint="JPEG, PNG or WebP; maximum 5 MB.">
          <input id="community-avatar" type="file" accept="image/jpeg,image/png,image/webp" className="field" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} />
        </FormField>
        {avatarPath && <button type="button" className="btn-ghost w-fit" onClick={() => { setAvatarPath(''); setPhoto(null); }}>Remove current profile photo</button>}
        <div>
          <p className="mb-2 text-sm font-medium text-ink">Technology domains</p>
          <div className="flex flex-wrap gap-2">
            {domainChoices.map((domain) => <label key={domain} className="chip cursor-pointer"><input type="checkbox" checked={domains.includes(domain)} onChange={(event) => setDomains(event.target.checked ? [...domains, domain] : domains.filter((item) => item !== domain))} />{domain}</label>)}
          </div>
        </div>
        <fieldset className="space-y-3 rounded-xl border border-line/10 p-4">
          <legend className="px-1 text-sm font-semibold text-ink">Public visibility</legend>
          <label className="flex gap-2 text-sm text-muted"><input type="checkbox" checked={publicProfile} onChange={(event) => setPublicProfile(event.target.checked)} />Show my bio and photo on my public profile</label>
          <label className="flex gap-2 text-sm text-muted"><input type="checkbox" checked={showDomains} onChange={(event) => setShowDomains(event.target.checked)} />Show my technology domains</label>
          <label className="flex gap-2 text-sm text-muted"><input type="checkbox" checked={showAcademicYear} onChange={(event) => setShowAcademicYear(event.target.checked)} />Show my academic year</label>
          <p className="text-xs text-muted">When you publish a contribution or review, your display name and Aikya join month/year are always shown. Email and other private account information are never public.</p>
        </fieldset>
        {error && <p role="alert" className="text-sm text-danger">{error}</p>}
        {notice && <p role="status" className="text-sm text-success">{notice}</p>}
        <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save public profile'}</button>
      </form>
    </div>
  );
}

export function MemberProfilePage() {
  const { id = '' } = useParams();
  const [profile, setProfile] = useState<{ user: CommunityUser; contributions: number; approvedSubmissions: number; posts: CommunityFeedItem[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    communityRequest<{ user: CommunityUser; contributions: number; approvedSubmissions: number; posts: CommunityFeedItem[] }>(`/community/members/${encodeURIComponent(id)}`)
      .then((result) => { if (active) setProfile(result); })
      .catch((requestError: unknown) => { if (active) setError(requestError instanceof Error ? requestError.message : 'Unable to load this profile.'); });
    return () => { active = false; };
  }, [id]);

  if (error) return <p role="alert" className="rounded-xl border border-line/10 p-5 text-sm text-muted">{error}</p>;
  if (!profile) return <p role="status" className="py-8 text-center text-sm text-muted">Loading member profile…</p>;

  return (
    <div className="space-y-6">
      <section className="card space-y-5 p-6">
        <CommunityMemberIdentity user={profile.user} />
        {profile.user.bio && <p className="text-sm leading-relaxed text-muted">{profile.user.bio}</p>}
        <p className="text-sm text-muted">{profile.contributions} community contributions · {profile.approvedSubmissions} approved opportunities</p>
      </section>
      <SectionHeading title="Approved community contributions" />
      {profile.posts.length ? <div className="space-y-5">{profile.posts.map((item) => <CommunityOpportunityCard key={item.postId} item={item} />)}</div> : <p className="card p-6 text-sm text-muted">No public contributions yet.</p>}
    </div>
  );
}
