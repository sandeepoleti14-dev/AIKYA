import { Moon, Sun } from 'lucide-react';
import { useApp } from '@/hooks/useApp';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { preferences, updatePreferences, notify } = useApp();
  const isDark = preferences.theme === 'dark';

  const handleToggle = () => {
    updatePreferences({ theme: isDark ? 'light' : 'dark' });
    notify(isDark ? 'Light theme enabled' : 'Dark theme enabled');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border border-line/10 text-muted transition duration-300 hover:border-violet/40 hover:text-ink active:scale-90 ${className}`}
    >
      <Sun
        className={`absolute h-[18px] w-[18px] transition duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
        aria-hidden="true"
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
        aria-hidden="true"
      />
    </button>
  );
}
