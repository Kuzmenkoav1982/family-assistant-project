import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SettingsMenu from '@/components/SettingsMenu';
import SettingsDropdown from '@/components/SettingsDropdown';
import FamilyMemberSwitcher from '@/components/FamilyMemberSwitcher';
import { useNavigate } from 'react-router-dom';
import type { LanguageCode, ThemeType } from '@/types/family.types';
import { themes } from '@/config/themes';
import { languageOptions } from '@/translations';

interface TopBarProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
  autoHide: boolean;
  toggleAutoHide: () => void;
  topPanelSections: string[];
  authToken: string | null;
  currentUser: any;
  handleLogout: () => void;
  handleLogoutLocal: () => void;
  showLanguageSelector: boolean;
  setShowLanguageSelector: (show: boolean) => void;
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  currentLanguage: LanguageCode;
  handleLanguageChange: (lang: string) => void;
  currentTheme: ThemeType;
  handleThemeChange: (theme: ThemeType) => void;
  t: (key: string) => string;
  setShowTopPanelSettings: (show: boolean) => void;
}

export function TopBar({
  isVisible,
  setIsVisible,
  autoHide,
  toggleAutoHide,
  topPanelSections,
  authToken,
  currentUser,
  handleLogout,
  handleLogoutLocal,
  showLanguageSelector,
  setShowLanguageSelector,
  showThemeSelector,
  setShowThemeSelector,
  currentLanguage,
  handleLanguageChange,
  currentTheme,
  handleThemeChange,
  t,
  setShowTopPanelSettings
}: TopBarProps) {
  const navigate = useNavigate();

  return (
    <>
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onMouseEnter={() => autoHide && setIsVisible(true)}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowTopPanelSettings(true)}
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 px-3 border border-gray-300"
              title="Настройки верхней панели"
            >
              <Icon name="SlidersHorizontal" size={18} />
            </Button>
            
            {topPanelSections.includes('voting') && (
              <Button
                onClick={() => navigate('/voting')}
                variant="default"
                size="sm"
                className="h-9 gap-1.5 px-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                title="Голосования"
              >
                <Icon name="Vote" size={18} />
                <span className="text-sm hidden md:inline">Голосования</span>
              </Button>
            )}
            
            {topPanelSections.includes('auth') && (
              authToken ? (
                <Button
                  onClick={handleLogout}
                  variant="default"
                  size="sm"
                  className="h-9 gap-1.5 px-3 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
                  title="Выйти из аккаунта"
                >
                  <Icon name="LogOut" size={18} />
                  <span className="text-sm hidden md:inline">Выйти</span>
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  variant="default"
                  size="sm"
                  className="h-9 gap-1.5 px-3 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600"
                  title="Войти через Яндекс ID"
                >
                  <Icon name="LogIn" size={18} />
                  <span className="text-sm hidden md:inline">Войти</span>
                </Button>
              )
            )}

            {topPanelSections.includes('reset') && !authToken && (
              <Button
                onClick={handleLogoutLocal}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Сбросить демо"
              >
                <Icon name="RotateCcw" size={18} />
                <span className="text-sm hidden md:inline">Сбросить</span>
              </Button>
            )}
            
            {topPanelSections.includes('settings') && <SettingsDropdown />}
            
            {topPanelSections.includes('presentation') && (
              <Button
                onClick={() => navigate('/presentation')}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Презентация"
              >
                <Icon name="FileText" size={18} />
                <span className="text-sm hidden md:inline">Презентация</span>
              </Button>
            )}
            

            
            {topPanelSections.includes('familySwitcher') && <FamilyMemberSwitcher />}
          </div>
          
          <div className="flex items-center gap-2 language-selector theme-selector relative">
            {topPanelSections.includes('language') && (
              <Button
                onClick={() => {
                  setShowLanguageSelector(!showLanguageSelector);
                  setShowThemeSelector(false);
                }}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Выбор языка"
              >
                <Icon name="Languages" size={18} />
                <span className="text-sm hidden md:inline">Язык</span>
              </Button>
            )}
            
            {topPanelSections.includes('style') && (
              <Button
                onClick={() => {
                  setShowThemeSelector(!showThemeSelector);
                  setShowLanguageSelector(false);
                }}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Выбор стиля"
              >
                <Icon name="Palette" size={18} />
                <span className="text-sm hidden md:inline">Стиль</span>
              </Button>
            )}
            
            {topPanelSections.includes('appearance') && (
              <Button
                onClick={() => setShowTopPanelSettings(true)}
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 px-3"
                title="Настройки оформления"
              >
                <Icon name="Moon" size={18} />
                <span className="text-sm hidden md:inline">Вид</span>
              </Button>
            )}
            
            <Button
              onClick={toggleAutoHide}
              variant="ghost"
              size="sm"
              className={`h-9 gap-1.5 px-3 ${autoHide ? 'text-blue-600' : 'text-gray-400'}`}
              title={autoHide ? 'Автоскрытие включено' : 'Автоскрытие выключено'}
            >
              <Icon name={autoHide ? 'EyeOff' : 'Eye'} size={18} />
              <span className="text-sm hidden md:inline">{autoHide ? 'Скрыто' : 'Видимо'}</span>
            </Button>
            
            {showLanguageSelector && (
              <Card className="language-selector absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] border-2 border-blue-300 shadow-2xl animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Languages" size={20} />
                    {t('selectLanguage')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {languageOptions.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-lg ${
                        currentLanguage === lang.code 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="font-medium">{lang.name}</span>
                        </div>
                        {currentLanguage === lang.code && (
                          <Icon name="Check" className="text-blue-600" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
            
            {showThemeSelector && (
              <Card className="theme-selector absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] max-h-[70vh] border-2 border-indigo-300 shadow-2xl animate-fade-in overflow-hidden flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon name="Palette" size={20} />
                    {t('selectStyle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 overflow-y-auto flex-1">
                  {(Object.keys(themes) as ThemeType[]).map((themeKey) => {
                    const theme = themes[themeKey];
                    return (
                      <button
                        key={themeKey}
                        onClick={() => handleThemeChange(themeKey)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                          currentTheme === themeKey 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold">{theme.name}</h4>
                          {currentTheme === themeKey && (
                            <Icon name="Check" className="text-indigo-600" size={20} />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{theme.description}</p>
                        <Badge variant="outline" className="text-xs">{theme.ageRange}</Badge>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-40 bg-white/90 hover:bg-white shadow-md rounded-b-lg px-4 py-1 transition-all duration-300"
        style={{ top: isVisible ? '52px' : '0px' }}
      >
        <Icon name={isVisible ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-gray-600" />
      </button>
    </>
  );
}