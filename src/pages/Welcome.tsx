import { useState, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import WelcomeHeader from '@/components/welcome/WelcomeHeader';
import WelcomeHero from '@/components/welcome/WelcomeHero';
import WelcomeForWhom from '@/components/welcome/WelcomeForWhom';
import WelcomeProblems from '@/components/welcome/WelcomeProblems';
import WelcomePromo from '@/components/welcome/WelcomePromo';
import WelcomePWA from '@/components/welcome/WelcomePWA';
import WelcomeCTA from '@/components/welcome/WelcomeCTA';
import WelcomeFooter from '@/components/welcome/WelcomeFooter';
import WelcomeVideo from '@/components/welcome/WelcomeVideo';
import WelcomeDeveloper from '@/components/welcome/WelcomeDeveloper';
import WelcomeFAQ from '@/components/welcome/WelcomeFAQ';
import WelcomeDomovoy from '@/components/welcome/WelcomeDomovoy';
import WelcomeEcosystem from '@/components/welcome/WelcomeEcosystem';
import WelcomeDomovoyAI from '@/components/welcome/WelcomeDomovoyAI';
import WelcomeReviews from '@/components/welcome/WelcomeReviews';
import WelcomeSecurity from '@/components/welcome/WelcomeSecurity';
import WelcomeHowToStart from '@/components/welcome/WelcomeHowToStart';
import WelcomeFamilyOS from '@/components/welcome/WelcomeFamilyOS';

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
        title="Наша Семья — Семейная операционка. ОС вашей семьи: дела, отношения, здоровье, деньги и смыслы в одном месте"
        description="Семейная ОС — не просто приложение для задач. Здесь живут профили семьи, отношения, договорённости, здоровье, бюджет и смыслы. От сбора фактов — к общей картине семьи, её осмыслению, договорённостям и ежедневному исполнению. 5 циклов жизни семьи в одном продукте. AI-помощник «Домовой», календарь, GPS-маячок, медкарты, списки покупок, меню. Бесплатно для семьи без ограничений по участникам — оплата только за AI-функции. Данные хранятся в России. Работает в браузере, на смартфоне и планшете. Для 0+."
        path="/"
      />
      <WelcomeHeader isLoggedIn={isLoggedIn} />

      <WelcomeHero isLoggedIn={isLoggedIn} />

      <WelcomeFamilyOS />

      <WelcomeProblems />

      <div className="max-w-7xl mx-auto px-4">
        <WelcomeForWhom />
      </div>

      <WelcomeReviews />

      <WelcomeEcosystem />

      <WelcomeDomovoy />

      <WelcomeDomovoyAI />

      <WelcomeVideo />

      <WelcomeDeveloper />

      <WelcomePWA />

      <WelcomeSecurity />

      <WelcomeHowToStart isLoggedIn={isLoggedIn} />

      <WelcomeFAQ />

      <WelcomePromo />

      <div className="max-w-7xl mx-auto px-4">
        <WelcomeCTA isLoggedIn={isLoggedIn} />
        <WelcomeFooter openTelegramSupport={openTelegramSupport} />
      </div>
    </div>
  );
}