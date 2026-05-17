import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STRATEGY_SECTIONS } from './sections';

const SCROLL_OFFSET = 100;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  if (target.isContentEditable) return true;
  return false;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.pageYOffset - 20;
  window.scrollTo({ top, behavior: 'smooth' });
}

export function useMeetingMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMeetingMode = searchParams.get('mode') === 'meeting';

  const [activeId, setActiveId] = useState<string>(STRATEGY_SECTIONS[0].id);

  // IntersectionObserver — определяем текущую активную секцию (работает в обоих режимах)
  useEffect(() => {
    const handleScroll = () => {
      const probeY = SCROLL_OFFSET + 60;
      for (let i = STRATEGY_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(STRATEGY_SECTIONS[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY) {
          if (STRATEGY_SECTIONS[i].id !== activeId) {
            setActiveId(STRATEGY_SECTIONS[i].id);
          }
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeId]);

  // Сохраняем активную секцию в hash, без перезаписи истории
  useEffect(() => {
    if (!activeId) return;
    if (window.location.hash !== `#${activeId}`) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#${activeId}`
      );
    }
  }, [activeId]);

  const activeIndex = Math.max(
    0,
    STRATEGY_SECTIONS.findIndex((s) => s.id === activeId)
  );

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(
      0,
      Math.min(STRATEGY_SECTIONS.length - 1, index)
    );
    scrollToSection(STRATEGY_SECTIONS[clamped].id);
  }, []);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const exitMeeting = useCallback(() => {
    const hash = `#${activeId}`;
    navigate(`/strategy${hash}`, { replace: true });
  }, [activeId, navigate]);

  // Клавиатурная навигация — только в meeting mode и только вне инпутов
  useEffect(() => {
    if (!isMeetingMode) return;

    const handleKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ': {
          e.preventDefault();
          goNext();
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp': {
          e.preventDefault();
          goPrev();
          break;
        }
        case 'Home': {
          e.preventDefault();
          goTo(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          goTo(STRATEGY_SECTIONS.length - 1);
          break;
        }
        case 'Escape': {
          e.preventDefault();
          exitMeeting();
          break;
        }
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMeetingMode, goNext, goPrev, goTo, exitMeeting]);

  // Если зашли с hash — после монтирования скроллим к нужной секции
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    if (!STRATEGY_SECTIONS.find((s) => s.id === hash)) return;
    const t = setTimeout(() => scrollToSection(hash), 80);
    return () => clearTimeout(t);
  }, []);

  return {
    isMeetingMode,
    activeId,
    activeIndex,
    total: STRATEGY_SECTIONS.length,
    goNext,
    goPrev,
    goTo,
    exitMeeting,
  };
}
