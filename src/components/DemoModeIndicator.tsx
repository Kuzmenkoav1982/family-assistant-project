import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const HIDDEN_PAGES = ['/welcome', '/login', '/register', '/reset-password'];

export function DemoModeIndicator() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const checkDemoMode = () => {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        localStorage.removeItem('isDemoMode');
        localStorage.removeItem('demoStartTime');
        setIsDemoMode(false);
        return;
      }
      
      const demoMode = localStorage.getItem('isDemoMode') === 'true';
      setIsDemoMode(demoMode);
    };

    checkDemoMode();
    window.addEventListener('storage', checkDemoMode);
    return () => window.removeEventListener('storage', checkDemoMode);
  }, []);

  if (!isDemoMode) return null;
  if (HIDDEN_PAGES.includes(location.pathname)) return null;

  return (
    <div className="fixed top-20 right-4 z-40 animate-fade-in">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-lg p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Icon name="Eye" className="w-5 h-5" />
          <span className="text-sm font-medium">Гостевой просмотр</span>
        </div>
        <Button
          size="sm"
          onClick={() => navigate('/register')}
          className="bg-white text-orange-600 hover:bg-gray-100 h-7 text-xs font-semibold"
        >
          Создать аккаунт
        </Button>
      </div>
    </div>
  );
}