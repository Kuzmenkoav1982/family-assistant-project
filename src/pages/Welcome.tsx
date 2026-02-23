import { useState, useEffect } from 'react';
import WelcomeHeader from '@/components/welcome/WelcomeHeader';
import WelcomeHero from '@/components/welcome/WelcomeHero';
import WelcomePromo from '@/components/welcome/WelcomePromo';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';

const openTelegramSupport = () => {
  window.open('https://t.me/Nasha7iya', '_blank');
};

export default function Welcome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <WelcomeHeader isLoggedIn={isLoggedIn} />
      
      <div className="max-w-7xl mx-auto px-4">
        <WelcomeHero isLoggedIn={isLoggedIn} />
        <WelcomePromo />
        <WelcomeFooter openTelegramSupport={openTelegramSupport} />
      </div>
    </div>
  );
}