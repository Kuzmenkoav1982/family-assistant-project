import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CSI_SECTIONS } from './csiSections';

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

export function useCsiMeetingMode() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMeetingMode = searchParams.get('mode') === 'meeting';

  const [activeId, setActiveId] = useState<string>(CSI_SECTIONS[0].id);

  useEffect(() => {
    const handleScroll = () => {
      const probeY = SCROLL_OFFSET + 60;
      for (let i = CSI_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(CSI_SECTIONS[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY) {
          if (CSI_SECTIONS[i].id !== activeId) {
            setActiveId(CSI_SECTIONS[i].id);
          }
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeId]);

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
    CSI_SECTIONS.findIndex((s) => s.id === activeId)
  );

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(CSI_SECTIONS.length - 1, index));
    scrollToSection(CSI_SECTIONS[clamped].id);
  }, []);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const exitMeeting = useCallback(() => {
    const hash = `#${activeId}`;
    navigate(`/strategy/csi${hash}`, { replace: true });
  }, [activeId, navigate]);

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
          goTo(CSI_SECTIONS.length - 1);
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    if (!CSI_SECTIONS.find((s) => s.id === hash)) return;
    const t = setTimeout(() => scrollToSection(hash), 80);
    return () => clearTimeout(t);
  }, []);

  return {
    isMeetingMode,
    activeId,
    activeIndex,
    total: CSI_SECTIONS.length,
    goNext,
    goPrev,
    goTo,
    exitMeeting,
  };
}
