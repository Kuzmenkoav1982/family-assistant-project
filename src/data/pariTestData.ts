export type PariScaleKey =
  | 'irritability'
  | 'strictness'
  | 'avoidance'
  | 'overprotection'
  | 'warmth'
  | 'autonomy'
  | 'cooperation';

export interface PariScale {
  key: PariScaleKey;
  title: string;
  description: string;
  icon: string;
  color: string;
  goodWhen: 'low' | 'high';
  lowLabel: string;
  highLabel: string;
  recommendationsLow: string[];
  recommendationsHigh: string[];
}

export interface PariQuestion {
  id: number;
  scale: PariScaleKey;
  text: string;
  reverse?: boolean;
}

export const PARI_SCALES: PariScale[] = [
  {
    key: 'irritability',
    title: 'Раздражительность',
    description: 'Уровень эмоциональных срывов и вспыльчивости в общении с ребёнком',
    icon: 'Flame',
    color: '#EF4444',
    goodWhen: 'low',
    lowLabel: 'Спокойствие',
    highLabel: 'Срывы',
    recommendationsLow: [
      'Поддерживайте этот уровень — техники саморегуляции работают',
      'Делитесь опытом с другими родителями — это ценно',
    ],
    recommendationsHigh: [
      'Практикуйте паузу 10 секунд перед реакцией',
      'Ведите дневник триггеров — что именно выводит из себя',
      'Попробуйте дыхательные упражнения 4-7-8 утром',
      'Проконсультируйтесь с ИИ-психологом в разделе «Развитие»',
    ],
  },
  {
    key: 'strictness',
    title: 'Излишняя строгость',
    description: 'Жёсткость требований, авторитарность, строгая дисциплина',
    icon: 'Gavel',
    color: '#F97316',
    goodWhen: 'low',
    lowLabel: 'Гибкость',
    highLabel: 'Жёсткость',
    recommendationsLow: [
      'Баланс свободы и границ — у вас здоровый',
      'Продолжайте давать ребёнку выбор в мелочах',
    ],
    recommendationsHigh: [
      'Замените 2 правила «нельзя» на 1 «давай договоримся»',
      'Разрешайте ребёнку ошибаться — это часть роста',
      'Обсудите с ребёнком, какие правила ему кажутся несправедливыми',
    ],
  },
  {
    key: 'avoidance',
    title: 'Уклонение от конфликта',
    description: 'Избегание сложных разговоров, замалчивание проблем',
    icon: 'EyeOff',
    color: '#A855F7',
    goodWhen: 'low',
    lowLabel: 'Открытость',
    highLabel: 'Избегание',
    recommendationsLow: [
      'Вы умеете говорить о сложном — это редкий навык',
      'Учите ребёнка такой же открытости',
    ],
    recommendationsHigh: [
      'Назначайте «семейные пятиминутки» — раз в неделю обсуждаете что беспокоит',
      'Говорите о своих чувствах — «я расстроилась», а не «ты плохой»',
      'Не ждите идеального момента — его не будет',
    ],
  },
  {
    key: 'overprotection',
    title: 'Гиперопека',
    description: 'Чрезмерная забота, контроль, ограничение самостоятельности',
    icon: 'Shield',
    color: '#3B82F6',
    goodWhen: 'low',
    lowLabel: 'Доверие',
    highLabel: 'Контроль',
    recommendationsLow: [
      'Вы умеете отпускать — это даёт ребёнку силу',
      'Ребёнок развивает самостоятельность благодаря вам',
    ],
    recommendationsHigh: [
      'Передайте ребёнку 1 ответственность которую раньше держали сами',
      'Спросите: «Как ты сам думаешь решить?» вместо готового совета',
      'Разрешите небольшие риски — без них нет роста',
    ],
  },
  {
    key: 'warmth',
    title: 'Эмоциональная теплота',
    description: 'Способность выражать любовь, поддержку, понимать состояние ребёнка',
    icon: 'Heart',
    color: '#EC4899',
    goodWhen: 'high',
    lowLabel: 'Дистанция',
    highLabel: 'Близость',
    recommendationsLow: [
      'Обнимайте ребёнка хотя бы 1 раз в день — это база',
      'Говорите «я тебя люблю» вслух — даже подростку',
      'Слушайте без оценки — просто 5 минут в день',
    ],
    recommendationsHigh: [
      'Эмоциональная связь у вас сильная — это главный ресурс семьи',
      'Помогайте ребёнку называть свои чувства — это навык на всю жизнь',
    ],
  },
  {
    key: 'autonomy',
    title: 'Развитие активности ребёнка',
    description: 'Поощрение инициативы, самостоятельности, собственных интересов',
    icon: 'Rocket',
    color: '#10B981',
    goodWhen: 'high',
    lowLabel: 'Подавление',
    highLabel: 'Поддержка',
    recommendationsLow: [
      'Спрашивайте о мечтах ребёнка — даже странных',
      'Поддержите 1 хобби, которое вам не нравится — это его жизнь',
      'Не сравнивайте с другими — это убивает мотивацию',
    ],
    recommendationsHigh: [
      'Вы даёте ребёнку крылья — это бесценно',
      'Помогайте ставить цели и отмечать маленькие победы',
    ],
  },
  {
    key: 'cooperation',
    title: 'Сотрудничество',
    description: 'Совместные дела, переговоры, совместное решение проблем',
    icon: 'Handshake',
    color: '#14B8A6',
    goodWhen: 'high',
    lowLabel: 'Дистанция',
    highLabel: 'Партнёрство',
    recommendationsLow: [
      'Готовьте ужин вместе раз в неделю — простая магия',
      'Спрашивайте мнение ребёнка по важным семейным решениям',
      'Делайте проекты вместе: ремонт, поход, поделку',
    ],
    recommendationsHigh: [
      'Семья как команда — это ваша суперсила',
      'Закрепите формат семейных советов — раз в неделю',
    ],
  },
];

