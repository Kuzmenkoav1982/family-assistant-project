import type { CompatibilityResult, CompatibilityScore } from '@/types/family-code.types';
import type { FamilyMember, MemberProfile } from '@/types/family.types';
import { calculateNumerologyProfile, calculateNumerologyCompatibility } from '@/lib/numerology';
import { calculateAstrologyProfile, getZodiacCompatibility, getChineseCompatibility } from '@/lib/astrology';
import { calculateDestinyMatrix, getArcanaCompatibility } from '@/lib/tarot-arcana';

function getLoveLanguageLabel(lang: string): string {
  const map: Record<string, string> = {
    words_of_affirmation: 'Слова поддержки',
    quality_time: 'Время вместе',
    receiving_gifts: 'Подарки',
    acts_of_service: 'Помощь делом',
    physical_touch: 'Прикосновения',
  };
  return map[lang] || lang;
}

function calculatePsychologyScore(p1?: MemberProfile, p2?: MemberProfile): {
  score: number;
  strengths: string[];
  weaknesses: string[];
  advice: string[];
} {
  if (!p1 && !p2) return { score: 50, strengths: [], weaknesses: [], advice: ['Заполните анкеты обоих членов семьи для более точного анализа'] };

  let score = 50;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const advice: string[] = [];

  const ll1 = p1?.loveLanguages || [];
  const ll2 = p2?.loveLanguages || [];
  if (ll1.length > 0 && ll2.length > 0) {
    const shared = ll1.filter(l => ll2.includes(l));
    if (shared.length > 0) {
      score += 15;
      strengths.push(`Общие языки любви: ${shared.map(getLoveLanguageLabel).join(', ')}`);
    } else {
      score -= 5;
      weaknesses.push(`Разные языки любви — вам нужно учиться выражать любовь по-разному`);
      advice.push(`${ll1[0] ? getLoveLanguageLabel(ll1[0]) : ''} vs ${ll2[0] ? getLoveLanguageLabel(ll2[0]) : ''} — изучите язык любви партнёра`);
    }
  }

  const pt1 = p1?.personalityType;
  const pt2 = p2?.personalityType;
  if (pt1 && pt2) {
    if (pt1 === pt2) {
      score += 5;
      strengths.push(`Одинаковый психотип (${pt1}) — вы хорошо понимаете друг друга`);
    } else if ((pt1 === 'интроверт' && pt2 === 'экстраверт') || (pt1 === 'экстраверт' && pt2 === 'интроверт')) {
      score += 10;
      strengths.push('Интроверт + экстраверт — вы дополняете друг друга');
      advice.push('Уважайте потребность партнёра в уединении или общении');
    }
  }

  const et1 = p1?.energyType;
  const et2 = p2?.energyType;
  if (et1 && et2) {
    if (et1 === et2) {
      score += 5;
      strengths.push(`Одинаковый ритм (${et1}) — комфортный совместный режим дня`);
    } else {
      weaknesses.push(`${et1} и ${et2} — разные биоритмы могут вызывать бытовые трения`);
      advice.push('Договоритесь о тихих часах и совместном времени, удобном обоим');
    }
  }

  const h1 = p1?.hobbies || [];
  const h2 = p2?.hobbies || [];
  if (h1.length > 0 && h2.length > 0) {
    const sharedHobbies = h1.filter(h => h2.some(h2h => h2h.toLowerCase() === h.toLowerCase()));
    if (sharedHobbies.length > 0) {
      score += 10;
      strengths.push(`Общие увлечения: ${sharedHobbies.slice(0, 3).join(', ')}`);
    }
  }

  const t1 = p1?.triggers || [];
  const t2 = p2?.triggers || [];
  if (t1.length > 0 || t2.length > 0) {
    advice.push('Изучите триггеры партнёра, чтобы избежать ненужных конфликтов');
  }

  if (!p1 || !p2) {
    advice.push('Заполните анкеты обоих для более точного анализа психологической совместимости');
  }

  return { score: Math.max(0, Math.min(100, score)), strengths, weaknesses, advice };
}

