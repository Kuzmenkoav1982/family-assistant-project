import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  variant?: 'default' | 'community' | 'code' | 'dev';
  route?: string;
}

interface NavigationGroup {
  color: string;
  items: NavigationItem[];
}

interface ScrollNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationGroups: NavigationGroup[] = [
  {
    color: 'blue',
    items: [
      { id: 'family', label: 'Семья', icon: 'Users' },
      { id: 'cohesion', label: 'Сплочённость', icon: 'TrendingUp' },
      { id: 'children', label: 'Дети', icon: 'Baby' },
      { id: 'values', label: 'Ценности', icon: 'Heart' },
      { id: 'traditions', label: 'Традиции', icon: 'Sparkles' },
      { id: 'code', label: 'Семейный кодекс', icon: 'Scale', variant: 'code', route: '/family-code' },
    ],
  },
  {
    color: 'green',
    items: [
      { id: 'goals', label: 'Цели', icon: 'Target' },
      { id: 'tasks', label: 'Задачи', icon: 'CheckSquare' },
      { id: 'calendar', label: 'Календарь', icon: 'Calendar' },
      { id: 'shopping', label: 'Покупки', icon: 'ShoppingCart' },
    ],
  },
  {
    color: 'purple',
    items: [
      { id: 'chat', label: 'Чат', icon: 'MessageCircle' },
      { id: 'blog', label: 'Блог', icon: 'BookOpen' },
      { id: 'community', label: 'Сообщество', icon: 'Users', variant: 'community', route: '/community' },
    ],
  },
  {
    color: 'orange',
    items: [
      { id: 'album', label: 'Альбом', icon: 'Image' },
      { id: 'tree', label: 'Древо', icon: 'GitBranch' },
    ],
  },
  {
    color: 'yellow',
    items: [
      { id: 'garage', label: 'Гараж', icon: 'Car', variant: 'dev', route: '/garage' },
      { id: 'health', label: 'Здоровье', icon: 'Heart', variant: 'dev', route: '/health' },
      { id: 'finance', label: 'Финансы', icon: 'Wallet', variant: 'dev', route: '/finance' },
      { id: 'education', label: 'Образование', icon: 'GraduationCap', variant: 'dev', route: '/education' },
      { id: 'travel', label: 'Путешествия', icon: 'Plane', variant: 'dev', route: '/travel' },
      { id: 'pets', label: 'Питомцы', icon: 'PawPrint', variant: 'dev', route: '/pets' },
    ],
  },
];

export default function ScrollNavigation({ activeSection, onSectionChange }: ScrollNavigationProps) {
  const navigate = useNavigate();

  const getGroupStyles = (color: string) => {
    const styles = {
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      purple: 'bg-purple-50 border-purple-200',
      orange: 'bg-orange-50 border-orange-200',
      yellow: 'bg-yellow-50 border-yellow-200',
    };
    return styles[color as keyof typeof styles] || styles.blue;
  };

  const getButtonStyles = (variant?: string, isActive?: boolean) => {
    if (variant === 'dev') {
      return 'border-amber-300 bg-amber-50 hover:bg-amber-100';
    }
    if (variant === 'community') {
      return 'border-purple-300 bg-purple-100 hover:bg-purple-200';
    }
    if (variant === 'code') {
      return 'border-purple-300 bg-purple-100 hover:bg-purple-200';
    }
    if (isActive) {
      return 'bg-primary text-primary-foreground';
    }
    return '';
  };

  const handleItemClick = (item: NavigationItem) => {
    if (item.route) {
      navigate(item.route);
    } else {
      onSectionChange(item.id);
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 backdrop-blur-sm border-b border-purple-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {navigationGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className={`flex gap-2 px-3 py-2 rounded-lg border ${getGroupStyles(group.color)} flex-shrink-0`}
            >
              {group.items.map((item) => {
                const isActive = activeSection === item.id;
                const buttonContent = (
                  <Button
                    onClick={() => handleItemClick(item)}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className={`text-xs whitespace-nowrap ${getButtonStyles(item.variant, isActive)}`}
                  >
                    <Icon name={item.icon} className="mr-1" size={14} />
                    {item.label}
                    {item.variant === 'dev' && (
                      <Badge className="ml-2 bg-amber-500 text-white text-[10px] px-1 py-0">DEV</Badge>
                    )}
                  </Button>
                );

                if (item.variant === 'dev') {
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">🚧 Раздел в разработке</p>
                        <p className="text-xs text-muted-foreground">Нажмите чтобы узнать подробнее</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.id}>{buttonContent}</div>;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
