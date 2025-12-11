import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const APP_VERSION = '1.2.0';

interface TopBarProps {
  isVisible: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onMenuClick?: () => void;
}

export default function TopBar({
  isVisible,
  onVisibilityChange,
  onMenuClick
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
            src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
            alt="Наша семья"
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/')}
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