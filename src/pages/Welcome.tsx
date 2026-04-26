import { useState, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import WelcomeHeader from '@/components/welcome/WelcomeHeader';
import WelcomeHero from '@/components/welcome/WelcomeHero';
import WelcomeForWhom from '@/components/welcome/WelcomeForWhom';
import WelcomeProblems from '@/components/welcome/WelcomeProblems';
import WelcomePromo from '@/components/welcome/WelcomePromo';
import WelcomeAI from '@/components/welcome/WelcomeAI';
import WelcomePWA from '@/components/welcome/WelcomePWA';
import WelcomeCTA from '@/components/welcome/WelcomeCTA';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import WelcomeVideo from '@/components/welcome/WelcomeVideo';
import WelcomeDeveloper from '@/components/welcome/WelcomeDeveloper';
import WelcomeFAQ from '@/components/welcome/WelcomeFAQ';
import WelcomeDomovoy from '@/components/welcome/WelcomeDomovoy';

const openTelegramSupport = () => {
  window.open('https://t.me/Nasha7iya', '_blank');
};

export default function Welcome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    let sid = sessionStorage.getItem('welcome_sid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem('welcome_sid', sid);
    }
    fetch('https://functions.poehali.dev/fe19c08e-4cc1-4aa8-a1af-b03678b7ba22', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'track_page_view',
        page: 'welcome',
        session_id: sid,
        user_agent: navigator.userAgent,
      }),
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Приложение для семьи – мобильное приложение для семейного планирования дел, бесплатная версия"
        description="Семейное приложение для планирования дел. Удобный сервис для планирования здоровья, питания, бюджета, развития детей. AI-помощник и Яндекс Алиса. Список дел и покупок. Скачайте бесплатно для 4 пользователей. Работает на смартфоне, планшете и компьютере. Для 0+."
        path="/"
      />
      <WelcomeHeader isLoggedIn={isLoggedIn} />

      <WelcomeHero isLoggedIn={isLoggedIn} />

      <WelcomeVideo />

      <WelcomeDomovoy />

      <div className="max-w-7xl mx-auto px-4">
        <WelcomeForWhom />
      </div>

      <WelcomeProblems />

      <WelcomePromo />

      <WelcomeAI />

      <WelcomePWA />

      <WelcomeFAQ />

      <WelcomeDeveloper />

      <div className="max-w-7xl mx-auto px-4">
        <WelcomeCTA isLoggedIn={isLoggedIn} />
        <WelcomeFooter openTelegramSupport={openTelegramSupport} />
      </div>
    </div>
  );
}