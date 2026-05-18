import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import type { FamilyMember } from '@/types/family.types';
import func2url from '../../../../backend/func2url.json';
import type { AIAnalysis } from './types';
import { getBd } from './types';
import { buildNumerologyData } from './numerologyData';

interface Args {
  m1: FamilyMember | undefined;
  m2: FamilyMember | undefined;
  onSuccess: () => void;
}

export function useRitualsAI({ m1, m2, onSuccess }: Args) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [situation, setSituation] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIAnalysis = useCallback(async () => {
    if (!m1 || !m2 || !situation.trim()) return;
    const apiUrl = (func2url as Record<string, string>)['conflict-ai'];
    if (!apiUrl) {
      toast({ title: 'Функция недоступна', description: 'Попробуйте позже', variant: 'destructive' });
      return;
    }

    setAiLoading(true);
    setAiAnalysis(null);

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const n1 = buildNumerologyData(m1);
    const n2 = buildNumerologyData(m2);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member1: { name: m1.name, birthDate: getBd(m1) },
          member2: { name: m2.name, birthDate: getBd(m2) },
          situation: situation.trim(),
          familyId: userData.family_id,
          userId: userData.id,
          numerologyData: { member1: n1, member2: n2 },
        }),
      });

      if (res.status === 402) {
        toast({ title: '💰 Недостаточно средств', description: 'Пополните кошелёк для использования ИИ-анализа' });
        setTimeout(() => navigate('/wallet'), 2000);
        return;
      }
      if (res.status === 403) {
        toast({ title: '🔐 Необходима регистрация', description: 'Войдите в аккаунт для использования ИИ' });
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
        onSuccess();
      } else if (data.error) {
        toast({ title: 'Ошибка', description: data.message || data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', description: 'Не удалось связаться с сервером', variant: 'destructive' });
    } finally {
      setAiLoading(false);
    }
  }, [m1, m2, situation, toast, navigate, onSuccess]);

  return { situation, setSituation, aiAnalysis, aiLoading, handleAIAnalysis };
}
