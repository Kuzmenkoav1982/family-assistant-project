import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    <div className="fixed bottom-[72px] right-3 z-40 animate-fade-in">
      <button
        onClick={() => navigate('/register')}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/95 hover:bg-orange-600 backdrop-blur-sm text-white rounded-full shadow-lg transition-all text-xs font-semibold"
      >
        <Icon name="UserPlus" className="w-3 h-3 flex-shrink-0" />
        Создать аккаунт
      </button>
    </div>
  );
}