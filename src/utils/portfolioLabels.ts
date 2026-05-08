export const SOURCE_TYPE_LABELS: Record<string, string> = {
  parent_input: 'Оценка родителя',
  child_skills: 'Навыки ребёнка',
  children_activities: 'Кружки и активности',
  children_vaccinations: 'Прививки',
  children_doctor_visits: 'Визиты к врачу',
  children_mood_entries: 'Дневник настроения',
  child_development_assessments: 'Оценка развития',
  family_traditions: 'Семейные традиции',
  family_rituals: 'Семейные ритуалы',
  tasks_v2: 'Задачи и обязанности',
  vital_records: 'Показатели здоровья',
  achievements: 'Достижения',
  reading: 'Чтение',
  calendar_event: 'Событие календаря',
  habit_tracker: 'Трекер привычек',
};

export const METRIC_KEY_LABELS: Record<string, string> = {
  cognitive_skills: 'Познавательные навыки',
  family_rituals: 'Семейные ритуалы',
  self_care_skills: 'Самообслуживание',
  vaccinations: 'Прививки',
  creative_activities: 'Творческие занятия',
  creative_skills: 'Творческие навыки',
  creative_achievements: 'Творческие достижения',
  development_assessment: 'Оценка развития',
  height_weight: 'Рост и вес',
  household_tasks: 'Домашние обязанности',
  social_skills: 'Навыки общения',
  curiosity_activities: 'Любознательность',
  doctor_visits: 'Визиты к врачу',
  emotion_recognition: 'Распознавание эмоций',
  group_activities: 'Групповые занятия',
  money_concepts: 'Понятия о деньгах',
  mood_diary: 'Дневник настроения',
  physical_activity: 'Физическая активность',
  values_concepts: 'Ценности и понятия',
  parent_observation: 'Наблюдения родителя',
  parent_creativity_score: 'Оценка творчества (родитель)',
  parent_emotion_score: 'Эмоциональная устойчивость (родитель)',
  parent_finance_score: 'Финансовая грамотность (родитель)',
  parent_health_score: 'Здоровье (родитель)',
  parent_life_skills_score: 'Жизненные навыки (родитель)',
  parent_social_score: 'Общение (родитель)',
  parent_values_score: 'Ценности (родитель)',
  reading_progress: 'Прогресс чтения',
  homework_completion: 'Домашние задания',
  sleep_hours: 'Часы сна',
  exercise_minutes: 'Физические упражнения',
  allowance_earned: 'Карманные деньги',
  purchase_count: 'Покупки',
  count: 'Количество',
  score: 'Оценка',
};

export const METRIC_UNIT_LABELS: Record<string, string> = {
  count: 'событий',
  score: '/ 100',
  completed: 'выполнено',
  measured: 'замеров',
  '%': '%',
};

function humanize(key: string): string {
  if (!key) return '';
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getSourceTypeLabel(key: string | null | undefined): string {
  if (!key) return 'Источник';
  return SOURCE_TYPE_LABELS[key] || humanize(key);
}

export function getMetricKeyLabel(key: string | null | undefined): string {
  if (!key) return '';
  return METRIC_KEY_LABELS[key] || humanize(key);
}

export function formatMetricValue(
  value: number | null | undefined,
  unit: string | null | undefined,
): string {
  if (value === null || value === undefined) return '';
  if (unit === 'score') return `${value} / 100`;
  if (unit === 'count') return `${value} событий`;
  if (unit === 'completed') return `${value} выполнено`;
  if (unit === 'measured') return `${value} замеров`;
  if (unit === '%') return `${value}%`;
  if (unit) return `${value} ${getMetricUnitLabel(unit)}`;
  return String(value);
}

export function getMetricUnitLabel(unit: string | null | undefined): string {
  if (!unit) return '';
  return METRIC_UNIT_LABELS[unit] || unit;
}
