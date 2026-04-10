import { calculateNumerologyProfile, getNumberInfo } from '@/lib/numerology';
import { calculatePythagorasSquare } from '@/lib/pythagoras-square';
import { calculateAstrologyProfile, getElementLabel } from '@/lib/astrology';

export interface ChildTalent {
  area: string;
  icon: string;
  score: number;
  description: string;
  activities: string[];
}

export interface ChildCodeResult {
  name: string;
  talents: ChildTalent[];
  learningStyle: string;
  socialType: string;
  motivationType: string;
  parentTips: string[];
  warningSign: string[];
  idealActivities: string[];
}

const TALENT_MAP: Record<number, { area: string; icon: string; desc: string; activities: string[] }[]> = {
  1: [{ area: 'Лидерство', icon: '👑', desc: 'Прирождённый лидер, умеет вести за собой', activities: ['Командные виды спорта (капитан)', 'Школьное самоуправление', 'Театральная студия'] }],
  2: [{ area: 'Дипломатия', icon: '🤝', desc: 'Умеет находить общий язык со всеми', activities: ['Командные проекты', 'Волонтёрство', 'Медиация в классе'] }],
  3: [{ area: 'Творчество', icon: '🎨', desc: 'Яркое воображение и артистизм', activities: ['Рисование, лепка', 'Музыка, пение', 'Литературное творчество', 'Театр'] }],
  4: [{ area: 'Конструирование', icon: '🔧', desc: 'Любит строить, мастерить, разбирать', activities: ['Робототехника', 'Моделирование', 'Шахматы', 'Программирование'] }],
  5: [{ area: 'Исследование', icon: '🔍', desc: 'Неутомимый исследователь, любит всё новое', activities: ['Путешествия', 'Иностранные языки', 'Походы', 'Научные эксперименты'] }],
  6: [{ area: 'Забота', icon: '💗', desc: 'Заботливый, ответственный, хочет помогать', activities: ['Уход за животными', 'Волонтёрство', 'Медицина (будущее)', 'Кулинария'] }],
  7: [{ area: 'Интеллект', icon: '🧠', desc: 'Глубокий ум, склонность к анализу и философии', activities: ['Олимпиады', 'Чтение', 'Научные кружки', 'Астрономия'] }],
  8: [{ area: 'Предприимчивость', icon: '💼', desc: 'Предприимчивый, понимает ценность вещей', activities: ['Бизнес-игры', 'Финансовая грамотность', 'Проектная работа'] }],
  9: [{ area: 'Гуманизм', icon: '🌍', desc: 'Сочувствующий, мечтает изменить мир', activities: ['Экология', 'Социальные проекты', 'Творчество', 'Психология'] }],
};

const LEARNING_STYLES: Record<string, string> = {
  fire: 'Кинестетик — учится через действие. Нужны эксперименты, движение, соревнования. Скука — главный враг.',
  earth: 'Практик — учится через конкретные примеры. Нужна структура, расписание, видимый результат.',
  air: 'Визуал-аудиал — учится через общение и обсуждение. Нужны дискуссии, презентации, работа в группе.',
  water: 'Эмоциональный ученик — учится через образы и чувства. Нужна атмосфера, музыка, творческий подход.',
};

