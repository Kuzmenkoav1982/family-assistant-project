import type { FamilyMember } from '@/types/family.types';

export interface AIAnalysis {
  member1Perspective: string;
  member2Perspective: string;
  rootCause: string;
  steps: string[];
  advice: string;
  bestTime: string;
}

export const DIFF_COLORS = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
} as const;

export const DIFF_LABELS = {
  easy: 'Просто',
  medium: 'Средне',
  hard: 'Сложно',
} as const;

export function getBd(m: FamilyMember): string | null {
  return m.birth_date || m.birthDate || null;
}
