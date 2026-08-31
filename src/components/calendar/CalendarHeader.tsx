import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';

type ViewMode = 'month' | 'week';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  categoryFilter: string;
  memberFilter: string;
  isInstructionOpen: boolean;
  onNavigateBack: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
  onToday: () => void;
  onCategoryFilterChange: (category: string) => void;
  onMemberFilterChange: (memberId: string) => void;
  onInstructionToggle: (open: boolean) => void;
  onAddEvent: () => void;
}

const categories = [
  { id: 'all', label: 'Все', color: 'bg-gray-100 text-gray-700' },
  { id: 'personal', label: 'Личное', color: 'bg-blue-100 text-blue-700' },
  { id: 'family', label: 'Семья', color: 'bg-green-100 text-green-700' },
  { id: 'work', label: 'Работа', color: 'bg-purple-100 text-purple-700' },
  { id: 'health', label: 'Здоровье', color: 'bg-red-100 text-red-700' },
  { id: 'education', label: 'Образование', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'leisure', label: 'Досуг', color: 'bg-pink-100 text-pink-700' }
];

export function CalendarHeader({
  currentDate,
  viewMode,
  categoryFilter,
  memberFilter,
  isInstructionOpen,
  onNavigateBack,
  onViewModeChange,
  onPreviousPeriod,
  onNextPeriod,
  onToday,
  onCategoryFilterChange,
  onMemberFilterChange,
  onInstructionToggle,
  onAddEvent
}: CalendarHeaderProps) {
  const { members } = useFamilyMembersContext();
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={onNavigateBack} variant="outline" className="gap-2">
          <Icon name="ArrowLeft" size={16} />
          Назад
        </Button>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('month')}
          >
            <Icon name="Calendar" size={16} className="mr-1" />
            Месяц
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('week')}
          >
            <Icon name="CalendarDays" size={16} className="mr-1" />
            Неделя
          </Button>
        </div>
      </div>

      <Collapsible open={isInstructionOpen} onOpenChange={onInstructionToggle}>
        <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Icon name="Info" className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <CollapsibleTrigger className="flex items-center justify-between w-full text-left group">
                <h3 className="font-semibold text-blue-900 text-lg">
                  О календаре
                </h3>
                <Icon 
                  name={isInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  className="h-5 w-5 text-blue-600 transition-transform group-hover:scale-110" 
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3 space-y-3">
                <AlertDescription className="text-blue-800">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">📅 Возможности календаря</p>
                      <ul className="text-sm space-y-1 list-disc list-inside">
                        <li>Создавайте события с категориями и напоминаниями</li>
                        <li>Указывайте время начала и время окончания события</li>
                        <li>Настраивайте повторяющиеся события (ежедневно, еженедельно, ежемесячно, ежегодно)</li>
                        <li>Отслеживайте задачи и цели семьи</li>
                        <li>Фильтруйте события по категориям</li>
                        <li>События дня показываются по времени начала — от раннего к позднему</li>
                        <li>Переключайтесь между месячным и недельным просмотром</li>
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </CollapsibleContent>
            </div>
          </div>
        </Alert>
      </Collapsible>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 justify-center sm:justify-start overflow-x-auto pb-1">
          <Button variant="outline" size="sm" onClick={onPreviousPeriod}>
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold min-w-[160px] sm:min-w-[200px] text-center whitespace-nowrap">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <Button variant="outline" size="sm" onClick={onNextPeriod}>
            <Icon name="ChevronRight" size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={onToday} className="whitespace-nowrap">
            Сегодня
          </Button>
        </div>
        <Button onClick={onAddEvent} className="gap-2 w-full sm:w-auto shrink-0">
          <Icon name="Plus" size={16} />
          Добавить событие
        </Button>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Категории:</p>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Badge
                key={cat.id}
                className={`cursor-pointer transition-all ${
                  categoryFilter === cat.id ? cat.color + ' border-2 border-current' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => onCategoryFilterChange(cat.id)}
              >
                {cat.label}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Для кого:</p>
          <div className="flex gap-2 flex-wrap">
            <Badge
              className={`cursor-pointer transition-all ${
                memberFilter === 'all' ? 'bg-indigo-100 text-indigo-700 border-2 border-current' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => onMemberFilterChange('all')}
            >
              Вся семья
            </Badge>
            {members.map(member => (
              <Badge
                key={member.id}
                className={`cursor-pointer transition-all ${
                  memberFilter === member.id ? 'bg-indigo-100 text-indigo-700 border-2 border-current' : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => onMemberFilterChange(member.id)}
              >
                {member.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}