export function calculateCoupleCompatibility(
  member1: FamilyMember,
  member2: FamilyMember
): CompatibilityResult | null {
  const bd1 = member1.birth_date || member1.birthDate;
  const bd2 = member2.birth_date || member2.birthDate;
  if (!bd1 || !bd2) return null;

  const num1 = calculateNumerologyProfile(member1.name, bd1);
  const num2 = calculateNumerologyProfile(member2.name, bd2);
  const numScore = calculateNumerologyCompatibility(num1.lifePath.value, num2.lifePath.value);

  const astro1 = calculateAstrologyProfile(bd1);
  const astro2 = calculateAstrologyProfile(bd2);
  let astroScore = 50;
  if (astro1 && astro2) {
    const zodiacCompat = getZodiacCompatibility(astro1.zodiacSign, astro2.zodiacSign);
    const chineseCompat = getChineseCompatibility(astro1.chineseAnimal, astro2.chineseAnimal);
    astroScore = Math.round((zodiacCompat + chineseCompat) / 2);
  }

  const tarot1 = calculateDestinyMatrix(bd1);
  const tarot2 = calculateDestinyMatrix(bd2);
  let elementsScore = 50;
  if (tarot1 && tarot2) {
    const p = getArcanaCompatibility(tarot1.personalityCard, tarot2.personalityCard);
    const s = getArcanaCompatibility(tarot1.soulCard, tarot2.soulCard);
    const d = getArcanaCompatibility(tarot1.destinyCard, tarot2.destinyCard);
    elementsScore = Math.round((p + s + d) / 3);
  }

  const psychResult = calculatePsychologyScore(member1.profile, member2.profile);

  const overall = Math.round(
    numScore * 0.25 +
    astroScore * 0.25 +
    elementsScore * 0.2 +
    psychResult.score * 0.3
  );

  const score: CompatibilityScore = {
    overall,
    numerology: numScore,
    astrology: astroScore,
    elements: elementsScore,
    psychology: psychResult.score,
  };

  const strengths: string[] = [...psychResult.strengths];
  const weaknesses: string[] = [...psychResult.weaknesses];
  const adviceList: string[] = [...psychResult.advice];

  if (numScore >= 80) {
    strengths.push(`Нумерологическая гармония — числа ${num1.lifePath.value} и ${num2.lifePath.value} отлично дополняют друг друга`);
  } else if (numScore < 50) {
    weaknesses.push(`Числа ${num1.lifePath.value} и ${num2.lifePath.value} могут конфликтовать — важно уважать различия`);
  }

  if (astro1 && astro2) {
    if (astroScore >= 80) {
      strengths.push(`${astro1.zodiacEmoji} ${astro1.zodiacSignLabel} и ${astro2.zodiacEmoji} ${astro2.zodiacSignLabel} — сильная астрологическая связь`);
    } else if (astroScore < 50) {
      weaknesses.push(`${astro1.zodiacSignLabel} и ${astro2.zodiacSignLabel} — астрология предупреждает о возможных трениях`);
      adviceList.push('Изучите особенности знака партнёра, чтобы лучше понимать его реакции');
    }
  }

  if (overall >= 80) {
    adviceList.unshift('Ваша пара обладает сильной природной совместимостью — берегите это!');
  } else if (overall >= 60) {
    adviceList.unshift('Хорошая база для отношений — работайте над зонами роста');
  } else {
    adviceList.unshift('Ваши различия — не приговор, а возможность для роста. Главное — уважение и диалог');
  }

  const rituals: string[] = [];
  const ll1 = member1.profile?.loveLanguages || [];
  const ll2 = member2.profile?.loveLanguages || [];
  if (ll1.includes('quality_time') || ll2.includes('quality_time')) {
    rituals.push('Еженедельное свидание без гаджетов — минимум 2 часа');
  }
  if (ll1.includes('words_of_affirmation') || ll2.includes('words_of_affirmation')) {
    rituals.push('Утреннее сообщение с благодарностью или комплиментом');
  }
  if (ll1.includes('physical_touch') || ll2.includes('physical_touch')) {
    rituals.push('Обнимайтесь минимум 20 секунд перед уходом и после возвращения');
  }
  if (ll1.includes('acts_of_service') || ll2.includes('acts_of_service')) {
    rituals.push('Раз в неделю делайте что-то за партнёра — то, что он обычно делает сам');
  }
  if (ll1.includes('receiving_gifts') || ll2.includes('receiving_gifts')) {
    rituals.push('Маленькие сюрпризы без повода — цветок, любимый десерт, записка');
  }
  if (rituals.length === 0) {
    rituals.push('Введите семейный ритуал — воскресный завтрак вместе или вечерняя прогулка');
  }

  const conflictZones: string[] = [];
  if (numScore < 60) conflictZones.push('Разные жизненные приоритеты (нумерология)');
  if (astroScore < 60) conflictZones.push('Несовпадение стихий (астрология)');
  if (elementsScore < 60) conflictZones.push('Разные кармические уроки (арканы)');
  if (psychResult.score < 60) conflictZones.push('Различия в психотипах и привычках');

  const growthAreas: string[] = [];
  if (numScore < 70) growthAreas.push('Учитесь принимать разные подходы к жизни');
  if (astroScore < 70) growthAreas.push('Изучите стихию партнёра — вода не тушит огонь, а уравновешивает');
  if (psychResult.score < 70) growthAreas.push('Заполните анкеты подробнее и обсудите результаты');

  return {
    member1Id: member1.id,
    member2Id: member2.id,
    member1Name: member1.name,
    member2Name: member2.name,
    score,
    strengths,
    weaknesses,
    advice: adviceList,
    loveLanguageMatch: psychResult.score,
    conflictZones,
    growthAreas,
    rituals,
    calculatedAt: new Date().toISOString(),
  };
}
