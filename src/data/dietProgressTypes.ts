export interface WeightEntry {
  weight_kg: number;
  wellbeing: string;
  measured_at: string;
}

export interface TodayMeal {
  id: number;
  day_number: number;
  meal_type: string;
  time: string;
  title: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  completed: boolean;
  image_url: string | null;
  recipe: string;
}

export interface DashboardStats {
  days_elapsed: number;
  days_remaining: number;
  completed_meals: number;
  total_meals: number;
  adherence_pct: number;
  weight_lost: number;
  start_weight: number | null;
  last_weight: number | null;
  days_since_log: number;
  streak: number;
  is_plateau: boolean;
}

export interface DashboardPlan {
  id: number;
  plan_type: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  target_weight_loss_kg: number | null;
  target_calories_daily: number;
  status: string;
  daily_water_ml: number | null;
  daily_steps: number | null;
  exercise_recommendation: string | null;
}

export interface DashboardData {
  has_plan: boolean;
  plan: DashboardPlan | null;
  weight_log: WeightEntry[];
  today_meals: TodayMeal[];
  stats: DashboardStats | null;
  tip: { type: string; title: string; text: string } | null;
}

export interface AnalysisData {
  has_analysis: boolean;
  recommendation: string;
  cal_adjustment: number;
  new_calories: number;
  current_calories: number;
  reason: string;
  advice: string;
  actual_loss_kg: number;
  expected_loss_kg: number;
  weekly_loss_kg: number;
  plan_id: number;
}

export interface NotifSetting {
  type: string;
  label: string;
  enabled: boolean;
  time_value: string | null;
  interval_minutes: number | null;
  channel: string;
  quiet_start: string;
  quiet_end: string;
}

export interface TodayActivityData {
  steps: number;
  exercise_type: string;
  exercise_duration_min: number;
  exercise_note: string;
  calories_burned: number;
}

export const API_URL = 'https://functions.poehali.dev/41c5c664-7ded-4c89-8820-7af2dac89d54';
export const SYNC_API = 'https://functions.poehali.dev/c94d9639-d8fc-4838-a865-1c01c18f3f25';

export const mealTypeLabels: Record<string, string> = {
  breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус',
};

export const mealTypeIcons: Record<string, string> = {
  breakfast: '\u{1F305}', lunch: '\u2600\uFE0F', dinner: '\u{1F319}', snack: '\u{1F34E}',
};

export const sosReasons = [
  { id: 'strong_hunger', label: 'Сильный голод', icon: '\u{1F354}' },
  { id: 'weakness', label: 'Упадок сил', icon: '\u{1F635}' },
  { id: 'psychological', label: 'Психологически тяжело', icon: '\u{1F614}' },
  { id: 'want_to_quit', label: 'Хочу бросить', icon: '\u{1F3F3}\uFE0F' },
];

export const exerciseTypes = [
  { id: 'walking', label: 'Ходьба', icon: '\u{1F6B6}' },
  { id: 'running', label: 'Бег', icon: '\u{1F3C3}' },
  { id: 'gym', label: 'Зал', icon: '\u{1F3CB}\uFE0F' },
  { id: 'cycling', label: 'Вело', icon: '\u{1F6B4}' },
  { id: 'swimming', label: 'Плавание', icon: '\u{1F3CA}' },
  { id: 'yoga', label: 'Йога', icon: '\u{1F9D8}' },
];
