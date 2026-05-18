import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiFetch, getAuthToken } from './api';
import { getReligionEmoji, getReligionLabel } from './constants';
import func2url from '../../../backend/func2url.json';
import type { Holiday, FastingPeriod, Prayer, TempleData } from './types';

export function useFaithData() {
  const { toast } = useToast();
  const [religion, setReligion] = useState('orthodox');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [fasting, setFasting] = useState<FastingPeriod[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [templeData, setTempleData] = useState<TempleData>({ name: '', address: '', schedule: '', contacts: '' });
  const [collapseReligion, setCollapseReligion] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await apiFetch('get_settings');
      if (data.settings?.religion) {
        setReligion(data.settings.religion);
      }
      if (data.settings) {
        setTempleData({
          name: data.settings.templeName || '',
          address: data.settings.templeAddress || '',
          schedule: data.settings.templeSchedule || '',
          contacts: data.settings.templeContacts || '',
        });
      }
    } catch { /* use defaults */ }
  }, []);

  const loadData = useCallback(async (rel: string) => {
    setLoading(true);
    try {
      const [hData, fData, pData] = await Promise.all([
        apiFetch('get_holidays', { religion: rel }),
        apiFetch('get_fasting', { religion: rel }),
        apiFetch('get_prayers', { religion: rel }),
      ]);
      const allHolidays = [...(hData.holidays || []), ...(hData.customEvents || [])];
      setHolidays(allHolidays);
      setFasting(fData.fasting || []);
      setPrayers(pData.prayers || []);
    } catch (err) {
      console.error('Faith API error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    loadData(religion);
  }, [religion, loadData]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await apiFetch('save_settings', { religion });
      localStorage.setItem('faith_religion_open', '0');
      setCollapseReligion(true);
      toast({ title: 'Сохранено', description: `${getReligionEmoji(religion)} ${getReligionLabel(religion)} выбрано как ваше вероисповедание` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const syncToCalendar = async (holiday: Holiday) => {
    try {
      const calendarApi = (func2url as Record<string, string>)['calendar-events'];
      const res = await fetch(calendarApi, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getAuthToken() },
        body: JSON.stringify({
          action: 'create',
          title: `${getReligionEmoji(religion)} ${holiday.title}`,
          description: holiday.description,
          date: holiday.event_date,
        }),
      });
      if (res.ok) {
        toast({ title: 'Добавлено в календарь', description: `${holiday.title} синхронизирован с семейным календарём` });
      } else {
        throw new Error('calendar_error');
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось добавить в календарь', variant: 'destructive' });
    }
  };

  const addCustomEvent = async (title: string, eventDate: string, description: string) => {
    try {
      await apiFetch('add_custom_event', { title, date: eventDate, description, religion });
      toast({ title: 'Событие добавлено', description: title });
      await loadData(religion);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    }
  };

  const deleteCustomEvent = async (id: number) => {
    try {
      await apiFetch('delete_custom_event', { eventId: id });
      toast({ title: 'Удалено' });
      await loadData(religion);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    }
  };

  const saveTemple = async (data: TempleData) => {
    setSaving(true);
    try {
      await apiFetch('save_settings', {
        religion,
        templeName: data.name,
        templeAddress: data.address,
        templeSchedule: data.schedule,
        templeContacts: data.contacts,
      });
      setTempleData(data);
      toast({ title: 'Сохранено', description: 'Информация о вашем месте поклонения обновлена' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения';
      toast({ title: 'Ошибка', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return {
    religion, setReligion,
    loading, saving,
    holidays, fasting, prayers,
    templeData, collapseReligion,
    saveSettings, syncToCalendar,
    addCustomEvent, deleteCustomEvent, saveTemple,
  };
}
