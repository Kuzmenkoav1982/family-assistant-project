import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import SettingsDropdown from '@/components/SettingsDropdown';
import FamilyMemberSwitcher from '@/components/FamilyMemberSwitcher';
import { type LanguageCode } from '@/translations';
import { type ThemeType } from '@/types/family.types';

const APP_VERSION = '1.2.0';

interface TopBarProps {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onMenuClick?: () => void;
  currentLanguage: LanguageCode;
  currentTheme: ThemeType;
  onLogout: () => void;
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  onResetDemo: () => void;
  currentUserId: string;
  onUserChange: (userId: string) => void;
  familyMembers: any[];
  familyName?: string;
  familyLogo?: string;
}

export default function TopBar({
  isVisible,
  onVisibilityChange,
  onMenuClick,
  currentLanguage,
  currentTheme,
  onLogout,
  onLanguageChange,
  onThemeChange,
  onResetDemo,
  currentUserId,
  onUserChange,
  familyMembers,
  familyName = 'Наша семья',
  familyLogo = 'https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png'
}: TopBarProps) {
  const navigate = useNavigate();

  console.log('🚀 App Version:', APP_VERSION);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="h-9 w-9 p-0 md:hidden"
              title="Меню"
            >
              <Icon name="Menu" size={18} />
            </Button>
          )}
          <img 
            src={familyLogo} 
            alt={familyName}
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
            {familyName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <FamilyMemberSwitcher
            currentUserId={currentUserId}
            onUserChange={onUserChange}
            familyMembers={familyMembers}
          />
          <SettingsDropdown
            currentLanguage={currentLanguage}
            currentTheme={currentTheme}
            onLogout={onLogout}
            onLanguageChange={onLanguageChange}
            onThemeChange={onThemeChange}
            onResetDemo={onResetDemo}
          />
        </div>
      </div>

      <button
        onClick={() => onVisibilityChange(!isVisible)}
        className={`fixed left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-gray-900/90 hover:bg-white dark:hover:bg-gray-900 shadow-md rounded-b-lg px-4 py-2 transition-all duration-300 ${
          isVisible ? 'top-[52px]' : 'top-0'
        }`}
      >
        <Icon 
          name={isVisible ? 'ChevronUp' : 'ChevronDown'} 
          size={20} 
          className="text-gray-600 dark:text-gray-400" 
        />
      </button>
    </div>
  );
}