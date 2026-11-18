import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Menu, Search, User, X } from 'lucide-react';
import Logo from '@/components/brand/Logo';
import SearchField from '@/components/layout/SearchField';
import MobileMenu from '@/components/layout/MobileMenu';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { PUBLIC_NAV_ITEMS } from '@/components/layout/navItems';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled ? 'border-b border-line/10 bg-base/85 shadow-lg backdrop-blur-xl' : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative px-3 py-2 text-sm font-medium transition duration-200 after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-violet after:transition-transform after:duration-300 ${
                  isActive ? 'text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `ml-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition duration-300 hover:-translate-y-0.5 ${
                isActive
                  ? 'border-violet bg-violet text-white shadow-glow'
                  : 'border-violet/40 text-ink hover:border-violet hover:bg-violet/10'
              }`
            }
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div
            className={`hidden overflow-hidden transition-[width,opacity] duration-500 md:block ${
              searchOpen ? 'w-64 opacity-100' : 'w-0 opacity-0'
            }`}
          >
            {searchOpen && <SearchField className="w-64" onSubmitted={() => setSearchOpen(false)} />}
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen((open) => !open)}
            aria-label={searchOpen ? 'Close search' : 'Open search'}
            aria-expanded={searchOpen}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-line/10 text-muted transition duration-300 hover:border-violet/40 hover:text-ink active:scale-90 md:flex"
          >
            {searchOpen ? <X className="h-[18px] w-[18px]" aria-hidden="true" /> : <Search className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
          <ThemeToggle />
          <NavLink
            to="/dashboard/profile"
            aria-label="Your profile"
            title="Your profile"
            className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-electric text-white shadow-glow transition duration-300 hover:scale-105 active:scale-95 sm:flex"
          >
            <User className="h-[18px] w-[18px]" aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line/10 text-ink transition hover:border-violet/40 active:scale-90 lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
