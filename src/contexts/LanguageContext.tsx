import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations, getTranslation, LanguageCode } from '@/translations';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof typeof translations.ru) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'app_language';

function getInitialLanguage(): LanguageCode {
  // SSR-safe: при prerender localStorage отсутствует. Возвращаем дефолт,
  // а реальное значение подтянем в useEffect на клиенте.
  if (typeof localStorage === 'undefined') return 'ru';
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in translations) {
      return saved as LanguageCode;
    }
  } catch {
    // ignore
  }
  return 'ru';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getInitialLanguage);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    document.documentElement.lang = lang;
    // Уведомляем другие вкладки и компоненты о смене языка
    window.dispatchEvent(new CustomEvent('app:language-changed', { detail: { lang } }));
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Слушаем изменения в других вкладках
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in translations) {
        setLanguageState(e.newValue as LanguageCode);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const t = useCallback(
    (key: keyof typeof translations.ru) => getTranslation(language, key),
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback вне провайдера: чтение из localStorage напрямую
    const lang = getInitialLanguage();
    return {
      language: lang,
      setLanguage: (l) => {
        try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
      },
      t: (key) => getTranslation(lang, key),
    };
  }
  return ctx;
}