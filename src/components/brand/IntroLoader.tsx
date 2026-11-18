import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/brand/LogoMark';

interface IntroLoaderProps {
  onDone: () => void;
}

const FADE_OUT_AT_MS = 1500;
const FINISH_AT_MS = 1900;

export default function IntroLoader({ onDone }: IntroLoaderProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setExiting(true), FADE_OUT_AT_MS);
    const doneTimer = window.setTimeout(onDone, FINISH_AT_MS);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-label="Loading AIKYA"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#070816' }}
    >
      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[28px] border border-white/10 bg-[#0D1025] animate-fade-up">
        <LogoMark className="h-14 w-14 drop-shadow-[0_0_14px_rgba(139,92,246,0.6)]" />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-sweep" />
      </div>
      <p
        className="mt-8 font-display text-3xl font-bold tracking-tight text-white animate-fade-up"
        style={{ animationDelay: '0.7s' }}
      >
        Aikya
      </p>
      <p
        className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-[#A6AAC5] animate-fade-in"
        style={{ animationDelay: '1s' }}
      >
        Dream it. Build it. Together.
      </p>
    </div>
  );
}
