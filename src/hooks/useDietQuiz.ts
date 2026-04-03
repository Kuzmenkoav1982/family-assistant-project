import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizData, GeneratedPlan, MedTableHint } from '@/data/dietQuizData';
import { initialData, steps, diseaseMedTables, DIET_PLAN_API_URL, MEAL_API, DIET_PROGRESS_API, WALLET_API, AI_DIET_COST } from '@/data/dietQuizData';

export default function useDietQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<QuizData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedPlanId, setSavedPlanId] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  const progress = ((currentStep + 1) / steps.length) * 100;

  const detectedTables = (() => {
    const tables = new Map<string, MedTableHint>();
    for (const disease of data.chronic_diseases) {
      const hint = diseaseMedTables[disease];
      if (hint && !tables.has(hint.table)) {
        tables.set(hint.table, hint);
      }
    }
    return Array.from(tables.values());
  })();

  useEffect(() => {
    if (currentStep === 4) {
      const authToken = localStorage.getItem('authToken') || '';
      fetch(`${WALLET_API}?action=balance`, { headers: { 'X-Auth-Token': authToken } })
        .then(r => r.json())
        .then(j => setWalletBalance(j.balance ?? null))
        .catch(() => {});
    }
  }, [currentStep]);

  const update = (field: keyof QuizData, value: string | boolean | string[]) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof QuizData, item: string) => {
    const arr = data[field] as string[];
    const updated = arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
    update(field, updated);
  };

  const canNext = () => {
    switch (currentStep) {
      case 0: return data.height_cm && data.current_weight_kg && data.age && data.gender;
      case 1: return true;
      case 2: return data.activity_level;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const pollOperation = async (operationId: string) => {
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, 5000));
      try {
        const res = await fetch(DIET_PLAN_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check', operationId }),
        });
        const d = await res.json();
        if (d.status === 'processing') continue;
        if (d.status === 'done') {
          if (d.plan?.days) {
            setGeneratedPlan(d.plan);
            if (d.diet_plan_id) setSavedPlanId(d.diet_plan_id);
          } else if (d.rawText) {
            setRawText(d.rawText);
          } else {
            setError('ИИ не смог сгенерировать план. Попробуйте ещё раз.');
          }
          return;
        }
        if (d.status === 'error') {
          setError(d.error || 'Ошибка генерации');
          return;
        }
      } catch {
        setError('Ошибка соединения при проверке статуса.');
        return;
      }
    }
    setError('Генерация заняла слишком много времени. Попробуйте ещё раз.');
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    setError(null);
    setRawText(null);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const res = await fetch(DIET_PLAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': authToken },
        body: JSON.stringify({ action: 'generate_plan', ...data }),
      });
      const json = await res.json();
      if (json.error) {
        setError(json.error);
      } else if (json.operationId) {
        await pollOperation(json.operationId);
      } else if (json.plan?.days) {
        setGeneratedPlan(json.plan);
        if (json.diet_plan_id) setSavedPlanId(json.diet_plan_id);
      } else {
        setError('Не удалось запустить генерацию. Попробуйте ещё раз.');
      }
    } catch (e) {
      setError('Ошибка связи с сервером. Проверьте интернет и попробуйте снова.');
    }
    setIsGenerating(false);
  };

  const handleSaveToMenu = async (replaceExisting: boolean) => {
    if (!generatedPlan) return;
    setIsSaving(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const headers = { 'Content-Type': 'application/json', 'X-Auth-Token': authToken };
      const res = await fetch(MEAL_API, {
        method: 'POST', headers,
        body: JSON.stringify({
          action: 'import_ai_plan',
          plan: generatedPlan,
          replace_existing: replaceExisting,
        }),
      });
      const json = await res.json();
      if (json.success) {
        if (savedPlanId) {
          await fetch(DIET_PROGRESS_API, {
            method: 'POST', headers,
            body: JSON.stringify({
              action: 'activate_plan',
              plan_id: savedPlanId,
              duration_days: parseInt(data.duration_days),
              target_calories_daily: generatedPlan.daily_calories,
              target_weight_loss_kg: data.target_weight_kg
                ? parseFloat(data.current_weight_kg) - parseFloat(data.target_weight_kg)
                : null,
            }),
          });
        }
        setSaved(true);
      } else {
        alert(json.error || 'Ошибка сохранения');
      }
    } catch {
      alert('Ошибка сохранения');
    }
    setIsSaving(false);
  };

  return {
    navigate,
    currentStep, setCurrentStep,
    data, update, toggleArrayItem,
    isGenerating, generatedPlan, setGeneratedPlan,
    rawText, setRawText,
    error, setError,
    selectedDay, setSelectedDay,
    isSaving, saved, setSaved, savedPlanId,
    walletBalance,
    progress, detectedTables, canNext,
    handleSubmit, handleSaveToMenu,
  };
}