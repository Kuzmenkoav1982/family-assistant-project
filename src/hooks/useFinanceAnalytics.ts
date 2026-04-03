import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import type { AnalysisData } from '@/data/financeAnalyticsTypes';
import { API, getHeaders } from '@/data/financeAnalyticsTypes';

export default function useFinanceAnalytics() {
  useIsFamilyOwner();
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aiQ, setAiQ] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const aiRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}?section=financial_analysis`, { headers: getHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка загрузки');
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка');
      toast.error('Не удалось загрузить аналитику');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const askAI = useCallback(async (question: string) => {
    if (!question.trim()) return;
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action: 'ai_advice', question }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Ошибка');
      setAiResponse(json.advice || 'Нет ответа');
      setTimeout(() => aiRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Ошибка ИИ');
    } finally {
      setAiLoading(false);
    }
  }, []);

  return {
    data, loading, error, fetchData,
    aiQ, setAiQ, aiLoading, aiResponse, aiRef, askAI,
  };
}
