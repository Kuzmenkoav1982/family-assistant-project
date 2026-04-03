import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { DashboardData, AnalysisData, NotifSetting, TodayActivityData } from '@/data/dietProgressTypes';
import { API_URL, SYNC_API } from '@/data/dietProgressTypes';

export default function useDietProgress() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  const [showWeightForm, setShowWeightForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [wellbeing, setWellbeing] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const [showSOS, setShowSOS] = useState(false);
  const [sosComment, setSosComment] = useState('');
  const [sosResponse, setSosResponse] = useState<string | null>(null);
  const [sendingSOS, setSendingSOS] = useState(false);

  const [motivation, setMotivation] = useState<string | null>(null);
  const [loadingMotivation, setLoadingMotivation] = useState(false);

  const [markingMeal, setMarkingMeal] = useState<number | null>(null);
  const [mealMenu, setMealMenu] = useState<number | null>(null);

  const [showFinalReport, setShowFinalReport] = useState(false);
  const [finalReport, setFinalReport] = useState<Record<string, unknown> | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [extending, setExtending] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const [showActivity, setShowActivity] = useState(false);
  const [actSteps, setActSteps] = useState('');
  const [actType, setActType] = useState('');
  const [actDuration, setActDuration] = useState('');
  const [actNote, setActNote] = useState('');
  const [savingActivity, setSavingActivity] = useState(false);
  const [todayActivity, setTodayActivity] = useState<TodayActivityData | null>(null);

  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotifSetting[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  const authToken = localStorage.getItem('authToken') || '';
  const headers = { 'Content-Type': 'application/json', 'X-Auth-Token': authToken };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=dashboard`, { headers: { 'X-Auth-Token': authToken } });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('[DietProgress] fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  useEffect(() => {
    if (data?.has_plan && !motivation && !loadingMotivation) {
      const lastMotivation = sessionStorage.getItem('diet_motivation_ts');
      const now = Date.now();
      if (!lastMotivation || now - parseInt(lastMotivation) > 3600000) {
        handleMotivation();
        sessionStorage.setItem('diet_motivation_ts', String(now));
      }
    }
  }, [data?.has_plan]);

  useEffect(() => {
    if (data?.has_plan) fetchTodayActivity();
  }, [data?.has_plan]);

  const handleLogWeight = async () => {
    if (!newWeight || !data?.plan) return;
    setSavingWeight(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'log_weight', plan_id: data.plan.id, weight_kg: parseFloat(newWeight), wellbeing }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Вес записан!' });
        setShowWeightForm(false); setNewWeight(''); setWellbeing('');
        fetchDashboard();
      }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setSavingWeight(false); }
  };

  const handleEatMeal = async (mealId: number) => {
    setMarkingMeal(mealId);
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'log_meal_bju', meal_id: mealId }),
      });
      const json = await res.json();
      if (json.success) toast({ title: 'Записано!', description: json.message });
      fetchDashboard();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setMarkingMeal(null); }
  };

  const handleUndoMeal = async (mealId: number) => {
    setMarkingMeal(mealId);
    try {
      await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'mark_meal', meal_id: mealId, completed: false }),
      });
      fetchDashboard();
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setMarkingMeal(null); }
  };

  const handleSaveRecipe = async (mealId: number) => {
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'save_recipe', meal_id: mealId }),
      });
      const json = await res.json();
      toast({ title: json.success ? 'Сохранено!' : 'Ошибка', description: json.message || json.error });
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    setMealMenu(null);
  };

  const handleAddToShopping = async (mealIds: number[]) => {
    try {
      const res = await fetch(SYNC_API, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'add_to_shopping', meal_ids: mealIds }),
      });
      const json = await res.json();
      toast({ title: json.success ? 'Добавлено!' : 'Ошибка', description: json.message || json.error });
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    setMealMenu(null);
  };

  const handleSOS = async (reason: string) => {
    if (!data?.plan) return;
    setSendingSOS(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'sos', plan_id: data.plan.id, reason, comment: sosComment }),
      });
      const json = await res.json();
      setSosResponse(json.message);
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setSendingSOS(false); }
  };

  const handleMotivation = async () => {
    setLoadingMotivation(true);
    try {
      const hour = new Date().getHours();
      const time = hour < 14 ? 'morning' : 'evening';
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'motivation', plan_id: data?.plan?.id, time }),
      });
      const json = await res.json();
      setMotivation(json.message);
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setLoadingMotivation(false); }
  };

  const handleAnalyze = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'analyze_progress', plan_id: data?.plan?.id }),
      });
      const json = await res.json();
      setAnalysis(json);
    } catch { toast({ title: 'Ошибка анализа', variant: 'destructive' }); }
    finally { setLoadingAnalysis(false); }
  };

  const handleAdjust = async () => {
    if (!analysis) return;
    setAdjusting(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'adjust_plan', plan_id: analysis.plan_id, new_calories: analysis.new_calories }),
      });
      const json = await res.json();
      if (json.success) { toast({ title: 'План скорректирован!' }); setAnalysis(null); fetchDashboard(); }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setAdjusting(false); }
  };

  const fetchTodayActivity = async () => {
    try {
      const res = await fetch(`${API_URL}?action=today_activity`, { headers: { 'X-Auth-Token': authToken } });
      const json = await res.json();
      if (json.activity) {
        setTodayActivity(json.activity);
        setActSteps(String(json.activity.steps || ''));
        setActType(json.activity.exercise_type || '');
        setActDuration(String(json.activity.exercise_duration_min || ''));
        setActNote(json.activity.exercise_note || '');
      }
    } catch { /* skip */ }
  };

  const handleSaveActivity = async () => {
    setSavingActivity(true);
    try {
      const estimatedCalories = Math.round((parseInt(actSteps) || 0) * 0.04 + (parseInt(actDuration) || 0) * 7);
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({
          action: 'log_activity', plan_id: data?.plan?.id,
          steps: parseInt(actSteps) || 0, exercise_type: actType,
          exercise_duration_min: parseInt(actDuration) || 0,
          exercise_note: actNote, calories_burned: estimatedCalories,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast({ title: 'Активность записана!' });
        setTodayActivity({
          steps: parseInt(actSteps) || 0, exercise_type: actType,
          exercise_duration_min: parseInt(actDuration) || 0,
          exercise_note: actNote, calories_burned: estimatedCalories,
        });
        setShowActivity(false);
      }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setSavingActivity(false); }
  };

  const handleFinalReport = async () => {
    setLoadingReport(true); setShowFinalReport(true);
    try {
      const res = await fetch(`${API_URL}?action=final_report&plan_id=${data?.plan?.id}`, { headers: { 'X-Auth-Token': authToken } });
      const json = await res.json();
      if (json.report) setFinalReport(json.report);
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setLoadingReport(false); }
  };

  const handleFinishPlan = async () => {
    setFinishing(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'finish_plan', plan_id: data?.plan?.id }),
      });
      const json = await res.json();
      if (json.success) { toast({ title: 'План завершён!' }); fetchDashboard(); setShowFinalReport(false); }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setFinishing(false); }
  };

  const handleExtendPlan = async (days: number) => {
    setExtending(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'extend_plan', plan_id: data?.plan?.id, extra_days: days }),
      });
      const json = await res.json();
      if (json.success) { toast({ title: json.message }); fetchDashboard(); setShowFinalReport(false); }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setExtending(false); }
  };

  const fetchNotifSettings = async () => {
    setLoadingNotif(true);
    try {
      const res = await fetch(`${API_URL}?action=notification_settings`, { headers: { 'X-Auth-Token': authToken } });
      const json = await res.json();
      if (json.settings) setNotifSettings(json.settings);
    } catch { /* skip */ }
    finally { setLoadingNotif(false); }
  };

  const saveNotifSettings = async () => {
    setSavingNotif(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers,
        body: JSON.stringify({ action: 'save_notification_settings', settings: notifSettings }),
      });
      const json = await res.json();
      if (json.success) { toast({ title: 'Настройки сохранены' }); setShowNotifSettings(false); }
    } catch { toast({ title: 'Ошибка', variant: 'destructive' }); }
    finally { setSavingNotif(false); }
  };

  const toggleNotif = (type: string) => {
    setNotifSettings(prev => prev.map(s => s.type === type ? { ...s, enabled: !s.enabled } : s));
  };

  const updateNotifTime = (type: string, time: string) => {
    setNotifSettings(prev => prev.map(s => s.type === type ? { ...s, time_value: time } : s));
  };

  const plan = data?.plan;
  const stats = data?.stats;
  const today_meals = data?.today_meals || [];
  const weightLog = data?.weight_log || [];
  const targetWeight = plan && stats?.start_weight && plan.target_weight_loss_kg
    ? stats.start_weight - plan.target_weight_loss_kg : null;

  const weightChartData = weightLog.slice(-10).map(w => ({
    weight: w.weight_kg,
    date: new Date(w.measured_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
  }));

  const allWeights = weightChartData.map(d => d.weight);
  if (targetWeight) allWeights.push(targetWeight);
  const minW = allWeights.length > 0 ? Math.min(...allWeights) - 1 : 60;
  const maxW = allWeights.length > 0 ? Math.max(...allWeights) + 1 : 100;
  const range = maxW - minW || 1;

  return {
    loading, data, plan, stats, today_meals, targetWeight,
    weightChartData, minW, maxW, range,
    showWeightForm, setShowWeightForm, newWeight, setNewWeight,
    wellbeing, setWellbeing, savingWeight, handleLogWeight,
    showSOS, setShowSOS, sosComment, setSosComment,
    sosResponse, setSosResponse, sendingSOS, handleSOS,
    motivation, loadingMotivation, handleMotivation,
    markingMeal, mealMenu, setMealMenu,
    handleEatMeal, handleUndoMeal, handleSaveRecipe, handleAddToShopping,
    showFinalReport, setShowFinalReport, finalReport, loadingReport,
    extending, finishing, handleFinalReport, handleFinishPlan, handleExtendPlan,
    showActivity, setShowActivity,
    actSteps, setActSteps, actType, setActType,
    actDuration, setActDuration, actNote, setActNote,
    savingActivity, todayActivity, handleSaveActivity,
    analysis, setAnalysis, loadingAnalysis, adjusting,
    handleAnalyze, handleAdjust,
    showNotifSettings, setShowNotifSettings,
    notifSettings, setNotifSettings, loadingNotif, savingNotif,
    fetchNotifSettings, saveNotifSettings, toggleNotif, updateNotifTime,
  };
}
