import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, X } from 'lucide-react';
import SearchField from '@/components/layout/SearchField';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { PUBLIC_NAV_ITEMS } from '@/components/layout/navItems';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-base/70 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(20rem,88vw)] flex-col gap-6 overflow-y-auto border-l border-line/10 bg-surface p-6 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold text-ink">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line/10 text-ink transition active:scale-90"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <SearchField onSubmitted={onClose} />

        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-base font-medium transition duration-200 ${
                  isActive ? 'bg-violet/15 text-ink' : 'text-muted hover:bg-line/5 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/dashboard"
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-full bg-violet px-5 py-3 text-sm font-medium text-white shadow-glow transition active:scale-[0.98]"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </NavLink>

        <div className="mt-auto flex items-center justify-between border-t border-line/10 pt-5">
          <span className="text-sm text-muted">Theme</span>
          <ThemeToggle />
        </div>
      </aside>
    </div>
  );
}
