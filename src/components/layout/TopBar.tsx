import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { getTranslation, type LanguageCode } from '@/translations';
import SettingsMenu from '@/components/SettingsMenu';

interface TopBarProps {
  isVisible: boolean;
  currentLanguage: LanguageCode;
  currentTheme: string;
  onLogout: () => void;
  onVisibilityChange: (visible: boolean) => void;
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  onResetDemo: () => void;
}

export default function TopBar({
  isVisible,
  currentLanguage,
  currentTheme,
  onLogout,
  onVisibilityChange,
  onLanguageChange,
  onThemeChange,
  onResetDemo
}: TopBarProps) {
  const navigate = useNavigate();
  const t = (key: keyof typeof import('@/translations').translations.ru) => getTranslation(currentLanguage, key);

  const authToken = localStorage.getItem('authToken');
  const isAuthenticated = !!authToken;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <img 
            src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
            alt="Наша семья"
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-9 w-9 p-0"
              title="Выход"
            >
              <Icon name="LogOut" size={18} />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/welcome')}
              className="h-9 w-9 p-0"
              title="Вход"
            >
              <Icon name="LogIn" size={18} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            title="Переключатель семьи"
          >
            <Icon name="Users" size={18} />
          </Button>

          <SettingsMenu />
        </div>
      </div>


    </div>
  );
}