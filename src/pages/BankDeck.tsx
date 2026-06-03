import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import MeetingIndicator from '@/components/bank-deck/MeetingIndicator';
import HubReturnLink from '@/components/strategy-shared/HubReturnLink';
import { BANK_DECK_SECTIONS } from '@/components/bank-deck/sections';
import Slide01 from '@/components/bank-deck/Slide01';
import Slide02 from '@/components/bank-deck/Slide02';
import Slide03 from '@/components/bank-deck/Slide03';
import Slide04 from '@/components/bank-deck/Slide04';
import Slide05 from '@/components/bank-deck/Slide05';
import Slide06 from '@/components/bank-deck/Slide06';
import Slide07 from '@/components/bank-deck/Slide07';
import Slide08 from '@/components/bank-deck/Slide08';
import Slide09 from '@/components/bank-deck/Slide09';
import Slide10 from '@/components/bank-deck/Slide10';
import Slide11 from '@/components/bank-deck/Slide11';
import Slide12 from '@/components/bank-deck/Slide12';
import Slide13 from '@/components/bank-deck/Slide13';
import Slide14 from '@/components/bank-deck/Slide14';
import Slide15 from '@/components/bank-deck/Slide15';

// ─── Local meeting-mode hook (independent from strategy-v21) ─────────────────

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

function useBankDeckMeeting() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMeetingMode = searchParams.get('mode') === 'meeting';

  const [activeId, setActiveId] = useState<string>(BANK_DECK_SECTIONS[0].id);

  // IntersectionObserver — определяем текущую активную секцию
  useEffect(() => {
    const handleScroll = () => {
      const probeY = SCROLL_OFFSET + 60;
      for (let i = BANK_DECK_SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(BANK_DECK_SECTIONS[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY) {
          if (BANK_DECK_SECTIONS[i].id !== activeId) {
            setActiveId(BANK_DECK_SECTIONS[i].id);
          }
          return;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeId]);

  // Сохраняем активную секцию в hash
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
    BANK_DECK_SECTIONS.findIndex((s) => s.id === activeId)
  );

  const goTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(BANK_DECK_SECTIONS.length - 1, index));
    scrollToSection(BANK_DECK_SECTIONS[clamped].id);
  }, []);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const exitMeeting = useCallback(() => {
    navigate(`/bank-deck#${activeId}`, { replace: true });
  }, [activeId, navigate]);

  // Клавиатурная навигация — только в meeting mode
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
          goTo(BANK_DECK_SECTIONS.length - 1);
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

  // Скролл к hash при монтировании
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    if (!BANK_DECK_SECTIONS.find((s) => s.id === hash)) return;
    const t = setTimeout(() => scrollToSection(hash), 80);
    return () => clearTimeout(t);
  }, []);

  return {
    isMeetingMode,
    activeId,
    activeIndex,
    total: BANK_DECK_SECTIONS.length,
    goNext,
    goPrev,
    exitMeeting,
  };
}

// ─── Slide capture helper ─────────────────────────────────────────────────────

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('bank-deck-content');
  if (!container) return null;

  container.classList.add('printing');
  window.dispatchEvent(
    new CustomEvent('presentation:print-mode', { detail: { active: true } })
  );
  await new Promise((resolve) => setTimeout(resolve, 400));

  const slides = container.querySelectorAll('[data-pdf-slide]');
  if (slides.length === 0) {
    container.classList.remove('printing');
    window.dispatchEvent(
      new CustomEvent('presentation:print-mode', { detail: { active: false } })
    );
    return null;
  }

  const renderWidth = 1200;
  const canvases: HTMLCanvasElement[] = [];

  for (let i = 0; i < slides.length; i++) {
    onProgress(`Обработка ${i + 1} из ${slides.length}...`);
    const slide = slides[i] as HTMLElement;
    const canvas = await html2canvas(slide, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: null,
      windowWidth: renderWidth,
      imageTimeout: 0,
      removeContainer: true,
    });
    canvases.push(canvas);
  }

  container.classList.remove('printing');
  window.dispatchEvent(
    new CustomEvent('presentation:print-mode', { detail: { active: false } })
  );
  return { canvases, count: slides.length };
}

