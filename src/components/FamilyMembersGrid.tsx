import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LazyImage } from '@/components/ui/LazyImage';
import Icon from '@/components/ui/icon';
import { VirtualizedList } from '@/components/VirtualizedList';
import { WidgetSettingsDialog } from '@/components/WidgetSettingsDialog';
import { calculateMemberWorkload, getWorkloadDescription } from '@/utils/memberWorkload';
import { loadWidgetSettings } from '@/types/widgetSettings';
import type { FamilyMember } from '@/types/family.types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

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

interface FamilyMembersGridProps {
  members: FamilyMember[];
  onMemberClick: (member: FamilyMember) => void;
  tasks?: Task[];
  events?: CalendarEvent[];
  onAssignTask?: (memberId: string) => void;
}

const MemberCard = ({ 
  member, 
  index, 
  onClick, 
  tasks = [], 
  events = [],
  onAssignTask 
}: { 
  member: FamilyMember; 
  index: number; 
  onClick: () => void; 
  tasks?: Task[];
  events?: CalendarEvent[];
  onAssignTask?: (memberId: string) => void;
}) => {
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
          variant: 'destructive'
        });
        setIsGeneratingInvite(false);
        return;
      }
      
      if (!member.id) {
        toast({
          title: 'Ошибка',
          description: 'Некорректный ID участника',
          variant: 'destructive'
        });
        setIsGeneratingInvite(false);
        return;
      }
      
      const response = await fetch(func2url['child-invite'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({
          action: 'create',
          child_member_id: member.id
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const inviteUrl = data.invite_url;
        const shareText = `Привет! Присоединяйся к нашей семье в приложении "Наша Семья". Перейди по ссылке для активации аккаунта:`;
        
        // Проверяем поддержку Web Share API (мобильные устройства)
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Приглашение в семью',
              text: shareText,
              url: inviteUrl
            });
            
            toast({
              title: '✅ Ссылка отправлена!',
              description: `Приглашение для ${data.child_name} успешно отправлено`
            });
          } catch (shareError: unknown) {
            const err = shareError as { name?: string };
            if (err.name !== 'AbortError') {
              // Fallback: копируем в буфер обмена
              await navigator.clipboard.writeText(inviteUrl);
              toast({
                title: '📋 Ссылка скопирована',
                description: `Отправьте её ${data.child_name} для активации аккаунта`
              });
            }
          }
        } else {
          // Desktop: копируем в буфер обмена
          await navigator.clipboard.writeText(inviteUrl);
          toast({
            title: '📋 Ссылка скопирована',
            description: `Отправьте её ${data.child_name} для активации аккаунта`
          });
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать приглашение',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
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

const AddMemberCard = () => {
  const navigate = useNavigate();
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 border border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30"
      onClick={() => navigate('/settings')}
    >
      <CardContent className="p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Icon name="UserPlus" size={16} className="text-purple-500" />
          </div>
          <span className="text-xs sm:text-sm text-purple-600 font-medium">Добавить члена семьи</span>
        </div>
      </CardContent>
    </Card>
  );
};

function ensureOwnerFirst(members: FamilyMember[]): FamilyMember[] {
  const ownerIdx = members.findIndex(m => (m.role || '').toLowerCase() === 'владелец');
  if (ownerIdx > 0) {
    const sorted = [...members];
    const [owner] = sorted.splice(ownerIdx, 1);
    sorted.unshift(owner);
    return sorted;
  }
  return members;
}

export function FamilyMembersGrid({ members: rawMembers, onMemberClick, tasks = [], events = [], onAssignTask }: FamilyMembersGridProps) {
  const members = ensureOwnerFirst(rawMembers);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  
  if (members.length > 50) {
    return (
      <div className="space-y-4">
        <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
          <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                  <h3 className="font-semibold text-blue-900 text-base">
                    💡 Как пользоваться умными виджетами
                  </h3>
                  <Icon 
                    name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                    className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                  />
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3">
                  <AlertDescription className="text-blue-800">
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>Прогресс-бар загруженности</strong> показывает, насколько занят член семьи</li>
                      <li>• <strong>Метрики</strong>: 📋 активные задачи, ✅ завершено сегодня, 📅 события, 🏆 достижения</li>
                      <li>• <strong>Кнопка "+ Задача"</strong> позволяет быстро назначить задание</li>
                      <li>• <strong>Настроить виджеты</strong> — выберите, что отображать на карточках</li>
                      <li>• Нажмите на карточку для открытия полного профиля</li>
                    </ul>
                  </AlertDescription>
                </CollapsibleContent>
              </div>
            </div>
          </Alert>
        </Collapsible>
        
        <VirtualizedList
          items={members}
          estimateSize={180}
          overscan={3}
          renderItem={(member, index) => (
            <div className="px-2 mb-4">
              <MemberCard 
                member={member} 
                index={index} 
                onClick={() => onMemberClick(member)}
                tasks={tasks}
                events={events}
                onAssignTask={onAssignTask}
              />
            </div>
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end mb-2">
        <WidgetSettingsDialog />
      </div>
      
      <Collapsible open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
        <Alert className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-blue-900 text-base">
                  💡 Как пользоваться умными виджетами
                </h3>
                <Icon 
                  name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <AlertDescription className="text-blue-800">
                  <ul className="space-y-1 text-sm">
                    <li>• <strong>Прогресс-бар загруженности</strong> показывает, насколько занят член семьи</li>
                    <li>• <strong>Метрики</strong>: 📋 активные задачи, ✅ завершено сегодня, 📅 события, 🏆 достижения</li>
                    <li>• <strong>Кнопка "+ Задача"</strong> позволяет быстро назначить задание</li>
                    <li>• <strong>Настроить виджеты</strong> — выберите, что отображать на карточках</li>
                    <li>• Нажмите на карточку для открытия полного профиля</li>
                  </ul>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {members.map((member, index) => (
          <MemberCard 
            key={member.id}
            member={member} 
            index={index} 
            onClick={() => onMemberClick(member)}
            tasks={tasks}
            events={events}
            onAssignTask={onAssignTask}
          />
        ))}
        <AddMemberCard />
      </div>
    </div>
  );
}