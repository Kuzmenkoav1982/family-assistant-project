import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface BottomBarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  autoHide: boolean;
  onAutoHideChange: (value: boolean) => void;
  isVisible: boolean;
  onVisibilityChange: (value: boolean) => void;
  availableSections: Array<{ id: string; label: string; icon: string }>;
  selectedSections: string[];
  onSectionsChange: (sections: string[]) => void;
  onKuzyaClick?: () => void;
}

export default function BottomBar({
  activeSection,
  onSectionChange,
  autoHide,
  onAutoHideChange,
  isVisible,
  onVisibilityChange,
  availableSections,
  selectedSections,
  onSectionsChange,
  onKuzyaClick
}: BottomBarProps) {
  const displaySections = availableSections.filter(s => selectedSections.includes(s.id));

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform duration-300 z-40 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {displaySections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange(section.id)}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title={section.label}
            >
              <Icon name={section.icon as any} size={18} />
              <span className="ml-1 text-xs hidden sm:inline">{section.label}</span>
            </Button>
          ))}
          
          {onKuzyaClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onKuzyaClick}
              className="text-white hover:bg-white/20"
              title="Помощник Кузя"
            >
              <Icon name="Bot" size={20} />
            </Button>
          )}
        </div>
      </div>

      <button
        onClick={() => onVisibilityChange(!isVisible)}
        className={`fixed left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-t-lg px-4 py-2 transition-all duration-300 ${
          isVisible ? 'bottom-[52px]' : 'bottom-0'
        }`}
        title={isVisible ? 'Скрыть панель' : 'Показать панель'}
      >
        <Icon 
          name={isVisible ? 'ChevronDown' : 'ChevronUp'} 
          size={20} 
          className="text-gray-600 dark:text-gray-400" 
        />
      </button>
    </div>
  );
}
