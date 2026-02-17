import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

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
  onSectionsChange
}: BottomBarProps) {
  const navigate = useNavigate();

  const displaySections = availableSections.filter(s => selectedSections.includes(s.id));

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform duration-300 z-40 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-2">
          <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto">
            <Button
              variant={activeSection === 'home' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                onSectionChange('family');
                navigate('/');
              }}
              className="text-white hover:bg-white/20"
              title="Домой"
            >
              <Icon name="Home" size={20} />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/development')}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title="Развитие"
            >
              <Icon name="Brain" size={18} />
              <span className="ml-1 text-xs hidden sm:inline">Развитие</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/nutrition')}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title="Питание"
            >
              <Icon name="Apple" size={18} />
              <span className="ml-1 text-xs hidden sm:inline">Питание</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/shopping')}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title="Покупки"
            >
              <Icon name="ShoppingCart" size={18} />
              <span className="ml-1 text-xs hidden sm:inline">Покупки</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/leisure-hub')}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title="Путешествия"
            >
              <Icon name="Plane" size={18} />
              <span className="ml-1 text-xs hidden sm:inline">Путешествия</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/calendar')}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title="Календарь"
            >
              <Icon name="Calendar" size={18} />
              <span className="ml-1 text-xs hidden sm:inline">Календарь</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/children')}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title="Дети"
            >
              <Icon name="Baby" size={18} />
              <span className="ml-1 text-xs hidden sm:inline">Дети</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/planning-hub')}
              className="text-white hover:bg-white/20 whitespace-nowrap"
              title="Планирование"
            >
              <Icon name="Target" size={18} />
              <span className="ml-1 text-xs hidden sm:inline">Планирование</span>
            </Button>

            {displaySections.filter(section => 
              !['development', 'life-road', 'nutrition', 'shopping', 'recipes', 'calendar', 'children', 'analytics', 'meals'].includes(section.id)
            ).map(section => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => {
                  if (section.id === 'shopping') {
                    navigate('/shopping');
                  } else if (section.id === 'calendar') {
                    navigate('/calendar');
                  } else if (section.id === 'children') {
                    navigate('/children');
                  } else if (section.id === 'analytics') {
                    navigate('/analytics');
                  } else if (section.id === 'recipes') {
                    navigate('/recipes');
                  } else {
                    onSectionChange(section.id);
                  }
                }}
                className="text-white hover:bg-white/20 whitespace-nowrap"
                title={section.label}
              >
                <Icon name={section.icon} size={18} />
                <span className="ml-1 text-xs hidden sm:inline">{section.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onVisibilityChange(!isVisible)}
        className={`fixed left-1/2 -translate-x-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-t-lg px-4 py-2 transition-all duration-300 ${
          isVisible ? 'bottom-[52px]' : 'bottom-0'
        }`}
      >
        <Icon 
          name={isVisible ? 'ChevronDown' : 'ChevronUp'} 
          size={20} 
          className="text-gray-600" 
        />
      </button>
    </>
  );
}