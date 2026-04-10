import type { FamilyMember } from '@/types/family.types';
import { calculateNumerologyProfile } from '@/lib/numerology';
import { calculateAstrologyProfile, getElementLabel } from '@/lib/astrology';
import { calculateDestinyMatrix } from '@/lib/tarot-arcana';
import { calculateBiorhythm } from '@/lib/biorhythms';
import { calculateCoupleCompatibility } from '@/lib/compatibility';

function getBd(m: FamilyMember): string | null {
  return m.birth_date || m.birthDate || null;
}

function buildMemberSummary(m: FamilyMember): string {
  const parts: string[] = [];
  parts.push(`${m.name} (${m.role})`);

  const bd = getBd(m);
  if (bd) {
    const num = calculateNumerologyProfile(m.name, bd);
    const astro = calculateAstrologyProfile(bd);
    const tarot = calculateDestinyMatrix(bd);
    const today = new Date().toISOString().split('T')[0];
    const bio = calculateBiorhythm(bd, today);

    parts.push(`Число жизненного пути: ${num.lifePath.value} (${num.lifePath.title} — ${num.lifePath.shortMeaning})`);
    parts.push(`Число судьбы: ${num.destiny.value} (${num.destiny.title})`);
    parts.push(`Число души: ${num.soul.value} (${num.soul.title})`);

    if (astro) {
      parts.push(`Зодиак: ${astro.zodiacSignLabel} (${getElementLabel(astro.zodiacElement)}, планета ${astro.zodiacPlanet})`);
      parts.push(`Восточный знак: ${astro.chineseAnimalLabel} (${getElementLabel(astro.chineseElement)}, ${astro.chineseYinYang === 'yin' ? 'Инь' : 'Ян'})`);
    }

    if (tarot) {
      parts.push(`Аркан личности: ${tarot.personalityCard.name}, Аркан души: ${tarot.soulCard.name}, Предназначение: ${tarot.destinyCard.name}`);
    }

    const bioPct = (v: number) => Math.round((v + 1) * 50);
    parts.push(`Биоритмы сегодня: физ ${bioPct(bio.physical)}%, эмо ${bioPct(bio.emotional)}%, инт ${bioPct(bio.intellectual)}%`);
  }

  const profile = m.profile;
  if (profile) {
    if (profile.personalityType) parts.push(`Тип личности: ${profile.personalityType}`);
    if (profile.energyType) parts.push(`Энерготип: ${profile.energyType}`);
    if (profile.loveLanguages?.length) {
      const ll: Record<string, string> = {
        words_of_affirmation: 'Слова поддержки',
        quality_time: 'Время вместе',
        receiving_gifts: 'Подарки',
        acts_of_service: 'Помощь делом',
        physical_touch: 'Прикосновения',
      };
      parts.push(`Языки любви: ${profile.loveLanguages.map(l => ll[l] || l).join(', ')}`);
    }
    if (profile.triggers?.length) parts.push(`Триггеры: ${profile.triggers.join(', ')}`);
    if (profile.hobbies?.length) parts.push(`Хобби: ${profile.hobbies.join(', ')}`);
    if (profile.stressRelief?.length) parts.push(`Снятие стресса: ${profile.stressRelief.join(', ')}`);
    if (profile.communicationStyle) parts.push(`Стиль общения: ${profile.communicationStyle}`);
  }

  return parts.join('. ');
}

function buildCoupleContext(m1: FamilyMember, m2: FamilyMember): string {
  const result = calculateCoupleCompatibility(m1, m2);
  if (!result) return '';

  const parts: string[] = [];
  parts.push(`Совместимость ${m1.name} и ${m2.name}: общая ${result.score.overall}%`);
  parts.push(`По пластам: нумерология ${result.score.numerology}%, астрология ${result.score.astrology}%, арканы ${result.score.elements}%, психология ${result.score.psychology}%`);

  if (result.strengths.length) parts.push(`Сильные стороны: ${result.strengths.join('; ')}`);
  if (result.weaknesses.length) parts.push(`Зоны роста: ${result.weaknesses.join('; ')}`);
  if (result.conflictZones.length) parts.push(`Зоны конфликтов: ${result.conflictZones.join('; ')}`);

  return parts.join('. ');
}

export function buildFamilyContext(members: FamilyMember[], currentUserId?: string): string {
  if (members.length === 0) return '';

  const lines: string[] = [];
  lines.push('=== ДАННЫЕ О СЕМЬЕ (используй для персонализированных советов) ===');

  const currentMember = currentUserId
    ? members.find(m => m.user_id === currentUserId || m.id === currentUserId)
    : null;

  if (currentMember) {
    lines.push(`\nТЕКУЩИЙ ПОЛЬЗОВАТЕЛЬ:\n${buildMemberSummary(currentMember)}`);
  }

  lines.push(`\nВСЕ ЧЛЕНЫ СЕМЬИ (${members.length}):`);
  members.forEach(m => {
    lines.push(`- ${buildMemberSummary(m)}`);
  });

  const adults = members.filter(m =>
    ['владелец', 'жена', 'муж', 'супруг', 'супруга', 'партнёр'].some(r =>
      m.role.toLowerCase().includes(r)
    )
  );

  if (adults.length === 2 && getBd(adults[0]) && getBd(adults[1])) {
    const coupleCtx = buildCoupleContext(adults[0], adults[1]);
    if (coupleCtx) {
      lines.push(`\nСОВМЕСТИМОСТЬ ПАРЫ:\n${coupleCtx}`);
    }
  }

  lines.push('\n=== ИНСТРУКЦИЯ ===');
  lines.push('Используй данные выше для персонализированных советов. Обращайся к человеку по имени.');
  lines.push('При вопросах о конфликтах учитывай совместимость, языки любви и триггеры обоих.');
  lines.push('При вопросах о здоровье учитывай биоритмы. При вопросах о будущем — арканы и нумерологию.');
  lines.push('Не пересказывай данные напрямую — интегрируй их в советы естественно.');

  return lines.join('\n');
}
