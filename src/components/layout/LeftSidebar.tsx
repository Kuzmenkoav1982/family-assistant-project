import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface SectionItem {
  id: string;
  icon: string;
  label: string;
  ready?: boolean;
}

interface LeftSidebarProps {
  isVisible: boolean;
  autoHide: boolean;
  activeSection: string;
  sections: string[];
  menuSections: SectionItem[];
  showLeftPanelSettings: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onSectionChange: (sectionId: string) => void;
  onLeftPanelSettingsToggle: (show: boolean) => void;
}

export default function LeftSidebar({
  isVisible,
  autoHide,
  activeSection,
  sections,
  menuSections,
  showLeftPanelSettings,
  onVisibilityChange,
  onSectionChange,
  onLeftPanelSettingsToggle
}: LeftSidebarProps) {
  const navigate = useNavigate();
  const visibleSections = menuSections.filter(s => sections.includes(s.id));

  return (
    <div
      className={`fixed left-0 top-16 bottom-0 z-40 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
      onMouseEnter={() => autoHide && onVisibilityChange(true)}
    >
      <div className="h-full w-64 flex flex-col p-4">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
            alt="Наша семья"
            className="h-12 w-12 object-contain"
          />
          <h2 className="text-lg font-bold text-gray-700 flex-1">Разделы</h2>
          <Button
            onClick={() => onLeftPanelSettingsToggle(!showLeftPanelSettings)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="Настроить разделы"
          >
            <Icon name="Settings2" size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {visibleSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                if (section.id === 'shopping') {
                  navigate('/shopping');
                } else if (section.id === 'meals') {
                  navigate('/meals');
                } else if (section.id === 'development') {
                  navigate('/development');
                } else {
                  onSectionChange(section.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Icon name={section.icon} size={20} />
              <span className="font-medium text-sm">{section.label}</span>
              {section.ready === false && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Скоро
                </Badge>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Семейный Органайзер v1.0
          </p>
        </div>
      </div>
    </div>
  );
}