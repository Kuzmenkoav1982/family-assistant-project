import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LazyImage } from '@/components/ui/LazyImage';
import Icon from '@/components/ui/icon';
import { calculateMemberWorkload, getWorkloadDescription } from '@/utils/memberWorkload';
import { loadWidgetSettings } from '@/types/widgetSettings';
import type { FamilyMember } from '@/types/family.types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface Task {
  id: string;
  assignee_id?: string;
  completed: boolean;
}

interface CalendarEvent {
  id: string;
  date: string;
  participants?: string[];
}

interface MemberCardProps {
  member: FamilyMember;
  index: number;
  onClick: () => void;
  tasks?: Task[];
  events?: CalendarEvent[];
  onAssignTask?: (memberId: string) => void;
}

export const MemberCard = ({
  member,
  index,
  onClick,
  tasks = [],
  events = [],
  onAssignTask,
}: MemberCardProps) => {
  const [widgetSettings] = useState(() => loadWidgetSettings());
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const { toast } = useToast();
  const metrics = calculateMemberWorkload(member, tasks, events);
  const workloadDesc = getWorkloadDescription(metrics);

  const handleGenerateInvite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGeneratingInvite(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast({
          title: 'Ошибка',
          description: 'Необходима авторизация',
          variant: 'destructive',
        });
        setIsGeneratingInvite(false);
        return;
      }

      if (!member.id) {
        toast({
          title: 'Ошибка',
          description: 'Некорректный ID участника',
          variant: 'destructive',
        });
        setIsGeneratingInvite(false);
        return;
      }

      const response = await fetch(func2url['child-invite'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          action: 'create',
          child_member_id: member.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const inviteUrl = data.invite_url;
        const shareText = `Привет! Присоединяйся к нашей семье в приложении "Наша Семья". Перейди по ссылке для активации аккаунта:`;

        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Приглашение в семью',
              text: shareText,
              url: inviteUrl,
            });

            toast({
              title: '✅ Ссылка отправлена!',
              description: `Приглашение для ${data.child_name} успешно отправлено`,
            });
          } catch (shareError: unknown) {
            const err = shareError as { name?: string };
            if (err.name !== 'AbortError') {
              await navigator.clipboard.writeText(inviteUrl);
              toast({
                title: '📋 Ссылка скопирована',
                description: `Отправьте её ${data.child_name} для активации аккаунта`,
              });
            }
          }
        } else {
          await navigator.clipboard.writeText(inviteUrl);
          toast({
            title: '📋 Ссылка скопирована',
            description: `Отправьте её ${data.child_name} для активации аккаунта`,
          });
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать приглашение',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  return (
    <TooltipProvider>
      <Card
        className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-102 animate-fade-in group"
        style={{ animationDelay: `${index * 0.1}s` }}
        onClick={onClick}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="relative flex-shrink-0">
              {member.photoUrl ? (
                <LazyImage
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-300 group-hover:border-purple-500 transition-colors"
                  wrapperClassName="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-3xl border-2 border-purple-300 group-hover:border-purple-500 transition-colors">
                  {member.avatar}
                </div>
              )}
              {member.moodStatus && (
                <div className="absolute -bottom-1 -right-1 text-lg bg-white rounded-full border-2 border-white" title={member.moodStatus.label}>
                  {member.moodStatus.emoji}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <h3 className="font-bold text-sm sm:text-base mb-1 truncate group-hover:text-purple-600 transition-colors">{member.name}</h3>

              {(widgetSettings.showAge && member.age) || (widgetSettings.showRole && member.role) ? (
                <p className="text-sm text-muted-foreground mb-2">
                  {widgetSettings.showAge && member.age && `${member.age} лет`}
                  {widgetSettings.showAge && member.age && widgetSettings.showRole && member.role && ' • '}
                  {widgetSettings.showRole && member.role}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs bg-purple-50 flex items-center justify-center">
                  <Icon name="Award" size={10} className="mr-1" />
                  <span className="flex items-center">Ур. {member.level}</span>
                </Badge>
                <Badge variant="outline" className="text-xs bg-orange-50 flex items-center justify-center">
                  <Icon name="Star" size={10} className="mr-1" />
                  <span className="flex items-center">{member.points}</span>
                </Badge>
                {member.account_type === 'child_profile' ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-300 cursor-help px-1.5 py-0">
                        Без доступа
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium text-amber-900">👶 Профиль без доступа</p>
                      <p className="text-xs text-gray-600 mt-1">Создан для отслеживания развития и активностей ребенка</p>
                      <p className="text-xs text-gray-500 mt-1">• Не может входить в приложение</p>
                      <p className="text-xs text-gray-500">• Не участвует в голосованиях семьи</p>
                      <p className="text-xs text-gray-500">• Данные видны только родителям</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-300 cursor-help px-1.5 py-0">
                        С доступом
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium text-green-900">✅ Аккаунт с доступом</p>
                      <p className="text-xs text-gray-600 mt-1">Полноценный участник семьи с авторизацией</p>
                      <p className="text-xs text-gray-500 mt-1">• Может входить в приложение</p>
                      <p className="text-xs text-gray-500">• Участвует в семейных голосованиях</p>
                      <p className="text-xs text-gray-500">• Имеет доступ к функциям семьи</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {widgetSettings.showWorkload && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Загруженность</span>
                <Badge className={`${metrics.workloadColor} text-white text-xs px-2`}>
                  {metrics.workloadLabel}
                </Badge>
              </div>
              <Progress value={metrics.workloadPercentage} className="h-2 mb-1" />
              <p className="text-xs text-gray-500" title={workloadDesc}>
                {workloadDesc}
              </p>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-4 gap-1.5">
            {widgetSettings.showActiveTasks && (
              <div className="flex flex-col items-center justify-center text-center">
                <Icon name="ListTodo" size={13} className="text-blue-500 mb-0.5" />
                <span className="text-sm font-bold text-gray-900 leading-none">{metrics.activeTasks}</span>
                <p className="text-[9px] text-gray-500 leading-tight whitespace-nowrap mt-0.5">Задач</p>
              </div>
            )}
            {widgetSettings.showCompletedToday && (
              <div className="flex flex-col items-center justify-center text-center">
                <Icon name="CheckSquare" size={13} className="text-green-500 mb-0.5" />
                <span className="text-sm font-bold text-gray-900 leading-none">{metrics.completedToday}</span>
                <p className="text-[9px] text-gray-500 leading-tight whitespace-nowrap mt-0.5">Готово</p>
              </div>
            )}
            {widgetSettings.showTodayEvents && (
              <div className="flex flex-col items-center justify-center text-center">
                <Icon name="Calendar" size={13} className="text-purple-500 mb-0.5" />
                <span className="text-sm font-bold text-gray-900 leading-none">{metrics.todayEvents}</span>
                <p className="text-[9px] text-gray-500 leading-tight whitespace-nowrap mt-0.5">Сегодня</p>
              </div>
            )}
            {widgetSettings.showWeekAchievements && (
              <div className="flex flex-col items-center justify-center text-center">
                <Icon name="Trophy" size={13} className="text-yellow-500 mb-0.5" />
                <span className="text-sm font-bold text-gray-900 leading-none">{metrics.weekAchievements}</span>
                <p className="text-[9px] text-gray-500 leading-tight whitespace-nowrap mt-0.5">Неделя</p>
              </div>
            )}
          </div>

          {member.account_type === 'child_profile' && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-[11px] sm:text-xs bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 hover:bg-amber-100 px-2"
                    onClick={handleGenerateInvite}
                    disabled={isGeneratingInvite}
                  >
                    {isGeneratingInvite ? (
                      <Icon name="Loader2" size={12} className="mr-1 flex-shrink-0 animate-spin" />
                    ) : (
                      <Icon name="Link" size={12} className="mr-1 flex-shrink-0" />
                    )}
                    <span className="truncate">{isGeneratingInvite ? 'Создание...' : 'Отправить приглашение'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-medium text-amber-900">🔗 Активация аккаунта</p>
                  <p className="text-xs text-gray-600 mt-1">Создайте персональную ссылку для {member.name}</p>
                  <p className="text-xs text-gray-500 mt-1">Ребёнок сможет привязать свой аккаунт и получить полный доступ</p>
                  <p className="text-xs text-amber-600 mt-2 font-medium">📱 На телефоне откроется меню "Поделиться"</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {widgetSettings.showQuickActions && onAssignTask && member.account_type !== 'child_profile' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignTask(member.id);
                }}
              >
                <Icon name="Plus" size={12} className="mr-1" />
                Задача
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Icon name="ChevronRight" size={14} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
