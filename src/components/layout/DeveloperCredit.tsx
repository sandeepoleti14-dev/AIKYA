import { Sparkles } from 'lucide-react';

export default function DeveloperCredit() {
  return (
    <div className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl border border-violet/30 bg-card/60 px-4 py-3 shadow-sm backdrop-blur transition duration-500 hover:border-violet/60 hover:shadow-glow">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-electric text-white">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="text-left">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Developed by</p>
        <p className="font-display text-sm font-bold text-ink">_bsandeep</p>
        <p className="text-xs text-muted">Dream Big. Build Better.</p>
      </div>
    </div>
  );
}
