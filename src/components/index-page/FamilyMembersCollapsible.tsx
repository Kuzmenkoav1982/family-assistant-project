import type { ComponentProps } from 'react';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import type { FamilyMember } from '@/types/family.types';

/**
 * FamilyMembersCollapsible — раскрывающийся блок «Члены семьи» на вкладке
 * "family" главной страницы (Index.tsx).
 *
 * Stage refactor Index B3 — controlled presentational extract.
 * Исходный inline-блок жил в Index.tsx внутри `<TabsContent value="family">`.
 *
 * Правила выноса:
 *  - НЕ controlled→uncontrolled: `open` приходит сверху, `onOpenChange` —
 *    тоже. `familyMembersOpen` живёт в Index.tsx как было.
 *  - НЕ добавлено новых хуков (useState/useEffect/useMemo). Это чистая
 *    presentational-обёртка над JSX, который раньше был inline.
 *  - Все навигационные действия — наружу, в callbacks (onOpenHub,
 *    onMemberClick). Реальный `navigate(...)` остаётся в Index.tsx, чтобы
 *    компонент не зависел от react-router.
 *  - Поведение 1-в-1: те же тексты, иконки, классы, ChevronUp/Down,
 *    те же plural-формы, та же кнопка "Открыть в Семья →".
 */

// Достаём типы tasks/events напрямую из props FamilyMembersGrid, чтобы не
// дублировать локальные интерфейсы (Task/CalendarEvent объявлены приватно
// внутри FamilyMembersGrid).
type FamilyMembersGridTasks = ComponentProps<typeof FamilyMembersGrid>['tasks'];
type FamilyMembersGridEvents = ComponentProps<typeof FamilyMembersGrid>['events'];

interface FamilyMembersCollapsibleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyMembers: FamilyMember[];
  tasks: FamilyMembersGridTasks;
  calendarEvents: FamilyMembersGridEvents;
  onOpenHub: () => void;
  onMemberClick: (member: FamilyMember) => void;
}

export default function FamilyMembersCollapsible({
  open,
  onOpenChange,
  familyMembers,
  tasks,
  calendarEvents,
  onOpenHub,
  onMemberClick,
}: FamilyMembersCollapsibleProps) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                <Icon name="Users" className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm">Члены семьи</div>
                <div className="text-xs text-muted-foreground">
                  {familyMembers.length > 0
                    ? `${familyMembers.length} ${familyMembers.length === 1 ? 'человек' : 'участников'} · подробности в Семья`
                    : 'Никого не добавлено'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenHub(); }}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Открыть в Семья →
              </button>
              <Icon
                name={open ? 'ChevronUp' : 'ChevronDown'}
                className="h-4 w-4 text-muted-foreground"
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <FamilyMembersGrid
              members={familyMembers}
              onMemberClick={onMemberClick}
              tasks={tasks}
              events={calendarEvents}
            />
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
