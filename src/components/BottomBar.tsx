import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getTranslation, type LanguageCode } from '@/translations';
import SettingsMenu from '@/components/SettingsMenu';

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
  currentLanguage: LanguageCode;
  currentTheme: string;
  onLogout: () => void;
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  onResetDemo: () => void;
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
  onKuzyaClick,
  currentLanguage,
  currentTheme,
  onLogout,
  onLanguageChange,
  onThemeChange,
  onResetDemo
}: BottomBarProps) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };
  
  const openJivoChat = () => {
    // @ts-ignore - Jivo глобальная переменная
    if (window.jivo_api) {
      // @ts-ignore
      window.jivo_api.open();
    }
  };
  
  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  const displaySections = availableSections.filter(s => selectedSections.includes(s.id));

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-transform duration-300 z-40 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Icon name="Menu" size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 mb-2">
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                  <Icon name="Settings" size={16} className="mr-2" />
                  <span>Настройки семьи</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => {
                  const newLang = currentLanguage === 'ru' ? 'en' : 'ru';
                  onLanguageChange(newLang);
                }}>
                  <Icon name="Globe" size={16} className="mr-2" />
                  <span>Язык: {currentLanguage.toUpperCase()}</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => {
                  const themes = ['default', 'purple', 'ocean', 'sunset', 'forest', 'rose'];
                  const currentIndex = themes.indexOf(currentTheme);
                  const nextIndex = (currentIndex + 1) % themes.length;
                  onThemeChange(themes[nextIndex]);
                }}>
                  <Icon name="Palette" size={16} className="mr-2" />
                  <span>Стиль: {currentTheme}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={toggleDarkMode}>
                  <Icon name={darkMode ? "Sun" : "Moon"} size={16} className="mr-2" />
                  <span>Тёмная тема</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={openJivoChat}>
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  <span>Онлайн поддержка</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate('/feedback')}>
                  <Icon name="MessageSquareText" size={16} className="mr-2" />
                  <span>Отзывы</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate('/instructions')}>
                  <Icon name="BookOpen" size={16} className="mr-2" />
                  <span>Инструкции</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate('/presentation')}>
                  <Icon name="Play" size={16} className="mr-2" />
                  <span>Презентация</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate('/family-invite')}>
                  <Icon name="UserPlus" size={16} className="mr-2" />
                  <span>Приглашения и подписка</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Icon name="UserCircle" size={16} className="mr-2" />
                  <span>Мой профиль</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={onResetDemo}>
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  <span>Сбросить демо</span>
                </DropdownMenuItem>

                {isAuthenticated ? (
                  <DropdownMenuItem onClick={onLogout}>
                    <Icon name="LogOut" size={16} className="mr-2" />
                    <span>Выход</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => navigate('/welcome')}>
                    <Icon name="LogIn" size={16} className="mr-2" />
                    <span>Вход</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
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
      
      <SettingsMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}