export const PARI_QUESTIONS: PariQuestion[] = [
  // Irritability (раздражительность)
  { id: 1, scale: 'irritability', text: 'Бывает, что я повышаю голос на ребёнка из-за пустяка' },
  { id: 2, scale: 'irritability', text: 'Меня легко вывести из себя поведением ребёнка' },
  { id: 3, scale: 'irritability', text: 'Я часто чувствую усталость и раздражение от родительских забот' },
  { id: 4, scale: 'irritability', text: 'Иногда я срываюсь на ребёнке, а потом жалею об этом' },
  { id: 5, scale: 'irritability', text: 'Я могу спокойно реагировать на любые капризы ребёнка', reverse: true },

  // Strictness (излишняя строгость)
  { id: 6, scale: 'strictness', text: 'Дети должны беспрекословно слушаться родителей' },
  { id: 7, scale: 'strictness', text: 'Строгая дисциплина — основа правильного воспитания' },
  { id: 8, scale: 'strictness', text: 'Я считаю, что наказание полезнее похвалы' },
  { id: 9, scale: 'strictness', text: 'У меня в семье много запретов и правил' },
  { id: 10, scale: 'strictness', text: 'Я готов(а) обсуждать с ребёнком семейные правила', reverse: true },

  // Avoidance (уклонение от конфликта)
  { id: 11, scale: 'avoidance', text: 'Я предпочитаю промолчать, лишь бы избежать ссоры' },
  { id: 12, scale: 'avoidance', text: 'Сложные темы с ребёнком я стараюсь обходить' },
  { id: 13, scale: 'avoidance', text: 'Лучше сделать вид, что не заметил(а), чем разбираться' },
  { id: 14, scale: 'avoidance', text: 'Я редко говорю ребёнку о том, что меня беспокоит' },
  { id: 15, scale: 'avoidance', text: 'Я открыто обсуждаю с ребёнком наши разногласия', reverse: true },

  // Overprotection (гиперопека)
  { id: 16, scale: 'overprotection', text: 'Я постоянно контролирую, что делает мой ребёнок' },
  { id: 17, scale: 'overprotection', text: 'Я волнуюсь, если ребёнок далеко от меня' },
  { id: 18, scale: 'overprotection', text: 'Я часто делаю за ребёнка то, что он мог бы сам' },
  { id: 19, scale: 'overprotection', text: 'Мне трудно отпускать ребёнка одного куда-либо' },
  { id: 20, scale: 'overprotection', text: 'Я доверяю ребёнку решать его дела самостоятельно', reverse: true },

  // Warmth (эмоциональная теплота)
  { id: 21, scale: 'warmth', text: 'Я часто обнимаю и говорю ребёнку, что люблю его' },
  { id: 22, scale: 'warmth', text: 'Я внимательно слушаю, когда ребёнок делится переживаниями' },
  { id: 23, scale: 'warmth', text: 'Я понимаю, когда ребёнку грустно, и поддерживаю его' },
  { id: 24, scale: 'warmth', text: 'Ребёнок знает, что может прийти ко мне с любой проблемой' },
  { id: 25, scale: 'warmth', text: 'Я редко проявляю нежность к ребёнку открыто', reverse: true },

  // Autonomy (развитие активности ребёнка)
  { id: 26, scale: 'autonomy', text: 'Я поощряю интересы и увлечения ребёнка' },
  { id: 27, scale: 'autonomy', text: 'Я даю ребёнку возможность делать собственный выбор' },
  { id: 28, scale: 'autonomy', text: 'Я радуюсь, когда ребёнок проявляет инициативу' },
  { id: 29, scale: 'autonomy', text: 'Я помогаю ребёнку ставить цели и достигать их' },
  { id: 30, scale: 'autonomy', text: 'Я считаю, что ребёнок должен делать только то, что я скажу', reverse: true },

  // Cooperation (сотрудничество)
  { id: 31, scale: 'cooperation', text: 'Мы регулярно делаем что-то вместе всей семьёй' },
  { id: 32, scale: 'cooperation', text: 'Я обсуждаю с ребёнком важные семейные решения' },
  { id: 33, scale: 'cooperation', text: 'Мы вместе ищем решение, когда возникает проблема' },
  { id: 34, scale: 'cooperation', text: 'Мне нравится проводить свободное время с ребёнком' },
  { id: 35, scale: 'cooperation', text: 'У нас с ребёнком мало общих дел и интересов', reverse: true },
];

