import type { SphereKey } from '@/types/portfolio.types';

export type AgeBand = '0-3' | '4-6' | '7-10' | '11-14' | '15-17' | '18+';

export interface PlanTemplate {
  id: string;
  age_bands: AgeBand[];
  sphere: SphereKey;
  title: string;
  description: string;
  milestone: string;
  next_step: string;
  duration_days: number;
  emoji: string;
}

export function ageToBand(age: number | null | undefined): AgeBand | null {
  if (age === null || age === undefined) return null;
  if (age <= 3) return '0-3';
  if (age <= 6) return '4-6';
  if (age <= 10) return '7-10';
  if (age <= 14) return '11-14';
  if (age <= 17) return '15-17';
  return '18+';
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  // ===== 0-3 года =====
  {
    id: 'tpl_03_body_motor',
    age_bands: ['0-3'],
    sphere: 'body',
    title: 'Крупная моторика: ходьба и равновесие',
    description: 'Регулярные игры на координацию: догонялки, прыжки, лазание',
    milestone: 'Уверенно ходит, прыгает на двух ногах, поднимается по лестнице',
    next_step: 'Гулять минимум час в день с активными играми',
    duration_days: 90,
    emoji: '🧸',
  },
  {
    id: 'tpl_03_intellect_speech',
    age_bands: ['0-3'],
    sphere: 'intellect',
    title: 'Развитие речи: словарный запас',
    description: 'Чтение книжек-картинок, повторение слов, песенки и стихи',
    milestone: 'Активный словарь — 100+ слов, фразы из 2–3 слов',
    next_step: 'Читать каждый вечер 15 минут перед сном',
    duration_days: 60,
    emoji: '📚',
  },
  {
    id: 'tpl_03_emotions_basics',
    age_bands: ['0-3'],
    sphere: 'emotions',
    title: 'Узнаём базовые эмоции',
    description: 'Называем эмоции в книжках и в жизни: радость, грусть, злость, страх',
    milestone: 'Может показать и назвать 4 базовые эмоции',
    next_step: 'Каждый день называть свою эмоцию ребёнку',
    duration_days: 45,
    emoji: '😊',
  },

  // ===== 4-6 лет =====
  {
    id: 'tpl_46_intellect_letters',
    age_bands: ['4-6'],
    sphere: 'intellect',
    title: 'Знакомство с буквами и цифрами',
    description: 'Игровое изучение алфавита и счёта до 10',
    milestone: 'Узнаёт все буквы, считает до 10, складывает простые слова',
    next_step: 'Каждый день 10 минут букв и 10 минут счёта',
    duration_days: 90,
    emoji: '🔤',
  },
  {
    id: 'tpl_46_life_routines',
    age_bands: ['4-6'],
    sphere: 'life_skills',
    title: 'Утренние и вечерние ритуалы',
    description: 'Учим самостоятельно одеваться, чистить зубы, убирать игрушки',
    milestone: 'Самостоятельно проходит утренний ритуал',
    next_step: 'Сделать визуальное расписание дня и повесить в комнате',
    duration_days: 30,
    emoji: '🪥',
  },
  {
    id: 'tpl_46_social_friends',
    age_bands: ['4-6'],
    sphere: 'social',
    title: 'Учимся играть с другими детьми',
    description: 'Совместные игры, делиться, договариваться, ждать очереди',
    milestone: 'Может играть в группе 30+ минут без конфликтов',
    next_step: 'Раз в неделю — игровая встреча с другими детьми',
    duration_days: 60,
    emoji: '🤝',
  },
  {
    id: 'tpl_46_creativity_draw',
    age_bands: ['4-6'],
    sphere: 'creativity',
    title: 'Рисование и творчество',
    description: 'Регулярные занятия рисованием, пластилин, аппликации',
    milestone: 'Сделал 10 любимых работ для домашней галереи',
    next_step: 'Завести альбом и обновлять раз в неделю',
    duration_days: 90,
    emoji: '🎨',
  },
  {
    id: 'tpl_46_emotions_words',
    age_bands: ['4-6'],
    sphere: 'emotions',
    title: 'Учимся говорить о чувствах',
    description: 'Расширяем эмоциональный словарь: обида, радость, гордость, тревога',
    milestone: 'Может назвать свою эмоцию и причину словами',
    next_step: 'Вечером спрашивать: «какое было лучшее и худшее за день?»',
    duration_days: 45,
    emoji: '💗',
  },

  // ===== 7-10 лет =====
  {
    id: 'tpl_710_intellect_reading',
    age_bands: ['7-10'],
    sphere: 'intellect',
    title: 'Привычка читать каждый день',
    description: 'Чтение по 20–30 минут в день — художественная литература',
    milestone: 'Прочитал 5 книг по выбору',
    next_step: 'Договориться о времени чтения и подобрать первую книгу',
    duration_days: 90,
    emoji: '📖',
  },
  {
    id: 'tpl_710_finance_pocket',
    age_bands: ['7-10'],
    sphere: 'finance',
    title: 'Карманные деньги и бюджет',
    description: 'Регулярная сумма карманных, учим копить и тратить осознанно',
    milestone: 'Накопил на собственную первую цель',
    next_step: 'Договориться о сумме и завести копилку',
    duration_days: 60,
    emoji: '💰',
  },
  {
    id: 'tpl_710_life_homework',
    age_bands: ['7-10'],
    sphere: 'life_skills',
    title: 'Самостоятельная работа над уроками',
    description: 'Учимся планировать домашние задания и делать их без напоминаний',
    milestone: 'Неделю делает уроки самостоятельно',
    next_step: 'Завести ежедневник и проверить с ним расписание',
    duration_days: 45,
    emoji: '✏️',
  },
  {
    id: 'tpl_710_body_sport',
    age_bands: ['7-10'],
    sphere: 'body',
    title: 'Регулярный спорт или секция',
    description: 'Минимум 2 тренировки в неделю — любой вид активности',
    milestone: 'Ходит на секцию 2 месяца без пропусков',
    next_step: 'Выбрать секцию вместе с ребёнком и записаться',
    duration_days: 90,
    emoji: '⚽',
  },
  {
    id: 'tpl_710_creativity_hobby',
    age_bands: ['7-10'],
    sphere: 'creativity',
    title: 'Постоянное хобби или увлечение',
    description: 'Поиск и развитие любимого занятия — музыка, рисование, конструирование',
    milestone: 'Регулярно занимается любимым делом 8 недель подряд',
    next_step: 'Попробовать 2–3 направления и выбрать одно',
    duration_days: 60,
    emoji: '🎭',
  },
  {
    id: 'tpl_710_emotions_diary',
    age_bands: ['7-10'],
    sphere: 'emotions',
    title: 'Дневник настроения',
    description: 'Учимся замечать и фиксировать эмоции — 1 запись в день',
    milestone: 'Месяц регулярных записей',
    next_step: 'Купить блокнот и сделать первые 3 записи вместе',
    duration_days: 30,
    emoji: '📓',
  },
  {
    id: 'tpl_710_values_family',
    age_bands: ['7-10'],
    sphere: 'values',
    title: 'Семейные традиции и ценности',
    description: 'Регулярные семейные ритуалы: совместный ужин, выходные, разговоры',
    milestone: 'Запустили 2 устойчивые традиции',
    next_step: 'Составить список традиций, которые хотим завести',
    duration_days: 60,
    emoji: '🏠',
  },

  // ===== 11-14 лет =====
  {
    id: 'tpl_1114_life_independence',
    age_bands: ['11-14'],
    sphere: 'life_skills',
    title: 'Самостоятельность: путь до школы и обратно',
    description: 'Учимся передвигаться по городу, пользоваться транспортом, планировать время',
    milestone: 'Ездит самостоятельно 2 недели подряд',
    next_step: 'Пройти маршрут вместе и обсудить ситуации',
    duration_days: 30,
    emoji: '🚌',
  },
  {
    id: 'tpl_1114_finance_planning',
    age_bands: ['11-14'],
    sphere: 'finance',
    title: 'Планирование бюджета на месяц',
    description: 'Учимся распределять деньги: траты, накопления, подарки',
    milestone: 'Месяц веду учёт без помощи',
    next_step: 'Скачать приложение для учёта или завести таблицу',
    duration_days: 60,
    emoji: '📊',
  },
  {
    id: 'tpl_1114_social_communication',
    age_bands: ['11-14'],
    sphere: 'social',
    title: 'Дружба и коммуникация',
    description: 'Учимся выстраивать отношения, разрешать конфликты, говорить «нет»',
    milestone: 'Прошёл сложную ситуацию самостоятельно',
    next_step: 'Раз в неделю обсуждать «что было трудного в общении»',
    duration_days: 90,
    emoji: '💬',
  },
  {
    id: 'tpl_1114_intellect_subject',
    age_bands: ['11-14'],
    sphere: 'intellect',
    title: 'Подтянуть один предмет в школе',
    description: 'Системная работа над слабым предметом — 3 раза в неделю',
    milestone: 'Оценка выросла на 1 балл',
    next_step: 'Выбрать предмет вместе и составить план занятий',
    duration_days: 90,
    emoji: '📐',
  },
  {
    id: 'tpl_1114_creativity_project',
    age_bands: ['11-14'],
    sphere: 'creativity',
    title: 'Свой первый проект',
    description: 'Любой завершённый проект: видео, рассказ, поделка, сайт',
    milestone: 'Проект готов и показан семье',
    next_step: 'Выбрать тему и определить срок',
    duration_days: 60,
    emoji: '🚀',
  },
  {
    id: 'tpl_1114_body_health',
    age_bands: ['11-14'],
    sphere: 'body',
    title: 'Режим сна и активности',
    description: 'Стабильный сон 8–9 часов, физическая активность ежедневно',
    milestone: 'Месяц без сбоев режима',
    next_step: 'Договориться о времени отбоя и подъёма',
    duration_days: 30,
    emoji: '😴',
  },
  {
    id: 'tpl_1114_emotions_selfcare',
    age_bands: ['11-14'],
    sphere: 'emotions',
    title: 'Способы справляться со стрессом',
    description: 'Знакомство с техниками: дыхание, физкультура, разговор, дневник',
    milestone: 'Освоил и применяет 2 техники',
    next_step: 'Вместе попробовать 3 техники и выбрать любимые',
    duration_days: 45,
    emoji: '🧘',
  },

  // ===== 15-17 лет =====
  {
    id: 'tpl_1517_intellect_career',
    age_bands: ['15-17'],
    sphere: 'intellect',
    title: 'Профориентация и выбор пути',
    description: 'Знакомство с профессиями, тесты на склонности, посещение вузов/колледжей',
    milestone: 'Сформирован шорт-лист из 3 направлений',
    next_step: 'Пройти тест на профориентацию',
    duration_days: 90,
    emoji: '🎓',
  },
  {
    id: 'tpl_1517_finance_earn',
    age_bands: ['15-17'],
    sphere: 'finance',
    title: 'Первые собственные деньги',
    description: 'Подработка, фриланс, помощь по дому за вознаграждение — освоить процесс',
    milestone: 'Заработал собственные деньги впервые',
    next_step: 'Обсудить варианты, что подходит по интересам',
    duration_days: 60,
    emoji: '💼',
  },
  {
    id: 'tpl_1517_life_household',
    age_bands: ['15-17'],
    sphere: 'life_skills',
    title: 'Базовые бытовые навыки',
    description: 'Готовка, стирка, уборка, оплата счетов — что нужно знать к самостоятельной жизни',
    milestone: 'Может полностью обеспечить себя в быту неделю',
    next_step: 'Сделать список навыков и проверить, что уже умеет',
    duration_days: 60,
    emoji: '🍳',
  },
  {
    id: 'tpl_1517_social_responsibility',
    age_bands: ['15-17'],
    sphere: 'social',
    title: 'Ответственность и обязательства',
    description: 'Учимся выполнять обещанное, помогать другим, быть надёжным',
    milestone: '3 месяца без срыва договорённостей',
    next_step: 'Обсудить и зафиксировать список договорённостей',
    duration_days: 90,
    emoji: '🤲',
  },
  {
    id: 'tpl_1517_creativity_portfolio',
    age_bands: ['15-17'],
    sphere: 'creativity',
    title: 'Собственное портфолио работ',
    description: 'Собрать 5–10 лучших работ по любимому направлению',
    milestone: 'Готовое портфолио в любом формате',
    next_step: 'Выбрать формат (сайт, папка, soundcloud) и собрать первые 3 работы',
    duration_days: 90,
    emoji: '🗂️',
  },
  {
    id: 'tpl_1517_body_lifestyle',
    age_bands: ['15-17'],
    sphere: 'body',
    title: 'Здоровый образ жизни',
    description: 'Питание, спорт, сон, отказ от вредных привычек — как осознанный выбор',
    milestone: '2 месяца устойчивого режима',
    next_step: 'Вместе составить план: что меняем и зачем',
    duration_days: 90,
    emoji: '🏃',
  },
  {
    id: 'tpl_1517_values_meaning',
    age_bands: ['15-17'],
    sphere: 'values',
    title: 'Свои ценности и смыслы',
    description: 'Размышления о том, что важно: семья, дружба, дело, общество',
    milestone: 'Сформулировал 3 главные ценности',
    next_step: 'Вместе выписать список и обсудить',
    duration_days: 30,
    emoji: '🌱',
  },
];

export function getTemplatesForAge(age: number | null | undefined): PlanTemplate[] {
  const band = ageToBand(age);
  if (!band) return PLAN_TEMPLATES;
  return PLAN_TEMPLATES.filter((t) => t.age_bands.includes(band));
}

export function getTemplatesByAgeAndSphere(
  age: number | null | undefined,
  sphere?: SphereKey,
): PlanTemplate[] {
  const byAge = getTemplatesForAge(age);
  if (!sphere) return byAge;
  return byAge.filter((t) => t.sphere === sphere);
}

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  '0-3': '0–3 года',
  '4-6': '4–6 лет',
  '7-10': '7–10 лет',
  '11-14': '11–14 лет',
  '15-17': '15–17 лет',
  '18+': '18+',
};
