import type { BioRhythm, PowerDay } from '@/types/family-code.types';

const PHYSICAL_CYCLE = 23;
const EMOTIONAL_CYCLE = 28;
const INTELLECTUAL_CYCLE = 33;

function daysSinceBirth(birthDate: string, targetDate: string): number {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  return Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
}

function bioValue(days: number, cycle: number): number {
  return Math.round(Math.sin((2 * Math.PI * days) / cycle) * 100) / 100;
}

function isCritical(days: number, cycle: number): boolean {
  const pos = days % cycle;
  return pos === 0 || Math.abs(pos - cycle / 2) < 1;
}

export function calculateBiorhythm(birthDate: string, date: string): BioRhythm {
  const days = daysSinceBirth(birthDate, date);
  return {
    date,
    physical: bioValue(days, PHYSICAL_CYCLE),
    emotional: bioValue(days, EMOTIONAL_CYCLE),
    intellectual: bioValue(days, INTELLECTUAL_CYCLE),
    isPhysicalCritical: isCritical(days, PHYSICAL_CYCLE),
    isEmotionalCritical: isCritical(days, EMOTIONAL_CYCLE),
    isIntellectualCritical: isCritical(days, INTELLECTUAL_CYCLE),
  };
}

export function calculateBiorhythmRange(birthDate: string, startDate: string, days: number): BioRhythm[] {
  const result: BioRhythm[] = [];
  const start = new Date(startDate);
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    result.push(calculateBiorhythm(birthDate, d.toISOString().split('T')[0]));
  }
  return result;
}

export function calculatePowerDays(birthDate: string, startDate: string, count: number): PowerDay[] {
  const days: PowerDay[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < 60 && days.length < count; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const bio = calculateBiorhythm(birthDate, dateStr);

    const avg = (bio.physical + bio.emotional + bio.intellectual) / 3;
    const score = Math.round((avg + 1) * 50);

    if (score >= 75) {
      const reasons: string[] = [];
      const recs: string[] = [];
      if (bio.physical > 0.7) { reasons.push('высокая физическая энергия'); recs.push('Спорт, активный отдых, важные физические дела'); }
      if (bio.emotional > 0.7) { reasons.push('эмоциональный подъём'); recs.push('Общение, романтические встречи, творчество'); }
      if (bio.intellectual > 0.7) { reasons.push('интеллектуальный пик'); recs.push('Учёба, важные решения, стратегическое планирование'); }
      if (reasons.length === 0) { reasons.push('хороший баланс всех циклов'); recs.push('Универсально хороший день для любых дел'); }

      days.push({
        date: dateStr,
        score,
        reason: reasons.join(', '),
        recommendations: recs,
      });
    }
  }

  return days;
}

export function getFamilyEnergy(memberBirthDates: string[], date: string): number {
  if (memberBirthDates.length === 0) return 50;
  let total = 0;
  for (const bd of memberBirthDates) {
    const bio = calculateBiorhythm(bd, date);
    const avg = (bio.physical + bio.emotional + bio.intellectual) / 3;
    total += (avg + 1) * 50;
  }
  return Math.round(total / memberBirthDates.length);
}
