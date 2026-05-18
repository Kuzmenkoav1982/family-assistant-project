import type { PsychTest } from '../types';

export const PSYCH_TESTS: PsychTest[] = [
  {
    id: "family-climate",
    title: "Климат в семье",
    icon: "Thermometer",
    description: "Оцените эмоциональную атмосферу в вашей семье по 10 параметрам",
    questions: 10,
  },
  {
    id: "parenting-style",
    title: "Стиль воспитания",
    icon: "GraduationCap",
    description: "Определите ваш преобладающий стиль: авторитарный, либеральный или демократичный",
    questions: 15,
  },
  {
    id: "stress-level",
    title: "Уровень стресса",
    icon: "Activity",
    description: "Измерьте уровень родительского стресса и получите рекомендации",
    questions: 12,
  },
  {
    id: "communication",
    title: "Качество общения",
    icon: "MessageSquare",
    description: "Насколько эффективно вы общаетесь внутри семьи?",
    questions: 10,
  },
  {
    id: "attachment",
    title: "Тип привязанности",
    icon: "Link",
    description: "Определите тип привязанности между вами и ребёнком",
    questions: 20,
  },
  {
    id: "burnout",
    title: "Родительское выгорание",
    icon: "Flame",
    description: "Проверьте, нет ли у вас признаков эмоционального выгорания",
    questions: 14,
  },
  {
    id: "child-anxiety",
    title: "Тревожность ребёнка",
    icon: "AlertCircle",
    description: "Оцените уровень тревожности вашего ребёнка по шкале наблюдений",
    questions: 16,
  },
  {
    id: "conflict-style",
    title: "Стиль конфликтов",
    icon: "Swords",
    description: "Узнайте как вы и ваш партнёр решаете разногласия",
    questions: 12,
  },
];
