import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';

/**
 * Простой хук — есть ли в URL флаг ?ops=1 (служебный режим).
 * Используется и в самой плашке, и в страницах, которые хотят
 * показать дополнительные служебные блоки только для оператора.
 */
export function useOpsMode(): boolean {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get('ops') === '1';
}

interface HubReturnLinkProps {
  /**
   * Куда встраивается:
   *  - 'inline' — мини-чип внутри уже существующего индикатора (без позиционирования)
   *  - 'corner' — самостоятельная маленькая плашка в правом верхнем углу
   */
  variant?: 'inline' | 'corner';
  /**
   * Тон чипа inline-варианта. По умолчанию dark (для тёмных индикаторов).
   */
  tone?: 'dark' | 'light';
  /**
   * Если индикатор уже стоит сверху-справа, плашке нужно встать ниже.
   * topOffset задаёт top в rem для варианта 'corner'.
   */
  topOffset?: string;
}

/**
 * Возврат в /strategy/hub.
 * Рендерится ТОЛЬКО при ?ops=1 (или &ops=1) в URL.
 * Скрывается из экспорта (no-print + .printing).
 */
export default function HubReturnLink({
  variant = 'inline',
  tone = 'dark',
  topOffset = '4rem',
}: HubReturnLinkProps) {
  const location = useLocation();
  const [isPrinting, setIsPrinting] = useState(false);

  // Слушаем тот же print-event, что используют captureSlides
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ active: boolean }>;
      setIsPrinting(!!ce.detail?.active);
    };
    window.addEventListener('presentation:print-mode', handler as EventListener);
    return () =>
      window.removeEventListener('presentation:print-mode', handler as EventListener);
  }, []);

  const params = new URLSearchParams(location.search);
  const isOps = params.get('ops') === '1';

  if (!isOps) return null;
  if (isPrinting) return null;

  const from = `${location.pathname}${location.search}${location.hash}`;
  const hubHref = `/strategy/hub?from=${encodeURIComponent(from)}`;

  if (variant === 'inline') {
    const inlineCls =
      tone === 'light'
        ? 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
        : 'border-white/20 bg-white/10 hover:bg-white/20 text-white/90';
    return (
      <a
        href={hubHref}
        data-hub-return
        className={`no-print inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-full border transition ${inlineCls}`}
        title="К операторской панели"
      >
        <Icon name="LayoutGrid" size={11} />
        Hub
      </a>
    );
  }

  return (
    <a
      href={hubHref}
      data-hub-return
      className="no-print fixed right-3 z-40 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-slate-300 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm backdrop-blur transition"
      style={{ top: topOffset }}
      title="К операторской панели"
    >
      <Icon name="LayoutGrid" size={12} />
      Hub
    </a>
  );
}