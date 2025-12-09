import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldShow = isVisible || (!autoHide) || isHovered;

  const handleSectionToggle = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      onSectionsChange(selectedSections.filter(s => s !== sectionId));
    } else {
      onSectionsChange([...selectedSections, sectionId]);
    }
  };

  const displaySections = availableSections.filter(s => selectedSections.includes(s.id));

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform duration-300 z-40 ${
          shouldShow ? 'translate-y-0' : 'translate-y-full'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="text-white hover:bg-white/20"
              title="Настройки панели"
            >
              <Icon name="Settings" size={20} />
            </Button>

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
                onClick={() => navigate('/recipes')}
                className="text-white hover:bg-white/20 whitespace-nowrap"
                title="Рецепты"
              >
                <Icon name="ChefHat" size={18} />
                <span className="ml-1 text-xs hidden sm:inline">Рецепты</span>
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
                onClick={() => navigate('/analytics')}
                className="text-white hover:bg-white/20 whitespace-nowrap"
                title="Аналитика"
              >
                <Icon name="BarChart3" size={18} />
                <span className="ml-1 text-xs hidden sm:inline">Аналитика</span>
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
                  <Icon name={section.icon as any} size={18} />
                  <span className="ml-1 text-xs hidden sm:inline">{section.label}</span>
                </Button>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onKuzyaClick}
              className="text-white hover:bg-white/20"
              title="Помощь и поддержка"
            >
              <Icon name="MessageCircle" size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVisibilityChange(!isVisible)}
              className="text-white hover:bg-white/20"
              title={isVisible ? "Скрыть панель" : "Показать панель"}
            >
              <Icon name={isVisible ? "ChevronDown" : "ChevronUp"} size={20} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки нижней панели</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoHide"
                checked={autoHide}
                onCheckedChange={(checked) => onAutoHideChange(checked as boolean)}
              />
              <Label htmlFor="autoHide">Автоскрытие панели</Label>
            </div>

            <div className="space-y-2">
              <Label>Разделы на панели:</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableSections.map(section => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={selectedSections.includes(section.id)}
                      onCheckedChange={() => handleSectionToggle(section.id)}
                    />
                    <Label htmlFor={`section-${section.id}`} className="flex items-center gap-2">
                      <Icon name={section.icon as any} size={16} />
                      {section.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {autoHide && !isVisible && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 bg-blue-600/50 rounded-t-lg cursor-pointer z-50"
          onMouseEnter={() => setIsHovered(true)}
          title="Показать панель"
        />
      )}
    </>
  );
}