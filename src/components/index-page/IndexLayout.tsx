import TopBar from '@/components/layout/TopBar';
import Sidebar from '@/components/layout/Sidebar';
import Icon from '@/components/ui/icon';
import type { LanguageCode } from '@/translations';
import type { ThemeType } from '@/types/family.types';

interface IndexLayoutProps {
  isTopBarVisible: boolean;
  isLeftMenuVisible: boolean;
  showMenuHint?: boolean;
  currentLanguage: LanguageCode;
  currentTheme: ThemeType;
  themeClasses: {
    background: string;
    baseFont: string;
  };
  onTopBarVisibilityChange: (visible: boolean) => void;
  onLeftMenuVisibilityChange: (visible: boolean) => void;
  onLogout: () => void;
  onLanguageChange: (lang: LanguageCode) => void;
  onThemeChange: (theme: ThemeType) => void;
  onResetDemo: () => void;
  children: React.ReactNode;
}

export function IndexLayout({
  isTopBarVisible,
  isLeftMenuVisible,
  showMenuHint,
  currentLanguage,
  currentTheme,
  themeClasses,
  onTopBarVisibilityChange,
  onLeftMenuVisibilityChange,
  onLogout,
  onLanguageChange,
  onThemeChange,
  onResetDemo,
  children,
}: IndexLayoutProps) {
  return (
    <div
      className={`min-h-screen ${themeClasses.background} ${themeClasses.baseFont} transition-all duration-700 ease-in-out ${
        currentTheme === 'mono' ? 'theme-mono' : ''
      } ${currentTheme === '1' ? 'theme-1' : ''}`}
    >
      <TopBar
        isVisible={isTopBarVisible}
        currentLanguage={currentLanguage}
        currentTheme={currentTheme}
        onLogout={onLogout}
        onVisibilityChange={onTopBarVisibilityChange}
        onLanguageChange={onLanguageChange}
        onThemeChange={onThemeChange}
        onResetDemo={onResetDemo}
        showMenuHint={showMenuHint}
        onMenuClick={() => onLeftMenuVisibilityChange(true)}
      />

      {!isTopBarVisible && (
        <button
          onClick={() => onTopBarVisibilityChange(true)}
          className="fixed left-1/2 -translate-x-1/2 top-0 z-[60] bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-b-lg px-3 py-1 transition-all duration-300"
          title="Показать верхнюю панель"
        >
          <Icon name="ChevronDown" size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      )}

      <Sidebar isVisible={isLeftMenuVisible} onVisibilityChange={onLeftMenuVisibilityChange} />

      {children}
    </div>
  );
}