// ─── AnchorNav (local, uses BANK_DECK_SECTIONS) ───────────────────────────────

function BankAnchorNav({ activeId }: { activeId?: string }) {
  // Показываем все секции кроме первой (титул)
  const items = BANK_DECK_SECTIONS.slice(1);
  return (
    <div
      data-strategy-nav
      className="sticky top-14 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200 -mx-3 sm:-mx-6 px-3 sm:px-6 py-2 mb-6 relative"
    >
      <div
        className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pr-6"
        style={{ scrollPaddingRight: '1.5rem' }}
      >
        {items.map((it) => {
          const isActive = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={`shrink-0 whitespace-nowrap text-[11px] sm:text-sm font-medium px-2.5 sm:px-3 py-1.5 rounded-full transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {it.label}
            </a>
          );
        })}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-full w-6 bg-gradient-to-l from-white/85 to-transparent"
      />
    </div>
  );
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function BankDeck() {
  const {
    isMeetingMode,
    activeId,
    activeIndex,
    total,
    goNext,
    goPrev,
    exitMeeting,
  } = useBankDeckMeeting();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isPptxDownloading, setIsPptxDownloading] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');

  const downloadPDF = async () => {
    setIsDownloading(true);
    const loadingId = toast.loading('Готовлю PDF...');
    try {
      const result = await captureSlides((msg) => {
        setDownloadProgress(msg);
        toast.loading(msg, { id: loadingId });
      });
      if (!result) {
        toast.error('Не удалось найти слайды для PDF', { id: loadingId });
        return;
      }

      toast.loading('Формирую PDF...', { id: loadingId });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      for (let i = 0; i < result.canvases.length; i++) {
        const canvas = result.canvases[i];
        const imgAspect = canvas.width / canvas.height;
        let imgW = contentWidth;
        let imgH = imgW / imgAspect;

        if (imgH > contentHeight) {
          imgH = contentHeight;
          imgW = imgH * imgAspect;
        }

        const x = margin + (contentWidth - imgW) / 2;
        const y = margin + (contentHeight - imgH) / 2;

        if (i > 0) pdf.addPage();

        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          x,
          y,
          imgW,
          imgH,
          `slide-${i}`,
          'FAST'
        );

        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${i + 1} / ${result.count}`, pageWidth / 2, pageHeight - 5, {
          align: 'center',
        });
      }

      pdf.save('Банк-Детская-карта-Наша-Семья.pdf');
      toast.success('PDF готов!', { id: loadingId });
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      const msg = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toast.error(`Не удалось создать PDF: ${msg}`, { id: loadingId });
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  const downloadPPTX = async () => {
    setIsPptxDownloading(true);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;

      const result = await captureSlides(setPptxProgress);
      if (!result) return;

      setPptxProgress('Формирую PPTX...');

      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Наша Семья';
      pptx.company = 'ИП Кузьменко А.В.';
      pptx.subject = 'Детская карта × Наша семья — предложение для банка';
      pptx.title = 'Детская карта × Наша семья';

      const slideW = 10;
      const slideH = 5.625;
      const padding = 0.3;
      const maxW = slideW - padding * 2;
      const maxH = slideH - padding * 2;

      for (let i = 0; i < result.canvases.length; i++) {
        const canvas = result.canvases[i];
        const imgData = canvas.toDataURL('image/png');
        const imgAspect = canvas.width / canvas.height;

        let w = maxW;
        let h = w / imgAspect;

        if (h > maxH) {
          h = maxH;
          w = h * imgAspect;
        }

        const x = (slideW - w) / 2;
        const y = (slideH - h) / 2;

        const slide = pptx.addSlide();
        slide.background = { fill: 'FFFFFF' };
        slide.addImage({ data: imgData, x, y, w, h });

        slide.addText(`${i + 1} / ${result.count}`, {
          x: 0,
          y: slideH - 0.35,
          w: slideW,
          h: 0.3,
          align: 'center',
          fontSize: 9,
          color: 'B4B4B4',
        });
      }

      await pptx.writeFile({ fileName: 'Банк-Детская-карта-Наша-Семья.pptx' });
      toast.success('PPTX готов!');
    } catch (error) {
      console.error('Ошибка при создании PPTX:', error);
      toast.error('Не удалось создать PPTX');
    } finally {
      setIsPptxDownloading(false);
      setPptxProgress('');
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 ${
        isMeetingMode ? 'meeting-mode' : ''
      }`}
    >
      <PresentationHeader
        onDownloadPDF={downloadPDF}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownloadPPTX={downloadPPTX}
        isPptxDownloading={isPptxDownloading}
        pptxProgress={pptxProgress}
      />

      {isMeetingMode && (
        <MeetingIndicator
          activeIndex={activeIndex}
          total={total}
          onPrev={goPrev}
          onNext={goNext}
          onExit={exitMeeting}
        />
      )}

      {!isMeetingMode && <HubReturnLink variant="corner" topOffset="4rem" />}

      <style>{`
        html { scroll-behavior: smooth; }
        .printing [data-pdf-slide] {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        @media print {
          .fixed { display: none !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

        /* ===== Режим встречи ===== */
        .meeting-mode {
          background: linear-gradient(to bottom, #f8fafc, #ffffff, #f8fafc);
        }
        .meeting-mode ~ * [data-global-topbar],
        body:has(.meeting-mode) [data-global-topbar],
        body:has(.meeting-mode) header.global-topbar,
        body:has(.meeting-mode) nav.global-sidebar,
        body:has(.meeting-mode) [data-global-sidebar],
        body:has(.meeting-mode) [data-global-bottombar],
        body:has(.meeting-mode) footer.global-footer {
          display: none !important;
        }
        body:has(.meeting-mode) > div > header,
        body:has(.meeting-mode) > div > footer {
          display: none !important;
        }
        .meeting-mode .fixed.top-0 { display: none !important; }
        .meeting-mode [data-strategy-nav] { display: none !important; }

        /* Типографика и ритм в режиме встречи */
        .meeting-mode #bank-deck-content {
          padding-top: 1.5rem !important;
          padding-bottom: 4rem !important;
          max-width: 80rem;
        }
        .meeting-mode [data-pdf-slide] {
          min-height: calc(100vh - 4rem);
          margin-bottom: 1.5rem !important;
          padding: 3.5rem 3rem !important;
          display: flex;
          flex-direction: column;
          justify-content: center;
          scroll-margin-top: 1.5rem;
        }
        .meeting-mode [data-pdf-slide] h1 {
          font-size: clamp(2.5rem, 5vw, 4.5rem) !important;
          line-height: 1.05 !important;
        }
        .meeting-mode [data-pdf-slide] h2 {
          font-size: clamp(2rem, 4vw, 3.5rem) !important;
          line-height: 1.1 !important;
        }
        .meeting-mode [data-pdf-slide] h3 {
          font-size: clamp(1.125rem, 1.6vw, 1.5rem) !important;
        }
        .meeting-mode [data-pdf-slide] p {
          line-height: 1.65 !important;
        }
        @media (max-width: 768px) {
          .meeting-mode [data-pdf-slide] {
            padding: 2rem 1.25rem !important;
            min-height: auto;
          }
        }
      `}</style>

      <div
        id="bank-deck-content"
        className="max-w-5xl mx-auto px-3 sm:px-6 pt-16 pb-12 sm:pt-16"
      >
        <Slide01 />
        <BankAnchorNav activeId={activeId} />
        <Slide02 />
        <Slide03 />
        <Slide04 />
        <Slide05 />
        <Slide06 />
        <Slide07 />
        <Slide08 />
        <Slide09 />
        <Slide10 />
        <Slide11 />
        <Slide12 />
        <Slide13 />
        <Slide14 />
        <Slide15 />

        <footer className="text-center text-xs sm:text-sm text-slate-400 py-8">
          «Наша Семья» · Детская карта × Банк · Ярославская область · 2026 · частный доступ
        </footer>
      </div>
    </div>
  );
}