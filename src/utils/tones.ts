import type { Listing } from '@/types';

export const TONE_CLASSES: Record<Listing['orgTone'], string> = {
  violet: 'bg-violet/15 text-violet-accent ring-violet/30',
  electric: 'bg-electric/15 text-[#8FA6FF] ring-electric/30',
  success: 'bg-success/15 text-success ring-success/30',
  warning: 'bg-warning/15 text-warning ring-warning/30',
  danger: 'bg-danger/15 text-danger ring-danger/30',
};
