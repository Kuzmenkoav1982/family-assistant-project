import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import type { FamilyMember, CalendarEvent } from '@/types/family.types';

interface Task {
  id: string;
  completed: boolean;
  dueDate?: string;
  deadline?: string;
}

interface FamilySetupChecklistProps {
  familyMembers: FamilyMember[];
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  onInvite?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  hint: string;
  icon: string;
  color: string;
  action: () => void;
  actionLabel: string;
}

const STORAGE_KEY = 'family_setup_checklist_dismissed';

export default function FamilySetupChecklist({
  familyMembers,
  tasks,
  calendarEvents,
  onInvite,
}: FamilySetupChecklistProps) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setDismissed(isDismissed);
  }, []);

  const userData = (() => {
    try {
      const raw = localStorage.getItem('userData');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const currentMember = familyMembers.find(m => m.id === userData?.member_id) || familyMembers[0];

  // Проверяем выполнение каждого пункта
  const checks = {
    hasPhoto: !!(currentMember?.photo_url || (currentMember?.avatar && currentMember.avatar.startsWith('http'))),
    hasSecondMember: familyMembers.length >= 2,
    hasEvent: calendarEvents.length > 0,
    hasTask: tasks.filter(t => !t.completed).length > 0 || tasks.length > 0,
    hasFamilyName: !!(userData?.family_name && userData.family_name !== `Семья ${userData?.email}`),
  };

  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = Object.keys(checks).length;
  const allDone = completedCount === totalCount;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const items: ChecklistItem[] = [
    {
      id: 'hasFamilyName',
      label: 'Дайте имя вашей семье',
      hint: 'Название семьи видят все её участники',
      icon: 'Home',
      color: 'text-purple-600',
      actionLabel: 'Настроить',
      action: () => navigate('/family-management'),
    },
    {
      id: 'hasPhoto',
      label: 'Добавьте фото профиля',
      hint: 'Личное фото делает аккаунт живым',
      icon: 'Camera',
      color: 'text-blue-600',
      actionLabel: 'Добавить фото',
      action: () => navigate('/member-profile'),
    },
    {
      id: 'hasSecondMember',
      label: 'Пригласите члена семьи',
      hint: 'Приложение работает лучше вместе',
      icon: 'UserPlus',
      color: 'text-green-600',
      actionLabel: 'Пригласить',
      action: () => onInvite ? onInvite() : navigate('/family-management'),
    },
    {
      id: 'hasEvent',
      label: 'Добавьте первое событие',
      hint: 'День рождения, встреча или поездка',
      icon: 'Calendar',
      color: 'text-orange-600',
      actionLabel: 'Добавить',
      action: () => navigate('/calendar'),
    },
    {
      id: 'hasTask',
      label: 'Создайте первую задачу',
      hint: 'Распределите дела между всеми',
      icon: 'CheckSquare',
      color: 'text-pink-600',
      actionLabel: 'Создать',
      action: () => navigate('/tasks'),
    },
  ];

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  // Показываем только если не все пункты выполнены и не скрыт
  if (dismissed || allDone) return null;

  // Показываем только новым пользователям — онбординг завершён, но профиль не до конца настроен
  const onboardingDone = localStorage.getItem('onboarding_completed') === 'true';
  if (!onboardingDone) return null;

  return (
    <Card className="border-2 border-violet-100 bg-gradient-to-br from-violet-50/80 to-white overflow-hidden">
      <CardContent className="p-4">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Icon name="Rocket" size={16} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Настройте семью</h3>
              <p className="text-xs text-gray-500">{completedCount} из {totalCount} выполнено</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-300 hover:text-gray-500 transition-colors p-1"
            title="Скрыть"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Прогресс-бар */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Список пунктов */}
        <div className="space-y-2">
          {items.map(item => {
            const done = checks[item.id as keyof typeof checks];
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                  done ? 'opacity-50' : 'hover:bg-violet-50/50'
                }`}
              >
                {/* Чекбокс */}
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  done
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-300'
                }`}>
                  {done && <Icon name="Check" size={10} className="text-white" />}
                </div>

                {/* Иконка + текст */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Icon name={item.icon} size={15} className={done ? 'text-gray-400' : item.color} />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium leading-tight ${done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.label}
                    </p>
                    {!done && (
                      <p className="text-xs text-gray-400 leading-tight">{item.hint}</p>
                    )}
                  </div>
                </div>

                {/* Кнопка действия */}
                {!done && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={item.action}
                    className="text-xs h-7 px-2.5 text-violet-600 hover:text-violet-700 hover:bg-violet-100 flex-shrink-0"
                  >
                    {item.actionLabel}
                    <Icon name="ChevronRight" size={12} className="ml-0.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Поздравление когда почти готово */}
        {completedCount >= totalCount - 1 && !allDone && (
          <div className="mt-3 text-center">
            <p className="text-xs text-violet-600 font-medium">🎉 Почти готово! Остался последний шаг</p>
          </div>
        )}

        {/* Скрыть */}
        {completedCount === 0 && (
          <button
            onClick={handleDismiss}
            className="w-full mt-3 text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Скрыть это
          </button>
        )}
      </CardContent>
    </Card>
  );
}
