import { useEffect } from 'react';
import { useNotifications } from './useNotifications';

const DIET_API = 'https://functions.poehali.dev/41c5c664-7ded-4c89-8820-7af2dac89d54';

interface NotifSetting {
  type: string;
  enabled: boolean;
  time_value: string | null;
  interval_minutes: number | null;
  quiet_start: string;
  quiet_end: string;
}

function isInQuietHours(qs: string, qe: string): boolean {
  const now = new Date();
  const nowStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  if (qs <= qe) return nowStr >= qs && nowStr <= qe;
  return nowStr >= qs || nowStr <= qe;
}

function isTimeMatch(targetTime: string | null, windowMin = 5): boolean {
  if (!targetTime) return false;
  const now = new Date();
  const [h, m] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  const diff = Math.abs(now.getTime() - target.getTime()) / 60000;
  return diff <= windowMin;
}

export function useDietReminders() {
  const { sendNotification } = useNotifications();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return;

    const checkDietReminders = async () => {
      try {
        const settingsRes = await fetch(`${DIET_API}?action=notification_settings`, {
          headers: { 'X-Auth-Token': authToken },
        });
        if (!settingsRes.ok) return;
        const settingsData = await settingsRes.json();
        const settings: NotifSetting[] = settingsData.settings || [];

        const enabledSettings = settings.filter(s => s.enabled);
        if (enabledSettings.length === 0) return;

        const qs = enabledSettings[0]?.quiet_start || '22:00';
        const qe = enabledSettings[0]?.quiet_end || '07:00';
        if (isInQuietHours(qs, qe)) return;

        const dashRes = await fetch(`${DIET_API}?action=dashboard`, {
          headers: { 'X-Auth-Token': authToken },
        });
        if (!dashRes.ok) return;
        const dash = await dashRes.json();
        if (!dash.has_plan || !dash.plan) return;

        const today = new Date().toISOString().slice(0, 10);
        const todayMeals = dash.today_meals || [];
        const stats = dash.stats;

        for (const s of enabledSettings) {
          const notifKey = `diet_notif_${s.type}_${today}`;

          if (s.type === 'weight_reminder' && isTimeMatch(s.time_value || '09:00')) {
            if (localStorage.getItem(notifKey)) continue;
            const daysElapsed = stats?.days_elapsed || 1;
            if (stats?.days_since_log > 0) {
              sendNotification({
                title: '⚖️ Время взвеситься',
                message: `День ${daysElapsed} — запишите вес для отслеживания прогресса!`,
                url: '/nutrition/progress',
              });
              localStorage.setItem(notifKey, 'true');
            }
          }

          if (s.type === 'meal_reminder') {
            const mealNotifKey = `${notifKey}_${new Date().getHours()}`;
            if (localStorage.getItem(mealNotifKey)) continue;
            const pendingMeals = todayMeals.filter((m: { completed: boolean }) => !m.completed);
            if (pendingMeals.length > 0) {
              const now = new Date();
              const currentHour = now.getHours();
              const nextMeal = pendingMeals.find((m: { time: string }) => {
                const [mh] = m.time.split(':').map(Number);
                return Math.abs(mh - currentHour) <= 1;
              });
              if (nextMeal) {
                sendNotification({
                  title: '🍽️ Время приёма пищи',
                  message: `${nextMeal.title} — следуйте плану питания!`,
                  url: '/nutrition/progress',
                });
                localStorage.setItem(mealNotifKey, 'true');
              }
            }
          }

          if (s.type === 'water_reminder') {
            const intervalMin = s.interval_minutes || 120;
            const waterKey = `diet_water_last_notif`;
            const lastNotif = localStorage.getItem(waterKey);
            const now = Date.now();
            if (lastNotif && now - parseInt(lastNotif) < intervalMin * 60000) continue;

            sendNotification({
              title: '💧 Пора попить воды',
              message: 'Не забывайте пить воду — это важно для здоровья!',
              url: '/nutrition/progress',
            });
            localStorage.setItem(waterKey, String(now));
          }

          if (s.type === 'motivation' && isTimeMatch(s.time_value || '09:00')) {
            if (localStorage.getItem(notifKey)) continue;
            const lost = stats?.weight_lost || 0;
            const streak = stats?.streak || 0;
            let msg = 'Новый день — новые возможности! Следуйте плану питания.';
            if (lost > 0) msg = `Уже ${lost} кг позади! Продолжайте в том же духе!`;
            if (streak >= 3) msg = `${streak} дней подряд на диете — отличный результат!`;

            sendNotification({
              title: '✨ Мотивация от Наша Семья',
              message: msg,
              url: '/nutrition/progress',
            });
            localStorage.setItem(notifKey, 'true');
          }

          if (s.type === 'weekly_report' && isTimeMatch(s.time_value || '20:00')) {
            const dayOfWeek = new Date().getDay();
            if (dayOfWeek !== 0) continue;
            if (localStorage.getItem(notifKey)) continue;

            const lost = stats?.weight_lost || 0;
            const adherence = stats?.adherence_pct || 0;
            sendNotification({
              title: '📊 Еженедельный отчёт',
              message: `Результат: ${lost} кг, соблюдение плана: ${adherence}%`,
              url: '/nutrition/progress',
            });
            localStorage.setItem(notifKey, 'true');
          }

          if (s.type === 'plan_ending' && isTimeMatch(s.time_value || '10:00')) {
            if (localStorage.getItem(notifKey)) continue;
            const remaining = stats?.days_remaining || 0;
            if (remaining <= 2 && remaining > 0) {
              sendNotification({
                title: '🏁 План завершается',
                message: `Осталось ${remaining} ${remaining === 1 ? 'день' : 'дня'} до конца плана питания!`,
                url: '/nutrition/progress',
              });
              localStorage.setItem(notifKey, 'true');
            }
          }
        }

        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const cutoff = twoDaysAgo.toISOString().slice(0, 10);
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('diet_notif_')) {
            const dateMatch = key.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch && dateMatch[0] < cutoff) {
              localStorage.removeItem(key);
            }
          }
        });
      } catch (e) {
        console.error('[DietReminders] Error:', e);
      }
    };

    checkDietReminders();
    const interval = setInterval(checkDietReminders, 60000);

    return () => clearInterval(interval);
  }, [sendNotification]);
}

export default useDietReminders;
