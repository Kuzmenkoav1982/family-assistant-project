import type { TarotCard, TarotArcana, DestinyMatrix } from '@/types/family-code.types';
import { reduceToSingleDigit } from '@/lib/numerology';

const ARCANA_DATA: Record<TarotArcana, Omit<TarotCard, 'id'>> = {
  fool:           { number: 0,  name: 'Шут',            emoji: '🃏', keywords: ['Свобода', 'Начало', 'Спонтанность'],     meaning: 'Начало нового пути, свобода от условностей, детская чистота восприятия. Шут идёт по жизни легко, доверяя интуиции.',                                                advice: 'Не бойтесь рисковать и начинать с нуля. Ваш дар — видеть мир без шаблонов.' },
  magician:       { number: 1,  name: 'Маг',            emoji: '🪄', keywords: ['Воля', 'Мастерство', 'Действие'],        meaning: 'Воля, умение превращать идеи в реальность. Маг владеет всеми стихиями — это знак созидателя и мастера.',                                                              advice: 'Используйте свои таланты осознанно. Ваша сила — в концентрации и целеустремлённости.' },
  highPriestess:  { number: 2,  name: 'Жрица',          emoji: '🌙', keywords: ['Интуиция', 'Тайна', 'Мудрость'],         meaning: 'Глубокая интуиция, скрытые знания, внутренняя мудрость. Жрица хранит тайны подсознания.',                                                                               advice: 'Слушайте внутренний голос. Ваша сила — в тишине и созерцании.' },
  empress:        { number: 3,  name: 'Императрица',    emoji: '👑', keywords: ['Плодородие', 'Забота', 'Красота'],       meaning: 'Женская энергия, плодородие, материнство. Императрица дарит изобилие и гармонию всему вокруг.',                                                                       advice: 'Создавайте красоту и уют. Ваша сила — в любви и заботе о других.' },
  emperor:        { number: 4,  name: 'Император',      emoji: '🏛️', keywords: ['Власть', 'Порядок', 'Структура'],       meaning: 'Мужская энергия, власть, структура. Император строит порядок и обеспечивает стабильность.',                                                                              advice: 'Берите ответственность на себя. Ваша сила — в дисциплине и лидерстве.' },
  hierophant:     { number: 5,  name: 'Иерофант',       emoji: '📜', keywords: ['Традиции', 'Учение', 'Вера'],            meaning: 'Духовный учитель, хранитель традиций, мост между мирами. Иерофант передаёт мудрость поколений.',                                                                       advice: 'Уважайте традиции, но не бойтесь создавать новые. Ваш путь — учить и учиться.' },
  lovers:         { number: 6,  name: 'Влюблённые',     emoji: '💕', keywords: ['Любовь', 'Выбор', 'Единение'],           meaning: 'Любовь, союз, выбор сердцем. Влюблённые учат принимать решения, следуя за чувствами.',                                                                                  advice: 'Доверяйте своему сердцу в важных решениях. Любовь — ваш главный компас.' },
  chariot:        { number: 7,  name: 'Колесница',      emoji: '⚡', keywords: ['Победа', 'Движение', 'Воля'],            meaning: 'Победа через силу воли и движение вперёд. Колесница символизирует преодоление препятствий.',                                                                            advice: 'Двигайтесь к цели, несмотря ни на что. Ваша сила — в решимости и действии.' },
  strength:       { number: 8,  name: 'Сила',           emoji: '🦁', keywords: ['Мужество', 'Терпение', 'Мягкость'],      meaning: 'Внутренняя сила, укрощение инстинктов мягкостью. Сила — не в кулаках, а в сердце.',                                                                                     advice: 'Побеждайте мягкостью, а не агрессией. Ваша сила — в терпении и сострадании.' },
  hermit:         { number: 9,  name: 'Отшельник',      emoji: '🏔️', keywords: ['Мудрость', 'Одиночество', 'Поиск'],     meaning: 'Поиск истины в уединении, внутренний свет, мудрость опыта. Отшельник освещает путь другим.',                                                                            advice: 'Не бойтесь уединения. Ваши лучшие решения приходят в тишине.' },
  wheelOfFortune: { number: 10, name: 'Колесо Фортуны', emoji: '🎡', keywords: ['Судьба', 'Цикл', 'Перемены'],            meaning: 'Цикличность жизни, повороты судьбы, кармические уроки. Колесо напоминает: всё меняется.',                                                                              advice: 'Принимайте перемены как часть жизни. За чёрной полосой всегда идёт белая.' },
  justice:        { number: 11, name: 'Справедливость',  emoji: '⚖️', keywords: ['Баланс', 'Честность', 'Карма'],         meaning: 'Закон причины и следствия, справедливость, баланс. Каждое действие имеет последствия.',                                                                                 advice: 'Будьте честны с собой и другими. Карма возвращает всё сторицей.' },
  hangedMan:      { number: 12, name: 'Повешенный',     emoji: '🔮', keywords: ['Жертва', 'Новый взгляд', 'Пауза'],      meaning: 'Добровольная пауза, взгляд на мир под другим углом. Иногда нужно остановиться, чтобы увидеть путь.',                                                                   advice: 'Остановитесь и посмотрите на ситуацию с другой стороны. Ваша сила — в гибкости восприятия.' },
  death:          { number: 13, name: 'Смерть',         emoji: '🌅', keywords: ['Трансформация', 'Обновление', 'Конец'],   meaning: 'Не физическая смерть, а трансформация. Конец старого и начало нового. Необходимое обновление.',                                                                        advice: 'Отпускайте прошлое без страха. Каждый конец — это новое начало.' },
  temperance:     { number: 14, name: 'Умеренность',    emoji: '🌈', keywords: ['Баланс', 'Гармония', 'Терпение'],        meaning: 'Алхимия духа, баланс противоположностей, терпение и мера. Умеренность — путь золотой середины.',                                                                       advice: 'Избегайте крайностей. Гармония — в балансе всех сфер жизни.' },
  devil:          { number: 15, name: 'Дьявол',         emoji: '⛓️', keywords: ['Зависимость', 'Иллюзия', 'Страсть'],    meaning: 'Зависимости, иллюзии, теневая сторона. Дьявол показывает цепи, которые мы надеваем на себя сами.',                                                                    advice: 'Осознайте свои зависимости и ограничения. Свобода начинается с честности.' },
  tower:          { number: 16, name: 'Башня',          emoji: '💥', keywords: ['Разрушение', 'Прозрение', 'Освобождение'], meaning: 'Внезапные перемены, разрушение иллюзий, болезненное, но необходимое пробуждение.',                                                                                      advice: 'Кризисы — это возможности для роста. На руинах старого строится новое.' },
  star:           { number: 17, name: 'Звезда',         emoji: '⭐', keywords: ['Надежда', 'Вдохновение', 'Исцеление'],   meaning: 'Свет после тьмы, надежда, вдохновение. Звезда указывает путь и дарит веру.',                                                                                            advice: 'Верьте в лучшее. Ваш свет помогает другим найти путь.' },
  moon:           { number: 18, name: 'Луна',           emoji: '🌙', keywords: ['Иллюзии', 'Подсознание', 'Страхи'],     meaning: 'Мир подсознания, страхи, иллюзии. Луна показывает скрытое и заставляет встретиться с тенями.',                                                                         advice: 'Исследуйте свои страхи. За ними скрываются ответы и сила.' },
  sun:            { number: 19, name: 'Солнце',         emoji: '☀️', keywords: ['Радость', 'Успех', 'Ясность'],           meaning: 'Радость, успех, ясность, детская непосредственность. Солнце — самая позитивная карта.',                                                                                  advice: 'Излучайте радость и оптимизм. Ваша энергия заразительна для окружающих.' },
  judgement:      { number: 20, name: 'Суд',            emoji: '🔔', keywords: ['Пробуждение', 'Призвание', 'Оценка'],    meaning: 'Пробуждение, осознание своего призвания, переоценка пройденного пути.',                                                                                                advice: 'Прислушайтесь к зову. Ваша миссия ждёт осознания.' },
  world:          { number: 21, name: 'Мир',            emoji: '🌍', keywords: ['Завершение', 'Целостность', 'Гармония'], meaning: 'Завершение цикла, целостность, достижение мудрости. Мир — это состояние полноты и гармонии.',                                                                           advice: 'Вы на пороге нового уровня. Примите всё, что было, с благодарностью.' },
};

