import { Link } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import DeveloperCredit from '@/components/layout/DeveloperCredit';

const FOOTER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'For You' },
  { to: '/events', label: 'All Opportunities' },
  { to: '/community', label: 'Community' },
  { to: '/learn', label: 'Free Learning' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/contact', label: 'Contact' },
  { to: '/community/share', label: 'Share an Opportunity' },
];

export default function Footer() {
  return (
    <footer className="border-t border-line/10 bg-surface/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="space-y-5">
          <Logo />
          <p className="max-w-md text-sm leading-relaxed text-muted">
            AIKYA helps students discover public event and contest listings, official provider catalogs, and learning paths.
            Jobs from GitLab and HackerRank are available separately as a secondary section.
          </p>
          <DeveloperCredit />
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <h3 className="mb-4 text-sm font-bold text-ink">Explore</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(0, 6).map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted transition duration-200 hover:text-violet-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-ink">Connect</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.slice(6).map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-muted transition duration-200 hover:text-violet-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-bold text-ink">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <span className="cursor-default text-sm text-muted" title="Placeholder page">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-default text-sm text-muted" title="Placeholder page">
                  Terms of Use
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-line/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} AIKYA. Developed by _bsandeep.
        </p>
      </div>
    </footer>
  );
}
