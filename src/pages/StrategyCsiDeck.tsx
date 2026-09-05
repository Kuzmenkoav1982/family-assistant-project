import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import CsiAnchorNav from '@/components/strategy-csi/CsiAnchorNav';
import CsiMeetingIndicator from '@/components/strategy-csi/CsiMeetingIndicator';
import { useCsiMeetingMode } from '@/components/strategy-csi/useCsiMeetingMode';
import SlideCSI01Cover from '@/components/strategy-csi/SlideCSI01Cover';
import SlideCSI02SharedMission from '@/components/strategy-csi/SlideCSI02SharedMission';
import SlideCSI03AfterVisitGap from '@/components/strategy-csi/SlideCSI03AfterVisitGap';
import SlideCSI04Journey from '@/components/strategy-csi/SlideCSI04Journey';
import SlideCSI04bCulture from '@/components/strategy-csi/SlideCSI04bCulture';
import SlideCSI05PilotSevenSteps from '@/components/strategy-csi/SlideCSI05PilotSevenSteps';
import SlideCSI06CurrentAndRoadmap from '@/components/strategy-csi/SlideCSI06CurrentAndRoadmap';
import SlideCSI07Value from '@/components/strategy-csi/SlideCSI07Value';
import SlideCSI08MetricsAndNextStep from '@/components/strategy-csi/SlideCSI08MetricsAndNextStep';
import SlideCSI09Expansion from '@/components/strategy-csi/SlideCSI09Expansion';
import SlideCSI10Agenda from '@/components/strategy-csi/SlideCSI10Agenda';
import SlideCSI11Boundaries from '@/components/strategy-csi/SlideCSI11Boundaries';
import SlideCSI12Contacts from '@/components/strategy-csi/SlideCSI12Contacts';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('strategy-csi-content');
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

export default function StrategyCsiDeck() {
  const {
    isMeetingMode,
    activeId,
    activeIndex,
    total,
    goNext,
    goPrev,
    exitMeeting,
  } = useCsiMeetingMode();

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isPptxDownloading, setIsPptxDownloading] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');

  // noindex — служебная страница, не для публичной индексации
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

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

      pdf.save('Наша-Семья-х-ЦСИ-рабочая-концепция.pdf');
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
      pptx.subject = 'ЦСИ × Наша Семья — рабочая концепция';
      pptx.title = 'Центр семейной истории × Наша Семья';

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
        slide.background = { fill: 'FFFBF5' };
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

      await pptx.writeFile({ fileName: 'Наша-Семья-х-ЦСИ-рабочая-концепция.pptx' });
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
      className={`min-h-screen bg-gradient-to-b from-[#fdfbf7] via-white to-[#fdfbf7] ${
        isMeetingMode ? 'csi-meeting-mode' : ''
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
        <CsiMeetingIndicator
          activeIndex={activeIndex}
          total={total}
          onPrev={goPrev}
          onNext={goNext}
          onExit={exitMeeting}
        />
      )}

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

        .csi-meeting-mode {
          background: linear-gradient(to bottom, #fdfbf7, #ffffff, #fdfbf7);
        }
        .csi-meeting-mode ~ * [data-global-topbar],
        body:has(.csi-meeting-mode) [data-global-topbar],
        body:has(.csi-meeting-mode) header.global-topbar,
        body:has(.csi-meeting-mode) nav.global-sidebar,
        body:has(.csi-meeting-mode) [data-global-sidebar],
        body:has(.csi-meeting-mode) [data-global-bottombar],
        body:has(.csi-meeting-mode) footer.global-footer {
          display: none !important;
        }
        body:has(.csi-meeting-mode) > div > header,
        body:has(.csi-meeting-mode) > div > footer {
          display: none !important;
        }
        .csi-meeting-mode .fixed.top-0 { display: none !important; }
        .csi-meeting-mode [data-strategy-nav] { display: none !important; }

        .csi-meeting-mode #strategy-csi-content {
          padding-top: 1.5rem !important;
          padding-bottom: 4rem !important;
          max-width: 80rem;
        }
        .csi-meeting-mode [data-pdf-slide] {
          min-height: calc(100vh - 4rem);
          margin-bottom: 1.5rem !important;
          padding: 3.5rem 3rem !important;
          display: flex;
          flex-direction: column;
          justify-content: center;
          scroll-margin-top: 1.5rem;
        }
        .csi-meeting-mode [data-pdf-slide] h1 {
          font-size: clamp(2.25rem, 4.5vw, 4rem) !important;
          line-height: 1.1 !important;
        }
        .csi-meeting-mode [data-pdf-slide] h2 {
          font-size: clamp(1.75rem, 3.5vw, 3rem) !important;
          line-height: 1.15 !important;
        }
        .csi-meeting-mode [data-pdf-slide] p {
          line-height: 1.65 !important;
        }
        @media (max-width: 768px) {
          .csi-meeting-mode [data-pdf-slide] {
            padding: 2rem 1.25rem !important;
            min-height: auto;
          }
        }
      `}</style>

      <div
        id="strategy-csi-content"
        className="max-w-5xl mx-auto px-3 sm:px-6 pt-16 pb-12 sm:pt-16"
      >
        <SlideCSI01Cover />
        <CsiAnchorNav activeId={activeId} />
        <SlideCSI02SharedMission />
        <SlideCSI03AfterVisitGap />
        <SlideCSI04Journey />
        <SlideCSI04bCulture />
        <SlideCSI05PilotSevenSteps />
        <SlideCSI06CurrentAndRoadmap />
        <SlideCSI07Value />
        <SlideCSI08MetricsAndNextStep />
        <SlideCSI10Agenda />
        <SlideCSI11Boundaries />
        <SlideCSI12Contacts />
        <SlideCSI09Expansion />

        <footer className="text-center text-xs sm:text-sm text-stone-400 py-8">
          Центр семейной истории × «Наша Семья» — рабочая концепция для
          обсуждения · партнёрство не согласовано
        </footer>
      </div>
    </div>
  );
}