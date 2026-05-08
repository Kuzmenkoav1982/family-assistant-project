export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export interface ConfidenceMeta {
  level: ConfidenceLevel;
  label: string;
  short: string;
  color: string;
  bg: string;
  dot: string;
}

export function getConfidenceMeta(conf: number): ConfidenceMeta {
  if (conf >= 70) {
    return {
      level: 'high',
      label: 'Высокая достоверность',
      short: 'Достоверно',
      color: 'text-green-700 dark:text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      dot: 'bg-green-500',
    };
  }
  if (conf >= 40) {
    return {
      level: 'medium',
      label: 'Средняя достоверность',
      short: 'Предварительно',
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      dot: 'bg-amber-500',
    };
  }
  if (conf > 0) {
    return {
      level: 'low',
      label: 'Мало данных',
      short: 'Мало данных',
      color: 'text-muted-foreground',
      bg: 'bg-muted/40 border-border',
      dot: 'bg-muted-foreground/50',
    };
  }
  return {
    level: 'none',
    label: 'Данных пока нет',
    short: 'Нет данных',
    color: 'text-muted-foreground',
    bg: 'bg-muted/40 border-border',
    dot: 'bg-muted-foreground/30',
  };
}

export function getNextStepText(
  action: string | null | undefined,
  score: number,
  conf: number,
): string {
  if (action && action.trim()) return action;
  if (conf < 40) return 'Добавьте данные, чтобы получить рекомендации';
  if (score >= 80) return 'Сфера развивается отлично — поддерживайте ритм';
  if (score >= 60) return 'Развивается стабильно — продолжайте текущие привычки';
  if (score >= 40) return 'Хорошая база — можно усилить регулярными активностями';
  return 'Стоит уделить больше внимания этой сфере';
}
