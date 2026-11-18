import type { Roadmap } from '@/types';

export function getProgressPercent(roadmaps: Roadmap[], progress: Record<string, string[]>): number {
  const totalSteps = roadmaps.reduce((sum, roadmap) => sum + roadmap.steps.length, 0);
  const doneSteps = roadmaps.reduce((sum, roadmap) => sum + (progress[roadmap.id] ?? []).length, 0);
  return totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
}