const ARCANA_KEYS: TarotArcana[] = [
  'fool', 'magician', 'highPriestess', 'empress', 'emperor',
  'hierophant', 'lovers', 'chariot', 'strength', 'hermit',
  'wheelOfFortune', 'justice', 'hangedMan', 'death', 'temperance',
  'devil', 'tower', 'star', 'moon', 'sun', 'judgement', 'world'
];

function getArcanaByNumber(num: number): TarotCard {
  const normalized = num > 22 ? reduceToSingleDigit(num, false) : num;
  const clamped = Math.max(0, Math.min(21, normalized));
  const key = ARCANA_KEYS[clamped];
  const data = ARCANA_DATA[key];
  return { id: key, ...data };
}

export function calculateDestinyMatrix(birthDate: string): DestinyMatrix | null {
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return null;

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const personalityNum = reduceToSingleDigit(day, false);
  const soulNum = reduceToSingleDigit(month, false);

  const yearDigits = String(year).split('').reduce((s, d) => s + parseInt(d, 10), 0);
  const karmaNum = reduceToSingleDigit(yearDigits, false);

  const destinyNum = reduceToSingleDigit(day + month + yearDigits, false);

  const personalityCard = getArcanaByNumber(personalityNum);
  const soulCard = getArcanaByNumber(soulNum);
  const karmaCard = getArcanaByNumber(karmaNum);
  const destinyCard = getArcanaByNumber(destinyNum);

  const mission = `Ваша личность (${personalityCard.name}) взаимодействует с душой (${soulCard.name}), ` +
    `проходя кармические уроки (${karmaCard.name}), чтобы прийти к своему предназначению (${destinyCard.name}). ` +
    `Главная задача — интегрировать ${personalityCard.keywords[0].toLowerCase()}, ${soulCard.keywords[0].toLowerCase()} ` +
    `и ${destinyCard.keywords[0].toLowerCase()} в единый жизненный путь.`;

  return { personalityCard, soulCard, karmaCard, destinyCard, mission };
}

export function getArcanaCompatibility(card1: TarotCard, card2: TarotCard): number {
  if (card1.number === card2.number) return 80;
  const diff = Math.abs(card1.number - card2.number);
  if (diff <= 3) return 75;
  if (diff <= 7) return 60;
  return 50;
}

export { ARCANA_DATA, ARCANA_KEYS };
