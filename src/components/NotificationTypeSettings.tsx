import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface NotificationSettings {
  votings: boolean;
  tasks: boolean;
  shopping: boolean;
  calendar: boolean;
  medications: boolean;
  birthdays: boolean;
  subscription: boolean;
  important_dates: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  votings: true,
  tasks: true,
  shopping: true,
  calendar: true,
  medications: true,
  birthdays: true,
  subscription: true,
  important_dates: true,
};

const NOTIFICATION_TYPES = [
  {
    key: 'votings' as keyof NotificationSettings,
    icon: 'Vote',
    title: 'Голосования',
    description: 'Новые голосования и напоминания проголосовать',
  },
  {
    key: 'tasks' as keyof NotificationSettings,
    icon: 'CheckSquare',
    title: 'Задачи',
    description: 'Назначение задач и напоминания о дедлайнах',
  },
  {
    key: 'shopping' as keyof NotificationSettings,
    icon: 'ShoppingCart',
    title: 'Покупки',
    description: 'Срочные товары и обновления списка покупок',
  },
  {
    key: 'calendar' as keyof NotificationSettings,
    icon: 'Calendar',
    title: 'События календаря',
    description: 'Напоминания о предстоящих событиях',
  },
  {
    key: 'medications' as keyof NotificationSettings,
    icon: 'Pill',
    title: 'Лекарства',
    description: 'Напоминания о приёме лекарств для детей',
  },
  {
    key: 'birthdays' as keyof NotificationSettings,
    icon: 'Cake',
    title: 'Дни рождения',
    description: 'Напоминания о днях рождения членов семьи',
  },
  {
    key: 'important_dates' as keyof NotificationSettings,
    icon: 'Star',
    title: 'Важные даты',
    description: 'Годовщины и важные семейные события',
  },
  {
    key: 'subscription' as keyof NotificationSettings,
    icon: 'CreditCard',
    title: 'Подписка',
    description: 'Уведомления об истечении подписки',
  },
];

export function NotificationTypeSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
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
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(func2url['push-notifications'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          action: 'update_settings',
          settings: newSettings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      alert('Не удалось сохранить настройки. Попробуйте позже.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    const newSettings = {
      ...settings,
      [key]: !settings[key],
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  if (isLoading) {
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
          Выберите, какие уведомления вы хотите получать
        </p>
        
        {NOTIFICATION_TYPES.map((type) => (
          <div
            key={type.key}
            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              <Icon name={type.icon as any} size={20} className="text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm">{type.title}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{type.description}</p>
              </div>
            </div>
            <Switch
              checked={settings[type.key]}
              onCheckedChange={() => handleToggle(type.key)}
              disabled={isSaving}
              className="flex-shrink-0 ml-3"
            />
          </div>
        ))}

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
