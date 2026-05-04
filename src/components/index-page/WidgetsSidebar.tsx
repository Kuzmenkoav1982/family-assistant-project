import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { TasksWidget } from '@/components/TasksWidget';
import { ShoppingWidget } from '@/components/widgets/ShoppingWidget';
import { VotingWidget } from '@/components/widgets/VotingWidget';
import { NutritionWidget } from '@/components/widgets/NutritionWidget';
import { WeeklyMenuWidget } from '@/components/widgets/WeeklyMenuWidget';
import { MedicationsWidget } from '@/components/widgets/MedicationsWidget';
import { CalendarWidget } from '@/components/widgets/CalendarWidget';
import FamilyMembersGrid from '@/components/FamilyMembersGrid';
import { useNavigate } from 'react-router-dom';
import type { CalendarEvent, FamilyMember } from '@/types/family.types';

interface Task {
  id: string;
  assignee_id?: string;
  completed: boolean;
}

interface WidgetsSidebarProps {
  isWidgetEnabled: (widgetId: string) => boolean;
  setShowWidgetSettings: (v: boolean) => void;
  calendarEvents: CalendarEvent[];
  familyMembers?: FamilyMember[];
  tasks?: Task[];
}

export default function WidgetsSidebar({
  isWidgetEnabled,
  setShowWidgetSettings,
  calendarEvents,
  familyMembers = [],
  tasks = [],
}: WidgetsSidebarProps) {
  const navigate = useNavigate();
  return (
    <div className="space-y-4 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Виджеты</h3>
        <Button
          onClick={() => setShowWidgetSettings(true)}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground h-7 text-xs"
        >
          <Icon name="SlidersHorizontal" size={14} />
          Настроить
        </Button>
      </div>
      
      {isWidgetEnabled('family-members') && familyMembers.length > 0 && (
        <FamilyMembersGrid
          members={familyMembers}
          onMemberClick={(member) => navigate(`/member/${member.id}`)}
          tasks={tasks}
          events={calendarEvents}
        />
      )}

      {isWidgetEnabled('calendar') && (
        <CalendarWidget calendarEvents={calendarEvents || []} />
      )}

      {isWidgetEnabled('tasks') && (
        <TasksWidget />
      )}

      {isWidgetEnabled('shopping') && (
        <ShoppingWidget />
      )}

      {isWidgetEnabled('voting') && (
        <VotingWidget />
      )}

      {isWidgetEnabled('nutrition') && (
        <NutritionWidget />
      )}

      {isWidgetEnabled('weekly-menu') && (
        <WeeklyMenuWidget />
      )}

      {isWidgetEnabled('medications') && (
        <MedicationsWidget />
      )}
    </div>
  );
}