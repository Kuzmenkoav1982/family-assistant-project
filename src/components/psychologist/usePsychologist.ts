import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';
import { loadFromStorage, saveToStorage } from './utils';
import { SYSTEM_PROMPT, QUICK_TOPICS } from './data/prompts';
import type { ConsultationRecord, ExerciseRecord, RelaxationRecord } from './types';

export function usePsychologist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const responseRef = useRef<HTMLDivElement>(null);

  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [consultationHistory, setConsultationHistory] = useState<ConsultationRecord[]>(() =>
    loadFromStorage<ConsultationRecord[]>('psychologist_history', [])
  );

  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [exercisesCompleted, setExercisesCompleted] = useState<ExerciseRecord[]>(() =>
    loadFromStorage<ExerciseRecord[]>('psychologist_exercises', [])
  );
  const [relaxationSessions, setRelaxationSessions] = useState<RelaxationRecord[]>(() =>
    loadFromStorage<RelaxationRecord[]>('psychologist_relaxation', [])
  );

  useEffect(() => {
    if (!activeTimer) return;
    if (timerSeconds <= 0) {
      setActiveTimer(null);
      toast({
        title: 'Практика завершена!',
        description: 'Отличная работа! Вы завершили сеанс релаксации.',
      });
      const record: RelaxationRecord = {
        techniqueId: activeTimer,
        completedDate: new Date().toISOString(),
      };
      const updated = [...relaxationSessions, record];
      setRelaxationSessions(updated);
      saveToStorage('psychologist_relaxation', updated);
      return;
    }
    const interval = setInterval(() => {
      setTimerSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer, timerSeconds]);

  const getUserData = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('userData') || '{}');
    } catch {
      return {};
    }
  }, []);

  const handleSendConsultation = async () => {
    if (question.trim().length < 20) {
      toast({
        title: 'Слишком коротко',
        description: 'Опишите ситуацию подробнее (минимум 20 символов)',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setCurrentResponse('');

    const userData = getUserData();

    try {
      const res = await fetch(
        (func2url as Record<string, string>)['ai-assistant'],
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: question }],
            systemPrompt: SYSTEM_PROMPT,
            familyId: userData.family_id || '',
            userId: userData.id || '',
          }),
        }
      );

      if (res.status === 402) {
        toast({
          title: 'Недостаточно средств',
          description: 'Пополните баланс для использования ИИ-консультаций',
          variant: 'destructive',
        });
        navigate('/wallet');
        return;
      }

      if (res.status === 403) {
        toast({
          title: 'Требуется авторизация',
          description: 'Войдите в аккаунт для использования консультаций',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const answer = data.response || 'Не удалось получить ответ. Попробуйте ещё раз.';

      setCurrentResponse(answer);

      const topicLabel = QUICK_TOPICS.find((t) => t.template === question)?.label || 'Консультация';

      const record: ConsultationRecord = {
        id: Date.now().toString(),
        topic: topicLabel,
        question,
        answer,
        date: new Date().toISOString(),
      };

      const updated = [record, ...consultationHistory].slice(0, 50);
      setConsultationHistory(updated);
      saveToStorage('psychologist_history', updated);

      setTimeout(() => {
        responseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить консультацию. Проверьте подключение к интернету.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (techniqueId: string, minutes: number) => {
    setActiveTimer(techniqueId);
    setTimerSeconds(minutes * 60);
  };

  const stopTimer = () => {
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  const markExerciseComplete = (exerciseId: string) => {
    const record: ExerciseRecord = {
      exerciseId,
      completedDate: new Date().toISOString(),
    };
    const updated = [...exercisesCompleted, record];
    setExercisesCompleted(updated);
    saveToStorage('psychologist_exercises', updated);
    toast({
      title: 'Упражнение выполнено!',
      description: 'Результат сохранён в вашем прогрессе.',
    });
  };

  const getExerciseCompletionCount = (exerciseId: string): number => {
    return exercisesCompleted.filter((e) => e.exerciseId === exerciseId).length;
  };

  const getTechniqueCompletionCount = (techniqueId: string): number => {
    return relaxationSessions.filter((r) => r.techniqueId === techniqueId).length;
  };

  const getWeeklyActivity = (): boolean[] => {
    const now = new Date();
    const days: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().slice(0, 10);
      const hasConsultation = consultationHistory.some((c) => c.date.slice(0, 10) === dayStr);
      const hasExercise = exercisesCompleted.some((e) => e.completedDate.slice(0, 10) === dayStr);
      const hasRelaxation = relaxationSessions.some((r) => r.completedDate.slice(0, 10) === dayStr);
      days.push(hasConsultation || hasExercise || hasRelaxation);
    }
    return days;
  };

  const getStreak = (): number => {
    const activity = getWeeklyActivity();
    let streak = 0;
    for (let i = activity.length - 1; i >= 0; i--) {
      if (activity[i]) streak++;
      else break;
    }
    return streak;
  };

  const getDayLabel = (daysAgo: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('ru-RU', { weekday: 'short' }).slice(0, 2);
  };

  return {
    responseRef,
    question, setQuestion,
    loading, currentResponse, setCurrentResponse,
    consultationHistory,
    activeTimer, timerSeconds,
    exercisesCompleted, relaxationSessions,
    handleSendConsultation,
    startTimer, stopTimer,
    markExerciseComplete,
    getExerciseCompletionCount, getTechniqueCompletionCount,
    getWeeklyActivity, getStreak, getDayLabel,
    toast,
  };
}