export const PARI_ANSWERS = [
  { value: 1, label: 'Категорически не согласен' },
  { value: 2, label: 'Скорее не согласен' },
  { value: 3, label: 'Скорее согласен' },
  { value: 4, label: 'Полностью согласен' },
];

export interface PariScaleResult {
  scale: PariScale;
  rawScore: number;
  maxScore: number;
  percent: number;
  level: 'low' | 'medium' | 'high';
  isHealthy: boolean;
  recommendations: string[];
}

export function calculatePariResults(answers: Record<number, number>): PariScaleResult[] {
  return PARI_SCALES.map((scale) => {
    const questions = PARI_QUESTIONS.filter((q) => q.scale === scale.key);
    let raw = 0;
    let answered = 0;
    for (const q of questions) {
      const v = answers[q.id];
      if (v == null) continue;
      const score = q.reverse ? 5 - v : v;
      raw += score;
      answered += 1;
    }
    const max = answered * 4;
    const percent = max > 0 ? Math.round((raw / max) * 100) : 0;

    let level: 'low' | 'medium' | 'high' = 'medium';
    if (percent < 40) level = 'low';
    else if (percent >= 70) level = 'high';

    const isHealthy = scale.goodWhen === 'low' ? percent < 50 : percent >= 60;
    const recommendations = scale.goodWhen === 'low'
      ? (percent < 50 ? scale.recommendationsLow : scale.recommendationsHigh)
      : (percent >= 60 ? scale.recommendationsHigh : scale.recommendationsLow);

    return { scale, rawScore: raw, maxScore: max, percent, level, isHealthy, recommendations };
  });
}

export function getOverallScore(results: PariScaleResult[]): { score: number; label: string; color: string } {
  const healthy = results.filter((r) => r.isHealthy).length;
  const score = Math.round((healthy / results.length) * 100);
  if (score >= 80) return { score, label: 'Отличный детско-родительский контакт', color: '#10B981' };
  if (score >= 60) return { score, label: 'Хороший контакт, есть зоны роста', color: '#3B82F6' };
  if (score >= 40) return { score, label: 'Средний контакт, нужна работа', color: '#F59E0B' };
  return { score, label: 'Контакт нарушен, рекомендуем консультацию', color: '#EF4444' };
}
