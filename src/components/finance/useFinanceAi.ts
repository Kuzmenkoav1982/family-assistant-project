import { useState } from 'react';
import { toast } from 'sonner';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Auth-Token': localStorage.getItem('authToken') || '',
  };
}

export function useFinanceAi() {
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askAI = async (question?: string) => {
    setAiLoading(true);
    setAiAdvice('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action: 'ai_advice', question: question || aiQuestion || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvice(data.advice || 'Нет рекомендаций');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Ошибка ИИ');
      }
    } catch {
      toast.error('Ошибка соединения');
    }
    setAiLoading(false);
  };

  return { aiQuestion, setAiQuestion, aiAdvice, aiLoading, askAI };
}
