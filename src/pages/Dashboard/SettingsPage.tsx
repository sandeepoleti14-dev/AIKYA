import { TECH_DOMAINS } from '@/data/categories';
import SectionHeading from '@/components/ui/SectionHeading';
import { useApp } from '@/hooks/useApp';
import type { Preferences } from '@/types';

const NOTIFICATION_OPTIONS: { key: keyof Preferences['notifications']; label: string; text: string }[] = [
  { key: 'deadlines', label: 'Deadline reminders', text: 'A nudge before saved opportunities close.' },
  { key: 'newEvents', label: 'New events', text: 'Hear about new listings in your categories.' },
  { key: 'roadmapReminders', label: 'Roadmap reminders', text: 'A gentle reminder to continue learning.' },
];

const THEME_OPTIONS: { value: Preferences['theme']; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
];

const VISIBILITY_OPTIONS: { value: Preferences['profileVisibility']; label: string }[] = [
  { value: 'private', label: 'Private, only me' },
  { value: 'community', label: 'Community, visible to members' },
];

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${checked ? 'bg-gradient-to-r from-violet to-electric' : 'bg-line/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { profile, preferences, updatePreferences, updateProfile, notify } = useApp();

  const setTheme = (theme: Preferences['theme']) => {
    if (theme === preferences.theme) return;
    updatePreferences({ theme });
    notify(theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled');
  };

  const toggleNotification = (key: keyof Preferences['notifications']) => {
    updatePreferences({
      notifications: { ...preferences.notifications, [key]: !preferences.notifications[key] },
    });
  };

  const toggleInterest = (domain: string) => {
    const interests = profile.interests.includes(domain)
      ? profile.interests.filter((interest) => interest !== domain)
      : [...profile.interests, domain];
    updateProfile({ ...profile, interests });
  };

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Settings" title="Preferences" description="Choose how AIKYA looks and what it tells you about." />

      <section aria-labelledby="appearance-heading" className="card space-y-5 p-6">
        <h2 id="appearance-heading" className="text-lg font-semibold text-ink">Appearance</h2>
        <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-xl border border-line/15 p-1">
          {THEME_OPTIONS.map((option) => {
            const active = preferences.theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(option.value)}
                className={`rounded-lg px-5 py-2 text-sm font-medium transition duration-200 ${active ? 'bg-violet text-white shadow' : 'text-muted hover:text-ink'}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="notifications-heading" className="card space-y-5 p-6">
        <h2 id="notifications-heading" className="text-lg font-semibold text-ink">Notifications</h2>
        <ul className="divide-y divide-line/10">
          {NOTIFICATION_OPTIONS.map((option) => (
            <li key={option.key} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-ink">{option.label}</p>
                <p className="text-xs text-muted">{option.text}</p>
              </div>
              <ToggleSwitch
                label={option.label}
                checked={preferences.notifications[option.key]}
                onChange={() => toggleNotification(option.key)}
              />
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">Notification delivery arrives with accounts. These choices are saved in this browser.</p>
      </section>

      <section aria-labelledby="categories-heading" className="card space-y-5 p-6">
        <div>
          <h2 id="categories-heading" className="text-lg font-semibold text-ink">Technology interests</h2>
          <p className="mt-1 text-sm text-muted">Choose domains for local, interest-based recommendations. Saved in this browser.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TECH_DOMAINS.map((domain) => {
            const selected = profile.interests.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(domain)}
                className={`chip transition duration-200 ${selected ? 'border-violet/60 bg-violet/15 text-ink' : 'hover:border-violet/40'}`}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="privacy-heading" className="card space-y-5 p-6">
        <h2 id="privacy-heading" className="text-lg font-semibold text-ink">Privacy</h2>
        <label htmlFor="settings-visibility" className="block text-sm font-medium text-ink">
          Profile visibility
        </label>
        <select
          id="settings-visibility"
          className="field max-w-sm"
          value={preferences.profileVisibility}
          onChange={(event) => updatePreferences({ profileVisibility: event.target.value as Preferences['profileVisibility'] })}
        >
          {VISIBILITY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </section>

      <section aria-labelledby="account-heading" className="card space-y-3 p-6">
        <h2 id="account-heading" className="text-lg font-semibold text-ink">Account</h2>
        <p className="text-sm leading-relaxed text-muted">
          Sign-in and account management are not available yet. Your data stays in this browser until accounts are added.
        </p>
      </section>
    </div>
  );
}
