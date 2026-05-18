import { calculateAstrologyProfile, getElementLabel } from '@/lib/astrology';
import { calculateNumerologyProfile } from '@/lib/numerology';
import type { FamilyMember } from '@/types/family.types';
import { getBd } from './types';

export function buildNumerologyData(m: FamilyMember) {
  const bd = getBd(m);
  if (!bd) return null;
  const astro = calculateAstrologyProfile(bd);
  const num = calculateNumerologyProfile(m.name, bd);
  if (!astro || !num) return null;
  return {
    lifePath: num.lifePath.value,
    zodiacSign: astro.zodiacSignLabel,
    element: getElementLabel(astro.zodiacElement),
    chineseAnimal: astro.chineseAnimalLabel,
    personality: num.lifePath.shortMeaning,
  };
}
