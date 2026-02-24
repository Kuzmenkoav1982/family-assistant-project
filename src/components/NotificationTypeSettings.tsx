import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface TypeSetting {
  enabled: boolean;
  remind_before: string;
}

interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface FullSettings {
  [key: string]: boolean | TypeSetting | QuietHours;
}

const REMIND_OPTIONS = [
  { value: '30m', label: 'За 30 мин' },
  { value: '1h', label: 'За 1 час' },
  { value: '2h', label: 'За 2 часа' },
  { value: '1d', label: 'За 1 день' },
  { value: '1d+1h', label: 'За день и за час' },
  { value: '1d+2h', label: 'За день и за 2 часа' },
];

const DATE_REMIND_OPTIONS = [
  { value: '1d', label: 'За 1 день' },
  { value: '3d', label: 'За 3 дня' },
  { value: '7d', label: 'За неделю' },
  { value: '1d+7d', label: 'За неделю и за день' },
];

const MED_REMIND_OPTIONS = [
  { value: '5m', label: 'За 5 минут' },
  { value: '15m', label: 'За 15 минут' },
  { value: '30m', label: 'За 30 минут' },
  { value: '1h', label: 'За 1 час' },
];

const TASK_REMIND_OPTIONS = [
  { value: '1h', label: 'За 1 час' },
  { value: '2h', label: 'За 2 часа' },
  { value: '1d', label: 'За 1 день' },
  { value: '1d+1h', label: 'За день и за час' },
];

const QUIET_HOURS_OPTIONS = [
  '21:00', '22:00', '23:00', '00:00',
];

const QUIET_END_OPTIONS = [
  '06:00', '07:00', '08:00', '09:00',
];

const NOTIFICATION_TYPES = [
  {
    key: 'calendar',
    icon: 'Calendar',
    title: 'События календаря',
    description: 'Напоминания о предстоящих событиях',
    remindOptions: REMIND_OPTIONS,
    defaultRemind: '1d+1h',
  },
  {
    key: 'birthdays',
    icon: 'Cake',
    title: 'Дни рождения',
    description: 'Дни рождения членов семьи',
    remindOptions: DATE_REMIND_OPTIONS,
    defaultRemind: '1d',
  },
  {
    key: 'important_dates',
    icon: 'Star',
    title: 'Важные даты',
    description: 'Годовщины и семейные события',
    remindOptions: DATE_REMIND_OPTIONS,
    defaultRemind: '1d',
  },
  {
    key: 'medications',
    icon: 'Pill',
    title: 'Лекарства',
    description: 'Приём лекарств по расписанию',
    remindOptions: MED_REMIND_OPTIONS,
    defaultRemind: '15m',
  },
  {
    key: 'tasks',
    icon: 'CheckSquare',
    title: 'Задачи',
    description: 'Срочные задачи и дедлайны',
    remindOptions: TASK_REMIND_OPTIONS,
    defaultRemind: '1d',
  },
  {
    key: 'shopping',
    icon: 'ShoppingCart',
    title: 'Покупки',
    description: 'Срочные товары в списке',
    remindOptions: null,
    defaultRemind: '',
  },
  {
    key: 'votings',
    icon: 'Vote',
    title: 'Голосования',
    description: 'Новые голосования в семье',
    remindOptions: null,
    defaultRemind: '',
  },
  {
    key: 'subscription',
    icon: 'CreditCard',
    title: 'Подписка',
    description: 'Истечение подписки',
    remindOptions: null,
    defaultRemind: '',
  },
];

function getEnabled(val: boolean | TypeSetting | undefined): boolean {
  if (val === undefined) return true;
  if (typeof val === 'boolean') return val;
  return val.enabled;
}

function getRemindBefore(val: boolean | TypeSetting | undefined, defaultVal: string): string {
  if (val && typeof val === 'object' && 'remind_before' in val && val.remind_before) return val.remind_before;
  return defaultVal;
}

