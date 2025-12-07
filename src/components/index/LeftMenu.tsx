import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

interface MenuSection {
  id: string;
  icon: string;
  label: string;
  ready?: boolean;
}

interface InDevelopmentSection {
  id: string;
  icon: string;
  label: string;
  votes?: { up: number; down: number };
}

interface LeftMenuProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  autoHide: boolean;
  toggleAutoHide: () => void;
  menuSections: MenuSection[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  currentUser: any;
  showInDevelopment: boolean;
  setShowInDevelopment: (show: boolean) => void;
  inDevelopmentSections: InDevelopmentSection[];
  setShowKuzyaDialog: (show: boolean) => void;
  setShowFamilyInvite: (show: boolean) => void;
  setShowLeftPanelSettings: (show: boolean) => void;
}

export function LeftMenu({
  isVisible,
  setIsVisible,
  autoHide,
  toggleAutoHide,
  menuSections,
  activeSection,
  setActiveSection,
  currentUser,
  showInDevelopment,
  setShowInDevelopment,
  inDevelopmentSections,
  setShowKuzyaDialog,
  setShowFamilyInvite,
  setShowLeftPanelSettings
}: LeftMenuProps) {
  const navigate = useNavigate();

  return (
    <>
      <div 
        className={`fixed left-0 top-20 z-40 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
          isVisible ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseEnter={() => autoHide && setIsVisible(true)}
        style={{ maxWidth: '280px', width: '100%' }}
      >
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Icon name="Menu" size={16} />
            Разделы
          </h3>
          <div className="flex items-center gap-1">
            <Button
              onClick={() => setShowLeftPanelSettings(true)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              title="Настройки панели"
            >
              <Icon name="Settings" size={14} />
            </Button>
            <Button
              onClick={toggleAutoHide}
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${autoHide ? 'text-blue-600' : 'text-gray-400'}`}
              title={autoHide ? 'Автоскрытие включено' : 'Автоскрытие выключено'}
            >
              <Icon name={autoHide ? 'EyeOff' : 'Eye'} size={14} />
            </Button>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
            >
              <Icon name="X" size={14} />
            </Button>
          </div>
        </div>
        <div className="p-3 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-2 mb-3 pb-3 border-b border-gray-200">
            <button
              onClick={() => setShowKuzyaDialog(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-orange-50 border-2 border-orange-200 hover:border-orange-300 transition-all"
            >
              <img 
                src="https://cdn.poehali.dev/files/c1b4ec81-b6c7-4a35-ac49-cc9849f6843f.png"
                alt="Кузя"
                className="w-12 h-12 object-cover object-top rounded-full border-2 border-orange-300"
              />
              <div className="flex-1 text-left">
                <div className="text-sm font-bold text-orange-700">Помощь и поддержка</div>
                <div className="text-xs text-gray-600">Кузя поможет вам</div>
              </div>
              <Icon name="ChevronRight" size={16} className="text-orange-400" />
            </button>
          </div>
          
          {menuSections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => {
                console.log('Left menu clicked:', section.id);
                if (section.id === 'psychologist') {
                  navigate('/psychologist');
                } else if (section.id === 'rules-section') {
                  navigate('/rules');
                } else if (section.id === 'shopping') {
                  navigate('/shopping');
                } else if (section.id === 'calendar') {
                  navigate('/calendar');
                } else if (section.id === 'children') {
                  navigate('/children');
                } else if (section.id === 'development') {
                  navigate('/development');
                } else if (section.id === 'trips') {
                  navigate('/trips');
                } else if (section.id === 'recipes') {
                  navigate('/recipes');
                } else if (section.id === 'analytics') {
                  navigate('/analytics');
                } else if (section.id === 'voting') {
                  navigate('/voting');
                } else {
                  setActiveSection(section.id);
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all animate-fade-in ${
                activeSection === section.id 
                  ? 'bg-blue-100 text-blue-700 shadow-sm' 
                  : 'hover:bg-gray-100'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Icon name={section.icon as any} size={18} />
              <span className="text-sm font-medium">{section.label}</span>
              {section.ready === false && (
                <Badge variant="outline" className="ml-auto text-xs">В разработке</Badge>
              )}
            </button>
          ))}
          

        </div>
      </div>
      
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-r-lg py-4 px-2 transition-all duration-300"
        style={{ left: isVisible ? '280px' : '0px' }}
      >
        <Icon name={isVisible ? 'ChevronLeft' : 'ChevronRight'} size={20} className="text-gray-600" />
      </button>
    </>
  );
}