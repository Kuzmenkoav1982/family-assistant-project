import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LazyImage } from '@/components/ui/LazyImage';
import Icon from '@/components/ui/icon';
import { VirtualizedList } from '@/components/VirtualizedList';
import { calculateMemberWorkload, getWorkloadDescription } from '@/utils/memberWorkload';
import { loadWidgetSettings } from '@/types/widgetSettings';
import type { FamilyMember } from '@/types/family.types';
import { useState } from 'react';

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
  const metrics = calculateMemberWorkload(member, tasks, events);
  const workloadDesc = getWorkloadDescription(metrics);
  
  return (
  <Card
    className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-102 animate-fade-in group"
    style={{ animationDelay: `${index * 0.1}s` }}
    onClick={onClick}
  >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative">
                  {member.photoUrl ? (
                    <LazyImage 
                      src={member.photoUrl} 
                      alt={member.name}
                      className="w-20 h-20 rounded-full object-cover border-3 border-purple-300 group-hover:border-purple-500 transition-colors"
                      wrapperClassName="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-4xl border-3 border-purple-300 group-hover:border-purple-500 transition-colors">
                      {member.avatar}
                    </div>
                  )}
                  {member.moodStatus && (
                    <div className="absolute -bottom-1 -right-1 text-2xl bg-white rounded-full border-2 border-white" title={member.moodStatus.label}>
                      {member.moodStatus.emoji}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1 truncate group-hover:text-purple-600 transition-colors">{member.name}</h3>
                  
                  {(widgetSettings.showAge && member.age) || (widgetSettings.showRole && member.role) ? (
                    <p className="text-sm text-muted-foreground mb-2">
                      {widgetSettings.showAge && member.age && `${member.age} лет`}
                      {widgetSettings.showAge && member.age && widgetSettings.showRole && member.role && ' • '}
                      {widgetSettings.showRole && member.role}
                    </p>
                  ) : null}
                  
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-xs bg-purple-50">
                      <Icon name="Award" size={10} className="mr-1" />
                      Ур. {member.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-orange-50">
                      <Icon name="Star" size={10} className="mr-1" />
                      {member.points}
                    </Badge>
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
              
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-4 gap-2">
                {widgetSettings.showActiveTasks && (
                  <div className="text-center" title="Активных задач">
                    <div className="flex items-center justify-center gap-1">
                      <Icon name="ListTodo" size={14} className="text-blue-500" />
                      <span className="text-sm font-bold text-gray-900">{metrics.activeTasks}</span>
                    </div>
                  </div>
                )}
                {widgetSettings.showCompletedToday && (
                  <div className="text-center" title="Завершено сегодня">
                    <div className="flex items-center justify-center gap-1">
                      <Icon name="CheckCircle2" size={14} className="text-green-500" />
                      <span className="text-sm font-bold text-gray-900">{metrics.completedToday}</span>
                    </div>
                  </div>
                )}
                {widgetSettings.showTodayEvents && (
                  <div className="text-center" title="События на сегодня">
                    <div className="flex items-center justify-center gap-1">
                      <Icon name="Calendar" size={14} className="text-purple-500" />
                      <span className="text-sm font-bold text-gray-900">{metrics.todayEvents}</span>
                    </div>
                  </div>
                )}
                {widgetSettings.showWeekAchievements && (
                  <div className="text-center" title="Достижений за неделю">
                    <div className="flex items-center justify-center gap-1">
                      <Icon name="Trophy" size={14} className="text-yellow-500" />
                      <span className="text-sm font-bold text-gray-900">{metrics.weekAchievements}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {widgetSettings.showQuickActions && onAssignTask && (
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
  );
};

export function FamilyMembersGrid({ members, onMemberClick, tasks = [], events = [], onAssignTask }: FamilyMembersGridProps) {
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}