export function NotificationTypeSettings() {
  const [settings, setSettings] = useState<FullSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const migrateSettings = useCallback((raw: Record<string, unknown>): FullSettings => {
    const result: FullSettings = {};
    for (const type of NOTIFICATION_TYPES) {
      const val = raw[type.key];
      if (val === undefined) {
        result[type.key] = { enabled: true, remind_before: type.defaultRemind };
      } else if (typeof val === 'boolean') {
        result[type.key] = { enabled: val, remind_before: type.defaultRemind };
      } else {
        result[type.key] = val as TypeSetting;
      }
    }
    if (raw.quiet_hours && typeof raw.quiet_hours === 'object') {
      result.quiet_hours = raw.quiet_hours as QuietHours;
    } else {
      result.quiet_hours = { enabled: true, start: '22:00', end: '07:00' };
    }
    return result;
  }, []);

  const buildDefaults = useCallback((): FullSettings => {
    const result: FullSettings = {};
    for (const type of NOTIFICATION_TYPES) {
      result[type.key] = { enabled: true, remind_before: type.defaultRemind };
    }
    result.quiet_hours = { enabled: true, start: '22:00', end: '07:00' };
    return result;
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const response = await fetch(`${func2url['push-notifications']}?action=get_settings`, {
        headers: { 'X-Auth-Token': token },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings ? migrateSettings(data.settings) : buildDefaults());
      } else {
        setSettings(buildDefaults());
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      setSettings(buildDefaults());
    } finally {
      setIsLoading(false);
    }
  }, [migrateSettings, buildDefaults]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (newSettings: FullSettings) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      await fetch(func2url['push-notifications'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ action: 'update_settings', settings: newSettings }),
      });
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: string) => {
    if (!settings) return;
    const current = settings[key] as TypeSetting;
    const newVal: TypeSetting = { ...current, enabled: !current.enabled };
    const newSettings = { ...settings, [key]: newVal };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleRemindChange = (key: string, value: string) => {
    if (!settings) return;
    const current = settings[key] as TypeSetting;
    const newVal: TypeSetting = { ...current, remind_before: value };
    const newSettings = { ...settings, [key]: newVal };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleQuietToggle = () => {
    if (!settings) return;
    const qh = settings.quiet_hours as QuietHours;
    const newSettings = { ...settings, quiet_hours: { ...qh, enabled: !qh.enabled } };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleQuietChange = (field: 'start' | 'end', value: string) => {
    if (!settings) return;
    const qh = settings.quiet_hours as QuietHours;
    const newSettings = { ...settings, quiet_hours: { ...qh, [field]: value } };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (isLoading || !settings) {
    return (
      <Card className="border-gray-200">
        <CardContent className="py-6 flex items-center justify-center">
          <Icon name="Loader2" size={24} className="animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  const quietHours = settings.quiet_hours as QuietHours;

  return (
    <div className="space-y-4">
      <Card className="border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Settings" size={20} className="text-gray-600" />
            Типы уведомлений
          </CardTitle>
          <p className="text-sm text-gray-500">Какие уведомления получать и за сколько напоминать</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {NOTIFICATION_TYPES.map((type) => {
            const enabled = getEnabled(settings[type.key] as TypeSetting);
            const remindBefore = getRemindBefore(settings[type.key] as TypeSetting, type.defaultRemind);

            return (
              <div
                key={type.key}
                className={`p-3 rounded-lg border transition-colors ${
                  enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <Icon name={type.icon} size={18} className="text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm leading-tight">{type.title}</h4>
                      <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">{type.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => handleToggle(type.key)}
                    disabled={isSaving}
                    className="flex-shrink-0"
                  />
                </div>

                {type.remindOptions && enabled && (
                  <div className="mt-2 ml-7 flex items-center gap-2">
                    <Icon name="Clock" size={13} className="text-gray-400 flex-shrink-0" />
                    <Select value={remindBefore} onValueChange={(v) => handleRemindChange(type.key, v)}>
                      <SelectTrigger className="h-7 text-xs flex-1 max-w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {type.remindOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <Icon name="Moon" size={18} className="text-indigo-600" />
              <div>
                <h4 className="font-medium text-gray-900 text-sm">Тихие часы</h4>
                <p className="text-xs text-gray-500">Без уведомлений в ночное время</p>
              </div>
            </div>
            <Switch
              checked={quietHours.enabled}
              onCheckedChange={handleQuietToggle}
              disabled={isSaving}
            />
          </div>

          {quietHours.enabled && (
            <div className="flex items-center gap-2 ml-7 flex-wrap">
              <span className="text-xs text-gray-600">С</span>
              <Select value={quietHours.start} onValueChange={(v) => handleQuietChange('start', v)}>
                <SelectTrigger className="h-7 text-xs w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUIET_HOURS_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-600">до</span>
              <Select value={quietHours.end} onValueChange={(v) => handleQuietChange('end', v)}>
                <SelectTrigger className="h-7 text-xs w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUIET_END_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {isSaving && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-1">
          <Icon name="Loader2" size={14} className="animate-spin" />
          Сохранение...
        </div>
      )}
    </div>
  );
}

export default NotificationTypeSettings;