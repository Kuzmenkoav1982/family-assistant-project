export const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

export interface Course {
  id: string;
  title: string;
  description: string;
  age_group: string;
  difficulty: string;
  icon: string;
  color: string;
  lessons_count: number;
  tests_count: number;
}

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  sort_order: number;
  duration: number;
  content?: string;
  course_id?: string;
}

export interface Test {
  id: string;
  title: string;
  description: string;
  pass_threshold: number;
  time_limit: number;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correct: string | number;
  explanation: string;
  points: number;
}

export interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

export interface TestResult {
  test_id: string;
  score: number;
  max_score: number;
  passed: boolean;
}

export interface TestResultSummary {
  score: number;
  max_score: number;
  passed: boolean;
  percentage: number;
}

export function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

export const AGE_LABELS: Record<string, string> = {
  child_6_10: '6–10 лет',
  child_11_14: '11–14 лет',
  teen_15_17: '15–17 лет',
  adult: 'Взрослые',
};

export const DIFF_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Начальный', color: 'bg-green-100 text-green-700' },
  intermediate: { label: 'Средний', color: 'bg-amber-100 text-amber-700' },
  advanced: { label: 'Продвинутый', color: 'bg-red-100 text-red-700' },
};
