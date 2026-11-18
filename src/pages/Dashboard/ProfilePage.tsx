import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import FormField from '@/components/forms/FormField';
import SectionHeading from '@/components/ui/SectionHeading';
import { useApp } from '@/hooks/useApp';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';
import type { Profile } from '@/types';
import { isValidEmail } from '@/utils/validation';

type ProfileDraft = {
  name: string;
  email: string;
  education: string;
  location: string;
  skills: string;
  learningGoals: string;
};

type ProfileErrors = Partial<Record<keyof ProfileDraft, string>>;

function toList(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const { profile, updateProfile, notify } = useApp();
  const { user: account } = useCommunityAuth();
  const [draft, setDraft] = useState<ProfileDraft>({
    name: profile.name,
    email: profile.email,
    education: profile.education,
    location: profile.location,
    skills: profile.skills.join(', '),
    learningGoals: profile.learningGoals,
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!account) return;
    setDraft((current) => ({ ...current, name: account.displayName, email: account.email ?? current.email }));
  }, [account]);

  const update = (key: keyof ProfileDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setSavedAt(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: ProfileErrors = {};
    if (!draft.name.trim()) nextErrors.name = 'Please enter your name.';
    if (!draft.email.trim()) nextErrors.email = 'Please enter your email address.';
    else if (!isValidEmail(draft.email)) nextErrors.email = 'Enter a valid email, for example name@example.com.';
    if (draft.learningGoals.trim().length > 300) nextErrors.learningGoals = 'Keep your goals under 300 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const next: Profile = {
      ...profile,
      name: account?.displayName ?? draft.name.trim(),
      email: account?.email ?? draft.email.trim(),
      education: draft.education.trim(),
      location: draft.location.trim(),
      skills: toList(draft.skills),
      learningGoals: draft.learningGoals.trim(),
    };
    updateProfile(next);
    setSavedAt(Date.now());
    notify('Profile saved');
  };

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Profile" title="Your profile" description="Your Aikya account identity is shared across community posts and reviews. Discovery preferences remain private to this browser." />
      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-semibold text-ink">Aikya Community identity</h2>
          <p className="mt-1 text-sm text-muted">{account ? `Signed in as ${account.displayName}` : 'Sign in or create an account to share opportunities and manage your public profile.'}</p>
        </div>
        <Link to={account ? '/community/profile' : '/community/login'} className="btn-secondary">
          {account ? 'Edit community profile' : 'Sign in to Aikya'}
        </Link>
      </section>
      <form onSubmit={handleSubmit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <FormField id="profile-name" label={account ? 'Account display name' : 'Display name'} error={errors.name}>
          <input id="profile-name" className="field" value={draft.name} onChange={(e) => update('name', e.target.value)} aria-invalid={!!errors.name} disabled={!!account} />
        </FormField>
        <FormField id="profile-email" label="Email (private)" error={errors.email}>
          <input id="profile-email" type="email" className="field" value={draft.email} onChange={(e) => update('email', e.target.value)} aria-invalid={!!errors.email} disabled={!!account} />
        </FormField>
        <FormField id="profile-education" label="Education">
          <input id="profile-education" className="field" value={draft.education} onChange={(e) => update('education', e.target.value)} />
        </FormField>
        <FormField id="profile-location" label="Location">
          <input id="profile-location" className="field" value={draft.location} onChange={(e) => update('location', e.target.value)} />
        </FormField>
        <FormField id="profile-skills" label="Skills" hint="Separate with commas.">
          <input id="profile-skills" className="field" value={draft.skills} onChange={(e) => update('skills', e.target.value)} />
        </FormField>
        <div className="sm:col-span-2 rounded-xl border border-line/10 p-4">
          <p className="text-sm font-medium text-ink">Technology interests</p>
          <p className="mt-1 text-sm text-muted">
            {profile.interests.length ? profile.interests.join(', ') : 'None selected'}
          </p>
          <Link to="/dashboard/settings" className="mt-2 inline-flex text-sm font-medium text-violet-accent hover:underline">
            Update interests in Settings
          </Link>
        </div>
        <div className="sm:col-span-2">
          <FormField id="profile-goals" label="Learning goals" error={errors.learningGoals}>
            <textarea id="profile-goals" rows={3} className="field resize-y" value={draft.learningGoals} onChange={(e) => update('learningGoals', e.target.value)} />
          </FormField>
        </div>
        <div className="sm:col-span-2 flex items-center justify-end gap-4">
          {savedAt && (
            <span className="flex items-center gap-1.5 text-sm text-success animate-fade-in">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Saved
            </span>
          )}
          <button type="submit" className="btn-primary">
            Save profile
          </button>
        </div>
      </form>
    </div>
  );
}
