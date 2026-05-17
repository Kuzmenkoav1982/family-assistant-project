import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { toast } from 'sonner';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import AnchorNav from '@/components/strategy-v21/AnchorNav';
import MeetingIndicator from '@/components/strategy-v21/MeetingIndicator';
import { useMeetingMode } from '@/components/strategy-v21/useMeetingMode';
import HubReturnLink from '@/components/strategy-shared/HubReturnLink';
import Slide01Title from '@/components/strategy-v21/Slide01Title';
import Slide02WhyNow from '@/components/strategy-v21/Slide02WhyNow';
import Slide03Problem from '@/components/strategy-v21/Slide03Problem';
import Slide04FamilyId from '@/components/strategy-v21/Slide04FamilyId';
import Slide05BankValue from '@/components/strategy-v21/Slide05BankValue';
import Slide06Platform from '@/components/strategy-v21/Slide06Platform';
import Slide07Domovoy from '@/components/strategy-v21/Slide07Domovoy';
import Slide08Proof from '@/components/strategy-v21/Slide08Proof';
import Slide09Roadmap from '@/components/strategy-v21/Slide09Roadmap';
import Slide10Control from '@/components/strategy-v21/Slide10Control';
import Slide11Formats from '@/components/strategy-v21/Slide11Formats';
import Slide12WhatBankGets from '@/components/strategy-v21/Slide12WhatBankGets';
import Slide13NextStep from '@/components/strategy-v21/Slide13NextStep';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('strategy-v21-content');
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

export default function StrategyDeckV21() {
  const {
    isMeetingMode,
    activeId,
    activeIndex,
    total,
    goNext,
    goPrev,
    exitMeeting,
  } = useMeetingMode();

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

      pdf.save('Наша-Семья-Стратегия-для-банка.pdf');
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
      pptx.subject = 'Стратегия «Наша Семья» — версия для банка';
      pptx.title = 'Наша Семья — Стратегия для банка';

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

      await pptx.writeFile({ fileName: 'Наша-Семья-Стратегия-для-банка.pptx' });
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

      {/* Hub-возврат вне режима встречи — только при ?ops=1 */}
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

        /* ===== Режим встречи (?mode=meeting) — оболочка показа поверх /strategy ===== */
        .meeting-mode {
          background: linear-gradient(to bottom, #f8fafc, #ffffff, #f8fafc);
        }
        /* Скрываем шапку/футер сайта и общую навигацию */
        .meeting-mode ~ * [data-global-topbar],
        body:has(.meeting-mode) [data-global-topbar],
        body:has(.meeting-mode) header.global-topbar,
        body:has(.meeting-mode) nav.global-sidebar,
        body:has(.meeting-mode) [data-global-sidebar],
        body:has(.meeting-mode) [data-global-bottombar],
        body:has(.meeting-mode) footer.global-footer {
          display: none !important;
        }
        /* На случай если глобальные элементы рендерятся как .fixed top-bar */
        body:has(.meeting-mode) > div > header,
        body:has(.meeting-mode) > div > footer {
          display: none !important;
        }
        /* Скрываем PresentationHeader (кнопки экспорта) и нашу якорную панель в режиме встречи */
        .meeting-mode .fixed.top-0 { display: none !important; }
        .meeting-mode [data-strategy-nav] { display: none !important; }

        /* Крупная типографика и слайдовый ритм */
        .meeting-mode #strategy-v21-content {
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
        id="strategy-v21-content"
        className="max-w-5xl mx-auto px-3 sm:px-6 pt-16 pb-12 sm:pt-16"
      >
        <Slide01Title />
        <AnchorNav activeId={activeId} />
        <Slide02WhyNow />
        <Slide03Problem />
        <Slide04FamilyId />
        <Slide05BankValue />
        <Slide06Platform />
        <Slide07Domovoy />
        <Slide08Proof />
        <Slide09Roadmap />
        <Slide10Control />
        <Slide11Formats />
        <Slide12WhatBankGets />
        <Slide13NextStep />

        <footer className="text-center text-xs sm:text-sm text-slate-400 py-8">
          «Наша Семья» — стратегическая презентация для банка · nasha-semiya.ru ·
          частный доступ
        </footer>
      </div>
    </div>
  );
}