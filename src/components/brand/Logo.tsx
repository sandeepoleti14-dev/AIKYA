import { Link } from 'react-router-dom';
import { LogoMark } from '@/components/brand/LogoMark';

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ showWordmark = true, className = '' }: LogoProps) {
  return (
    <Link to="/" aria-label="AIKYA home" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-card ring-1 ring-line/10 transition duration-300 group-hover:ring-violet/50">
        <LogoMark className="h-6 w-6 drop-shadow-[0_0_6px_rgba(139,92,246,0.55)] transition duration-300 group-hover:scale-110" />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-sweep" />
      </span>
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-ink">Aikya</span>
      )}
    </Link>
  );
}
