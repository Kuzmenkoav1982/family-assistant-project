// === Canonical Goal triada v1 ===
// Длинная цель — одна сущность, дом которой Мастерская жизни.
// Имеет три проекции: Портфолио (зеркало) / Мастерская (компас) / Планирование (двигатель).
export type FrameworkType = 'generic' | 'smart' | 'okr' | 'wheel';
export type GoalScope = 'personal' | 'family';
export type GoalHorizon = 'quarter' | 'season' | 'year' | 'long';
export type GoalCreatedFrom = 'workshop' | 'portfolio' | 'development' | 'external';

export interface LifeGoal {
  id: string;
  familyId?: string;
  ownerId?: string | null;
  title: string;
  description?: string | null;
  sphere: string;
  /** legacy строковое поле (smart/okr/wheel/ikigai/covey) — оставляем для обратной совместимости. */
  framework?: string | null;
  deadline?: string | null;
  status: 'active' | 'done' | 'paused' | 'archived';
  progress: number;
  steps: { text: string; done?: boolean }[];
  aiInsights?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;

  // === Canonical поля триады ===
  /** Канонический тип методики. Источник истины — он, а не legacy `framework`. */
  frameworkType: FrameworkType;
  /** Структурное состояние методики (грани SMART, конфиг OKR, замеры Колеса). */
  frameworkState: Record<string, unknown>;
  /** personal — личная цель (ownerId), family — семейная. */
  scope: GoalScope;
  horizon?: GoalHorizon | null;
  season?: string | null;
  whyText?: string | null;
  linkedSphereIds: string[];
  createdFrom?: GoalCreatedFrom | null;
  sourceContext?: Record<string, unknown> | null;
  /** Кэш вычисляемого прогресса исполнения. Источник истины — milestones/KR/tasks. */
  executionProgress?: number | null;
  outcomeSignal?: Record<string, unknown> | null;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  weight: number;
  status: 'pending' | 'in_progress' | 'done' | 'skipped';
  order: number;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalKeyResult {
  id: string;
  goalId: string;
  title: string;
  metricType: 'number' | 'percent' | 'currency' | 'boolean';
  unit?: string | null;
  startValue: number;
  currentValue: number;
  targetValue: number;
  dueDate?: string | null;
  weight: number;
  status: 'active' | 'done' | 'paused';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalCheckin {
  id: string;
  goalId: string;
  authorId?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  summary?: string | null;
  blockers?: string | null;
  nextStep?: string | null;
  /** 0..10 — самооценка прогресса за период. */
  selfAssessment?: number | null;
  data?: Record<string, unknown> | null;
  createdAt?: string;
}

export interface GoalActionLink {
  id: string;
  goalId: string;
  entityType: 'task' | 'habit' | 'ritual' | 'event';
  entityId: string;
  milestoneId?: string | null;
  keyResultId?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt?: string;
  // Origin-extras: возвращаются при поиске по entityId (Этап 3.2.1).
  // Если goal/milestone/KR удалены — соответствующее поле null,
  // UI должен корректно обработать «битые» ссылки.
  goalTitle?: string | null;
  goalStatus?: string | null;
  goalFrameworkType?: string | null;
  milestoneTitle?: string | null;
  keyResultTitle?: string | null;
}

export interface BalanceSnapshot {
  id: string;
  scores: Record<string, number>;
  notes?: string | null;
  createdAt?: string;
}

export type LifeEventCategory =
  | 'birth'
  | 'wedding'
  | 'education'
  | 'career'
  | 'achievement'
  | 'travel'
  | 'family'
  | 'health'
  | 'other';

export type LifeEventImportance = 'low' | 'medium' | 'high' | 'critical';

export interface LifeEvent {
  id: string;
  familyId?: string;
  createdBy?: string | null;
  date: string;
  title: string;
  description?: string | null;
  category: LifeEventCategory;
  importance: LifeEventImportance;
  participants: string[];
  photos?: string[];
  isFuture?: boolean;
  mood?: string | null;
  quote?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LifeSeason {
  id: string;
  title: string;
  subtitle: string;
  ageFrom: number;
  ageTo: number;
  gradient: string;
  accent: string;
  icon: string;
}

export const LIFE_SEASONS: LifeSeason[] = [
  {
    id: 'childhood',
    title: 'Детство',
    subtitle: 'Первые открытия и игры',
    ageFrom: 0,
    ageTo: 12,
    gradient: 'from-pink-400 via-rose-400 to-orange-400',
    accent: 'text-pink-600',
    icon: 'Baby',
  },
  {
    id: 'youth',
    title: 'Юность',
    subtitle: 'Поиск себя и мечты',
    ageFrom: 13,
    ageTo: 18,
    gradient: 'from-orange-400 via-amber-400 to-yellow-400',
    accent: 'text-orange-600',
    icon: 'Sparkles',
  },
  {
    id: 'becoming',
    title: 'Становление',
    subtitle: 'Учёба, первые победы',
    ageFrom: 19,
    ageTo: 25,
    gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    accent: 'text-emerald-600',
    icon: 'GraduationCap',
  },
  {
    id: 'maturity',
    title: 'Зрелость',
    subtitle: 'Семья, карьера, корни',
    ageFrom: 26,
    ageTo: 40,
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    accent: 'text-blue-600',
    icon: 'Home',
  },
  {
    id: 'flourishing',
    title: 'Расцвет',
    subtitle: 'Опыт, признание, мудрость',
    ageFrom: 41,
    ageTo: 60,
    gradient: 'from-indigo-500 via-purple-500 to-fuchsia-500',
    accent: 'text-purple-600',
    icon: 'Crown',
  },
  {
    id: 'wisdom',
    title: 'Мудрость',
    subtitle: 'Наследие и покой',
    ageFrom: 61,
    ageTo: 120,
    gradient: 'from-purple-500 via-violet-500 to-slate-500',
    accent: 'text-violet-700',
    icon: 'Gem',
  },
];

export const CATEGORY_CONFIG: Record<LifeEventCategory, { label: string; icon: string; color: string; ring: string }> = {
  birth:       { label: 'Рождение',     icon: 'Baby',          color: 'bg-pink-500',    ring: 'ring-pink-300' },
  wedding:     { label: 'Свадьба',      icon: 'Heart',         color: 'bg-rose-500',    ring: 'ring-rose-300' },
  education:   { label: 'Образование',  icon: 'GraduationCap', color: 'bg-blue-500',    ring: 'ring-blue-300' },
  career:      { label: 'Карьера',      icon: 'Briefcase',     color: 'bg-purple-500',  ring: 'ring-purple-300' },
  achievement: { label: 'Достижение',   icon: 'Trophy',        color: 'bg-amber-500',   ring: 'ring-amber-300' },
  travel:      { label: 'Путешествие',  icon: 'Plane',         color: 'bg-cyan-500',    ring: 'ring-cyan-300' },
  family:      { label: 'Семейное',     icon: 'Users',         color: 'bg-emerald-500', ring: 'ring-emerald-300' },
  health:      { label: 'Здоровье',     icon: 'HeartPulse',    color: 'bg-orange-500',  ring: 'ring-orange-300' },
  other:       { label: 'Другое',       icon: 'Star',          color: 'bg-slate-500',   ring: 'ring-slate-300' },
};

export const IMPORTANCE_CONFIG: Record<LifeEventImportance, { label: string; dot: string; size: string }> = {
  low:      { label: 'Обычное',      dot: 'bg-slate-400',   size: 'w-3 h-3' },
  medium:   { label: 'Важное',       dot: 'bg-blue-500',    size: 'w-4 h-4' },
  high:     { label: 'Очень важное', dot: 'bg-orange-500',  size: 'w-5 h-5' },
  critical: { label: 'Ключевое',     dot: 'bg-rose-500',    size: 'w-6 h-6' },
};