export function calculateChildCode(name: string, birthDate: string): ChildCodeResult {
  const num = calculateNumerologyProfile(name, birthDate);
  const pyth = calculatePythagorasSquare(birthDate);
  const astro = calculateAstrologyProfile(birthDate);

  const talents: ChildTalent[] = [];

  const mainTalents = TALENT_MAP[num.lifePath.value] || TALENT_MAP[3];
  mainTalents.forEach(t => {
    talents.push({ ...t, score: 90 });
  });

  const soulTalents = TALENT_MAP[num.soul.value];
  if (soulTalents) {
    soulTalents.forEach(t => {
      if (!talents.find(ex => ex.area === t.area)) {
        talents.push({ ...t, score: 75 });
      }
    });
  }

  const strongCells = pyth.cells.filter(c => c.count >= 3);
  strongCells.forEach(cell => {
    if (cell.number === 3 && !talents.find(t => t.area === 'Творчество')) {
      talents.push({ area: 'Наука', icon: '🔬', score: 80, description: 'Аналитический склад ума', activities: ['Олимпиады', 'Научные кружки'] });
    }
    if (cell.number === 6 && !talents.find(t => t.area === 'Конструирование')) {
      talents.push({ area: 'Ручной труд', icon: '✋', score: 80, description: 'Золотые руки, мастерство', activities: ['Моделирование', 'Рукоделие', 'Столярка'] });
    }
    if (cell.number === 7) {
      talents.push({ area: 'Везение', icon: '🍀', score: 70, description: 'Природная удачливость', activities: ['Соревнования', 'Конкурсы'] });
    }
  });

  const element = astro ? getElementLabel(astro.zodiacElement) : 'water';
  const learningStyle = LEARNING_STYLES[astro?.zodiacElement || 'water'] || LEARNING_STYLES.water;

  let socialType = 'Общительный';
  if (num.lifePath.value === 7 || num.lifePath.value === 4) socialType = 'Интроверт — ценит небольшой круг близких друзей';
  else if (num.lifePath.value === 3 || num.lifePath.value === 5) socialType = 'Экстраверт — душа компании, много друзей';
  else if (num.lifePath.value === 2 || num.lifePath.value === 6) socialType = 'Эмпат — глубоко чувствует настроение окружающих';
  else socialType = 'Адаптивный — легко подстраивается под ситуацию';

  let motivationType = 'Похвала и признание';
  if ([1, 8].includes(num.lifePath.value)) motivationType = 'Вызов и соревнование — мотивируется через «Спорим, не сможешь?»';
  else if ([2, 6].includes(num.lifePath.value)) motivationType = 'Одобрение и поддержка — нуждается в «Ты молодец, я горжусь»';
  else if ([3, 5].includes(num.lifePath.value)) motivationType = 'Новизна и свобода — скука убивает мотивацию, нужно разнообразие';
  else if ([4, 7].includes(num.lifePath.value)) motivationType = 'Логика и результат — нужно понимать «зачем это мне»';
  else motivationType = 'Смысл и миссия — вдохновляется высокими целями';

  const parentTips: string[] = [
    `Число ${num.lifePath.value} (${num.lifePath.title}) — ${num.lifePath.shortMeaning}`,
    `Развивайте главный талант: ${talents[0]?.area || 'Творчество'}`,
    `Стиль обучения: ${learningStyle.split(' — ')[0]}`,
  ];

  if (pyth.cells.find(c => c.number === 1 && c.count === 0)) {
    parentTips.push('Низкий показатель характера — мягко развивайте уверенность через маленькие победы');
  }
  if (pyth.cells.find(c => c.number === 2 && c.count === 0)) {
    parentTips.push('Мало энергии — следите за режимом сна, питанием, физической активностью');
  }

  if (astro) {
    parentTips.push(`${astro.zodiacEmoji} ${astro.zodiacSignLabel} (${element}) — учитывайте стихию при выборе занятий`);
  }

  const warningSign: string[] = [];
  if (pyth.cells.find(c => c.number === 1 && c.count >= 4)) warningSign.push('Склонность к диктаторству — учите считаться с мнением других');
  if (pyth.cells.find(c => c.number === 2 && c.count === 0)) warningSign.push('Быстрая утомляемость — не перегружайте секциями');
  if (pyth.cells.find(c => c.number === 5 && c.count === 0)) warningSign.push('Слабая интуиция — учите доверять себе и своим ощущениям');
  if ([1, 8].includes(num.lifePath.value)) warningSign.push('Лидерская натура может быть властной — учите кооперации');

  const idealActivities = talents.flatMap(t => t.activities).slice(0, 8);

  return { name, talents, learningStyle, socialType, motivationType, parentTips, warningSign, idealActivities };
}
