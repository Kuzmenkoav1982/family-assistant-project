import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface TypeSetting {
  enabled: boolean;
  remind_before: string;
}

interface NotificationSettings {
  votings: boolean | TypeSetting;
  tasks: boolean | TypeSetting;
  shopping: boolean | TypeSetting;
  calendar: boolean | TypeSetting;
  medications: boolean | TypeSetting;
  birthdays: boolean | TypeSetting;
  subscription: boolean | TypeSetting;
  important_dates: boolean | TypeSetting;
}

const REMIND_OPTIONS = [
  { value: '30m', label: 'За 30 минут' },
  { value: '1h', label: 'За 1 час' },
  { value: '2h', label: 'За 2 часа' },
  { value: '1d', label: 'За 1 день' },
  { value: '1d+1h', label: 'За 1 день и за 1 час' },
  { value: '1d+2h', label: 'За 1 день и за 2 часа' },
];

const DATE_REMIND_OPTIONS = [
  { value: '1d', label: 'За 1 день' },
  { value: '3d', label: 'За 3 дня' },
  { value: '7d', label: 'За неделю' },
  { value: '1d+7d', label: 'За неделю и за 1 день' },
];

const NOTIFICATION_TYPES = [
  {
    key: 'calendar' as keyof NotificationSettings,
    icon: 'Calendar',
    title: 'События календаря',
    description: 'Напоминания о предстоящих событиях',
    hasRemindBefore: true,
    remindOptions: REMIND_OPTIONS,
    defaultRemind: '1d+1h',
  },
  {
    key: 'birthdays' as keyof NotificationSettings,
    icon: 'Cake',
    title: 'Дни рождения',
    description: 'Напоминания о днях рождения членов семьи',
    hasRemindBefore: true,
    remindOptions: DATE_REMIND_OPTIONS,
    defaultRemind: '1d',
  },
  {
    key: 'important_dates' as keyof NotificationSettings,
    icon: 'Star',
    title: 'Важные даты',
    description: 'Годовщины и важные семейные события',
    hasRemindBefore: true,
    remindOptions: DATE_REMIND_OPTIONS,
    defaultRemind: '1d',
  },
  {
    key: 'medications' as keyof NotificationSettings,
    icon: 'Pill',
    title: 'Лекарства',
    description: 'Напоминания о приёме лекарств',
    hasRemindBefore: false,
  },
  {
    key: 'tasks' as keyof NotificationSettings,
    icon: 'CheckSquare',
    title: 'Задачи',
    description: 'Срочные задачи и напоминания о дедлайнах',
    hasRemindBefore: false,
  },
  {
    key: 'shopping' as keyof NotificationSettings,
    icon: 'ShoppingCart',
    title: 'Покупки',
    description: 'Срочные товары в списке покупок',
    hasRemindBefore: false,
  },
  {
    key: 'votings' as keyof NotificationSettings,
    icon: 'Vote',
    title: 'Голосования',
    description: 'Новые голосования и напоминания проголосовать',
    hasRemindBefore: false,
  },
  {
    key: 'subscription' as keyof NotificationSettings,
    icon: 'CreditCard',
    title: 'Подписка',
    description: 'Уведомления об истечении подписки',
    hasRemindBefore: false,
  },
];

function getEnabled(val: boolean | TypeSetting | undefined): boolean {
  if (val === undefined) return true;
  if (typeof val === 'boolean') return val;
  return val.enabled;
}

function getRemindBefore(val: boolean | TypeSetting | undefined, defaultVal: string): string {
  if (val && typeof val === 'object' && val.remind_before) return val.remind_before;
  return defaultVal;
}

export function NotificationTypeSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`${func2url['push-notifications']}?action=get_settings`, {
        headers: { 'X-Auth-Token': token },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(migrateSettings(data.settings));
        } else {
          setSettings(buildDefaults());
        }
      } else {
        setSettings(buildDefaults());
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      setSettings(buildDefaults());
    } finally {
      setIsLoading(false);
    }
  };

  const migrateSettings = (raw: Record<string, boolean | TypeSetting>): NotificationSettings => {
    const result = {} as Record<string, boolean | TypeSetting>;
    for (const type of NOTIFICATION_TYPES) {
      const val = raw[type.key];
      if (val === undefined) {
        result[type.key] = type.hasRemindBefore
          ? { enabled: true, remind_before: type.defaultRemind || '1d' }
          : { enabled: true, remind_before: '' };
      } else if (typeof val === 'boolean') {
        result[type.key] = type.hasRemindBefore
          ? { enabled: val, remind_before: type.defaultRemind || '1d' }
          : { enabled: val, remind_before: '' };
      } else {
        result[type.key] = val;
      }
    }
    return result as NotificationSettings;
  };

  const buildDefaults = (): NotificationSettings => {
    const result = {} as Record<string, TypeSetting>;
    for (const type of NOTIFICATION_TYPES) {
      result[type.key] = {
        enabled: true,
        remind_before: type.hasRemindBefore ? (type.defaultRemind || '1d') : '',
      };
    }
    return result as NotificationSettings;
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
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
      console.error('Failed to save notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    if (!settings) return;
    const current = settings[key];
    const newVal: TypeSetting = typeof current === 'object'
      ? { ...current, enabled: !current.enabled }
      : { enabled: !(current as boolean), remind_before: '' };
    const newSettings = { ...settings, [key]: newVal };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleRemindChange = (key: keyof NotificationSettings, value: string) => {
    if (!settings) return;
    const current = settings[key];
    const newVal: TypeSetting = typeof current === 'object'
      ? { ...current, remind_before: value }
      : { enabled: true, remind_before: value };
    const newSettings = { ...settings, [key]: newVal };
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

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="Settings" size={20} className="text-gray-600" />
          Типы уведомлений
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Выберите, какие уведомления получать и за сколько напоминать
        </p>
        
        {NOTIFICATION_TYPES.map((type) => {
          const enabled = getEnabled(settings[type.key]);
          const remindBefore = getRemindBefore(settings[type.key], type.defaultRemind || '');

          return (
            <div
              key={type.key}
              className={`p-3 rounded-lg border transition-colors ${
                enabled ? 'bg-gray-50 border-gray-200 hover:border-gray-300' : 'bg-gray-100 border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Icon name={type.icon} size={20} className="text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{type.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{type.description}</p>
                  </div>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={() => handleToggle(type.key)}
                  disabled={isSaving}
                  className="flex-shrink-0 ml-3"
                />
              </div>

              {type.hasRemindBefore && enabled && (
                <div className="mt-3 ml-8 flex items-center gap-2">
                  <Icon name="Clock" size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600 flex-shrink-0">Напомнить:</span>
                  <Select value={remindBefore} onValueChange={(v) => handleRemindChange(type.key, v)}>
                    <SelectTrigger className="h-8 text-xs w-auto min-w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(type.remindOptions || []).map((opt) => (
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

        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 py-2">
            <Icon name="Loader2" size={16} className="animate-spin" />
            Сохранение...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NotificationTypeSettings;