import { Calendar, Code, GraduationCap, Presentation, Trophy } from 'lucide-react';
import { LogoMark } from '@/components/brand/LogoMark';

const ORBIT_ICONS = [
  { Icon: Code, angle: 0 },
  { Icon: Trophy, angle: 72 },
  { Icon: Calendar, angle: 144 },
  { Icon: GraduationCap, angle: 216 },
  { Icon: Presentation, angle: 288 },
];

const PARTICLES = [
  { top: '18%', left: '12%', delay: '0s' },
  { top: '64%', left: '20%', delay: '2.2s' },
  { top: '36%', left: '78%', delay: '4.1s' },
  { top: '82%', left: '64%', delay: '1.1s' },
  { top: '12%', left: '58%', delay: '5.4s' },
  { top: '52%', left: '90%', delay: '3.3s' },
];

export default function HeroScene() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden="true">
      <div className="absolute inset-[6%] rounded-full bg-violet/10 blur-3xl" />

      <div className="absolute inset-[8%] animate-orbit rounded-full border border-line/10" />
      <div className="absolute inset-[22%] animate-orbit-reverse rounded-full border border-dashed border-line/15" />
      <div className="absolute inset-[36%] animate-orbit rounded-full border-2 border-transparent border-t-electric/70" />

      {ORBIT_ICONS.map(({ Icon, angle }) => (
        <div key={angle} className="absolute inset-[8%]" style={{ transform: `rotate(${angle}deg)` }}>
          <div className="absolute inset-0 animate-orbit">
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <span
                className="flex h-11 w-11 animate-orbit-reverse items-center justify-center rounded-2xl border border-line/10 bg-card/90 text-violet-accent shadow-lg backdrop-blur"
                style={{ animationDuration: '40s' }}
              >
                <Icon className="h-5 w-5" />
              </span>
            </span>
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 animate-float items-center justify-center rounded-[36px] border border-line/10 bg-card/80 shadow-glow backdrop-blur-xl sm:h-48 sm:w-48">
        <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-violet/20 via-transparent to-electric/20" />
        <LogoMark className="relative h-24 w-24 drop-shadow-[0_0_18px_rgba(139,92,246,0.6)] sm:h-28 sm:w-28" />
      </div>

      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="absolute h-1.5 w-1.5 animate-drift rounded-full bg-violet-accent"
          style={{ top: particle.top, left: particle.left, animationDelay: particle.delay }}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 h-1/4 overflow-hidden rounded-b-[40px]">
        <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute bottom-0 h-full w-full opacity-60">
          <path d="M0 80 L60 50 L110 75 L170 35 L230 70 L290 45 L340 72 L400 52 L400 120 L0 120 Z" className="fill-violet/25" />
          <path d="M0 98 L80 78 L150 96 L220 74 L300 94 L400 80 L400 120 L0 120 Z" className="fill-electric/25" />
        </svg>
      </div>
    </div>
  );
}
