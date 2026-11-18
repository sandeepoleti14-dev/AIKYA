interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className = '' }: LogoMarkProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="aikya-mark-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B56AFF" />
          <stop offset="0.5" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#5478FF" />
        </linearGradient>
      </defs>
      <path
        d="M12 52 L32 11 L52 52"
        fill="none"
        stroke="url(#aikya-mark-gradient)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 38 H42" stroke="url(#aikya-mark-gradient)" strokeWidth="6.5" strokeLinecap="round" />
    </svg>
  );
}
