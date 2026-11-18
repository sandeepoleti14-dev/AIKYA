import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCommunityAuth } from '@/hooks/useCommunityAuth';

export default function CommunityAuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { signIn, signUp, user } = useCommunityAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const nextPath = searchParams.get('next');
  const allowedDestinations = ['/community/share', '/community/reviews/write', '/community/my-submissions', '/community/profile'];
  const destination = nextPath && allowedDestinations.includes(nextPath) ? nextPath : '/community';

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'register') await signUp(email, password, displayName);
      else await signIn(email, password);
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to continue.');
    } finally {
      setBusy(false);
    }
  };

  if (user) {
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <h2 className="text-xl font-bold text-ink">You are signed in</h2>
        <Link to={destination} className="btn-primary mt-5">Continue to the community</Link>
      </div>
    );
  }

  return (
    <div className="card mx-auto max-w-xl p-6 sm:p-8">
      <p className="eyebrow mb-2">Aikya Community</p>
      <h2 className="text-2xl font-bold text-ink">{mode === 'register' ? 'Create your Aikya account' : 'Sign in to Aikya'}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Your account lets you share opportunities, manage your submissions, and contribute a website review.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === 'register' && (
          <label className="block text-sm font-medium text-ink">
            Display name
            <input required maxLength={80} autoComplete="name" className="field mt-1.5" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
        )}
        <label className="block text-sm font-medium text-ink">
          Email (private)
          <input required type="email" autoComplete="email" className="field mt-1.5" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Password
          <input required type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={mode === 'register' ? 10 : undefined} className="field mt-1.5" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {mode === 'register' && <p className="text-xs text-muted">Use at least 10 characters with an uppercase letter, lowercase letter, and number.</p>}
        {error && <p role="alert" className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-sm text-danger">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-sm text-muted">
        {mode === 'register' ? 'Already have an account?' : 'New to Aikya?'}{' '}
        <Link
          to={`/community/${mode === 'register' ? 'login' : 'register'}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ''}`}
          className="font-semibold text-violet-accent hover:underline"
        >
          {mode === 'register' ? 'Sign in' : 'Create an account'}
        </Link>
      </p>
      <p className="mt-5 text-xs leading-relaxed text-muted">
        The API uses secure HTTP-only sessions. Email and password are never shown on public profiles.
      </p>
    </div>
  );
}
