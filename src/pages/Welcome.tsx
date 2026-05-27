import { useState, useEffect, lazy, Suspense } from 'react';
import SEOHead from '@/components/SEOHead';
import WelcomeHeader from '@/components/welcome/WelcomeHeader';
import WelcomeHero from '@/components/welcome/WelcomeHero';
import LazySection from '@/components/welcome/LazySection';

// Все секции ниже первого экрана — лениво, чтобы разгрузить основной поток
// на этапе LCP. Каждая секция оборачивается в LazySection (IntersectionObserver),
// поэтому её JS подтягивается только при приближении к viewport.
const WelcomeFamilyOS = lazy(() => import('@/components/welcome/WelcomeFamilyOS'));
const WelcomeProblems = lazy(() => import('@/components/welcome/WelcomeProblems'));
const WelcomeForWhom = lazy(() => import('@/components/welcome/WelcomeForWhom'));
const WelcomeReviews = lazy(() => import('@/components/welcome/WelcomeReviews'));
const WelcomeEcosystem = lazy(() => import('@/components/welcome/WelcomeEcosystem'));
const WelcomeDomovoy = lazy(() => import('@/components/welcome/WelcomeDomovoy'));
const WelcomeDomovoyAI = lazy(() => import('@/components/welcome/WelcomeDomovoyAI'));
const WelcomeVideo = lazy(() => import('@/components/welcome/WelcomeVideo'));
const WelcomeDeveloper = lazy(() => import('@/components/welcome/WelcomeDeveloper'));
const WelcomePWA = lazy(() => import('@/components/welcome/WelcomePWA'));
const WelcomeSecurity = lazy(() => import('@/components/welcome/WelcomeSecurity'));
const WelcomeHowToStart = lazy(() => import('@/components/welcome/WelcomeHowToStart'));
const WelcomeFAQ = lazy(() => import('@/components/welcome/WelcomeFAQ'));
const WelcomePromo = lazy(() => import('@/components/welcome/WelcomePromo'));
const WelcomeCTA = lazy(() => import('@/components/welcome/WelcomeCTA'));
const WelcomeFooter = lazy(() => import('@/components/welcome/WelcomeFooter'));

const openTelegramSupport = () => {
  window.open('https://t.me/Nasha7iya', '_blank');
};

export default function Welcome() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);

    // Аналитику посещения откладываем чтобы не блокировать основной поток
    const send = () => {
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
    };
    if ('requestIdleCallback' in window) {
      (window as Window & typeof globalThis).requestIdleCallback(send, { timeout: 3000 });
    } else {
      setTimeout(send, 1500);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Приложение для семьи – мобильное приложение для семейного планирования дел, бесплатная версия"
        description="Семейное приложение для планирования дел. Удобный сервис для планирования ✔️здоровье, питание, бюджет, развитие детей ✔️AI-помощник и Яндекс Алиса. Список дел и покупок 📱 Скачайте бесплатно для 4 пользователей. Работает на смартфоне, планшете и компьютере. Для 0+."
        path="/"
      />

      {/* Над фолдом — статично, для быстрого LCP */}
      <WelcomeHeader isLoggedIn={isLoggedIn} />
      <WelcomeHero isLoggedIn={isLoggedIn} />

      {/* Всё ниже первого экрана — лениво, по IntersectionObserver */}
      <Suspense fallback={null}>
        <LazySection minHeight={500}>
          <WelcomeFamilyOS />
        </LazySection>

        <LazySection minHeight={400}>
          <WelcomeProblems />
        </LazySection>

        <LazySection minHeight={400}>
          <div className="max-w-7xl mx-auto px-4">
            <WelcomeForWhom />
          </div>
        </LazySection>

        <LazySection minHeight={400}>
          <WelcomeReviews />
        </LazySection>

        <LazySection minHeight={400}>
          <WelcomeEcosystem />
        </LazySection>

        <LazySection minHeight={500}>
          <WelcomeDomovoy />
        </LazySection>

        <LazySection minHeight={500}>
          <WelcomeDomovoyAI />
        </LazySection>

        <LazySection minHeight={400}>
          <WelcomeVideo />
        </LazySection>

        <LazySection minHeight={300}>
          <WelcomeDeveloper />
        </LazySection>

        <LazySection minHeight={400}>
          <WelcomePWA />
        </LazySection>

        <LazySection minHeight={400}>
          <WelcomeSecurity />
        </LazySection>

        <LazySection minHeight={400}>
          <WelcomeHowToStart isLoggedIn={isLoggedIn} />
        </LazySection>

        <LazySection minHeight={500}>
          <WelcomeFAQ />
        </LazySection>

        <LazySection minHeight={300}>
          <WelcomePromo />
        </LazySection>

        <LazySection minHeight={300}>
          <div className="max-w-7xl mx-auto px-4">
            <WelcomeCTA isLoggedIn={isLoggedIn} />
            <WelcomeFooter openTelegramSupport={openTelegramSupport} />
          </div>
        </LazySection>
      </Suspense>
    </div>
  );
}
