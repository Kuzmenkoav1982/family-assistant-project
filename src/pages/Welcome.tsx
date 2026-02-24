import { useState, useEffect } from 'react';
import WelcomeHeader from '@/components/welcome/WelcomeHeader';
import WelcomeHero from '@/components/welcome/WelcomeHero';
import WelcomeForWhom from '@/components/welcome/WelcomeForWhom';
import WelcomeProblems from '@/components/welcome/WelcomeProblems';
import WelcomePromo from '@/components/welcome/WelcomePromo';
import WelcomeAI from '@/components/welcome/WelcomeAI';
import WelcomePWA from '@/components/welcome/WelcomePWA';
import WelcomeCTA from '@/components/welcome/WelcomeCTA';
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

      <WelcomeHero isLoggedIn={isLoggedIn} />

      <div className="max-w-7xl mx-auto px-4">
        <WelcomeForWhom />
      </div>

      <WelcomeProblems />

      <WelcomePromo />

      <WelcomeAI />

      <WelcomePWA />

      <div className="max-w-7xl mx-auto px-4">
        <WelcomeCTA isLoggedIn={isLoggedIn} />
        <WelcomeFooter openTelegramSupport={openTelegramSupport} />
      </div>
    </div>
  );
}
