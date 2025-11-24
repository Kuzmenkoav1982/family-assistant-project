import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { getTranslation, type LanguageCode } from '@/translations';
import SettingsMenu from '@/components/SettingsMenu';
import KuzyaHelperDialog from '@/components/KuzyaHelperDialog';
import { useState } from 'react';
import type { FamilyMember } from '@/types/family.types';

interface TopBarProps {
  isVisible: boolean;
  autoHide: boolean;
  currentUser: FamilyMember | undefined;
  currentLanguage: LanguageCode;
  showLanguageSelector: boolean;
  showThemeSelector: boolean;
  currentTheme: string;
  syncing: boolean;
  showTopPanelSettings: boolean;
  onLogout: () => void;
  onVisibilityChange: (visible: boolean) => void;
  onLanguageSelectorToggle: (show: boolean) => void;
  onThemeSelectorToggle: (show: boolean) => void;
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  onTopPanelSettingsToggle: (show: boolean) => void;
}

export default function TopBar({
  isVisible,
  autoHide,
  currentUser,
  currentLanguage,
  showLanguageSelector,
  showThemeSelector,
  currentTheme,
  syncing,
  showTopPanelSettings,
  onLogout,
  onVisibilityChange,
  onLanguageSelectorToggle,
  onThemeSelectorToggle,
  onLanguageChange,
  onThemeChange,
  onTopPanelSettingsToggle
}: TopBarProps) {
  const navigate = useNavigate();
  const [showKuzyaDialog, setShowKuzyaDialog] = useState(false);
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);

  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const themes = [
    { id: 'young', name: 'Молодёжный', icon: '🎨', description: 'Яркий и современный' },
    { id: 'middle', name: 'Деловой', icon: '💼', description: 'Элегантный и строгий' },
    { id: 'senior', name: 'Комфортный', icon: '🏡', description: 'Крупный шрифт, спокойные цвета' },
    { id: 'apple', name: 'Apple', icon: '🍎', description: 'В стиле Apple' }
  ];

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      onMouseEnter={() => autoHide && onVisibilityChange(true)}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img 
            src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
            alt="Наша семья"
            className="h-10 w-10 object-contain"
            style={{ border: 'none', outline: 'none' }}
          />
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Выход"
          >
            <Icon name="LogOut" size={18} />
          </Button>
          
          <SettingsMenu />
          
          <Button
            onClick={() => navigate('/instructions')}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Инструкции"
          >
            <Icon name="BookOpen" size={18} />
          </Button>
          
          <Button
            onClick={() => setShowKuzyaDialog(true)}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Помощь и поддержка"
          >
            <Icon name="HelpCircle" size={18} />
          </Button>
          
          <Button
            onClick={() => navigate('/psychologist')}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Семейный психолог ИИ"
          >
            <Icon name="Brain" size={18} />
          </Button>
          
          <Button
            onClick={() => navigate('/rules')}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Семейные правила"
          >
            <Icon name="Scale" size={18} />
          </Button>
          
          {currentUser && (
            <Button
              onClick={() => navigate(`/member/${currentUser.id}`)}
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0"
              title="Мой профиль"
            >
              <Icon name="UserCircle" size={18} />
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2 language-selector theme-selector relative">
          <Button
            onClick={() => onLanguageSelectorToggle(!showLanguageSelector)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-9"
            title={t('changeLanguage')}
          >
            <Icon name="Languages" size={18} />
            <span className="text-xs font-medium hidden sm:inline">
              {languages.find(l => l.code === currentLanguage)?.flag}
            </span>
          </Button>

          {showLanguageSelector && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-2xl border-2 border-blue-200 p-2 w-64 z-[60] animate-fade-in">
              <div className="flex items-center justify-between mb-2 pb-2 border-b">
                <span className="text-sm font-bold text-gray-700">Выберите язык</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onLanguageSelectorToggle(false)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <Icon name="Check" size={16} className="ml-auto text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => onThemeSelectorToggle(!showThemeSelector)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 h-9"
            title="Сменить тему"
          >
            <Icon name="Palette" size={18} />
          </Button>

          {showThemeSelector && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-2xl border-2 border-indigo-200 p-3 w-80 z-[60] animate-fade-in">
              <div className="flex items-center justify-between mb-3 pb-2 border-b">
                <span className="text-sm font-bold text-gray-700">Выберите тему</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onThemeSelectorToggle(false)}
                >
                  <Icon name="X" size={14} />
                </Button>
              </div>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id)}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg transition-all border-2 ${
                      currentTheme === theme.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-3xl">{theme.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-sm mb-1">{theme.name}</div>
                      <div className="text-xs text-gray-600">{theme.description}</div>
                    </div>
                    {currentTheme === theme.id && (
                      <Icon name="Check" size={18} className="text-indigo-600 mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={() => onTopPanelSettingsToggle(!showTopPanelSettings)}
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Настройки панели"
          >
            <Icon name="Settings2" size={18} />
          </Button>

          {syncing && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Icon name="Loader" className="animate-spin" size={12} />
              Синхронизация...
            </Badge>
          )}
        </div>
      </div>
      
      <KuzyaHelperDialog 
        open={showKuzyaDialog} 
        onOpenChange={setShowKuzyaDialog}
      />
    </div>
  );
}