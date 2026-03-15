import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const COOKIE_CONSENT_KEY = "cookie_consent_accepted";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-4xl p-4">
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="Cookie" size={20} fallback="Shield" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Мы используем файлы cookie и Яндекс.Метрику для улучшения работы сайта.
              Продолжая пользоваться сайтом, вы соглашаетесь с{" "}
              <Link
                to="/privacy-policy"
                className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
              >
                политикой конфиденциальности
              </Link>.
            </p>
          </div>
          <button
            onClick={handleAccept}
            className="flex-shrink-0 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-colors whitespace-nowrap"
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
