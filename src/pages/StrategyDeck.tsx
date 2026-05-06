import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import { SlideGovFramework615 } from '@/components/presentation/SlideGovFramework615';
import { SlideMilitaryFocus } from '@/components/presentation/SlideMilitaryFocus';
import { CircularEcosystem } from '@/components/presentation/CircularEcosystem';
import { CircularArchitecture } from '@/components/presentation/CircularArchitecture';
import { SlideStrategyCards } from '@/components/presentation/SlideStrategyCards';
import { SlideArchitectureCards } from '@/components/presentation/SlideArchitectureCards';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('strategy-content');
  if (!container) return null;

  container.classList.add('printing');
  window.dispatchEvent(new CustomEvent('presentation:print-mode', { detail: { active: true } }));
  await new Promise(resolve => setTimeout(resolve, 400));

  const slides = container.querySelectorAll('[data-pdf-slide]');
  if (slides.length === 0) {
    container.classList.remove('printing');
    window.dispatchEvent(new CustomEvent('presentation:print-mode', { detail: { active: false } }));
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
  window.dispatchEvent(new CustomEvent('presentation:print-mode', { detail: { active: false } }));
  return { canvases, count: slides.length };
}

function StrategyTitleSlide() {
  return (
    <section
      data-pdf-slide
      className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14 mb-6 sm:mb-8 text-white"
    >
      <div className="flex items-center gap-2 mb-5 sm:mb-7 text-purple-100 text-xs sm:text-sm uppercase tracking-wider">
        <Icon name="Layers" size={16} />
        Стратегия и видение
      </div>
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6">
        «Наша Семья» —<br />Стратегия до 2036 года
      </h1>
      <p className="text-base sm:text-xl text-purple-100 leading-relaxed mb-6 sm:mb-8 max-w-3xl">
        Презентация для инвестора. Государственная рамка по Распоряжению № 615-р,
        архитектура платформы и план первого этапа — семьи военнослужащих и участников СВО.
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-white/20">
          Распоряжение № 615-р
        </div>
        <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-white/20">
          Нацпроект «Семья»
        </div>
        <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-white/20">
          Фокус: военнослужащие и СВО
        </div>
      </div>
    </section>
  );
}

function StrategyFooter() {
  return (
    <section className="text-center text-xs sm:text-sm text-gray-400 py-6">
      <p>«Наша Семья» — стратегическая презентация · nasha-semiya.ru · частный доступ</p>
    </section>
  );
}

export default function StrategyDeck() {
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
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgW, imgH, `slide-${i}`, 'FAST');

        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);
        pdf.text(`${i + 1} / ${result.count}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      pdf.save('Наша-семья-Стратегия-2036.pdf');
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
      pptx.subject = 'Стратегия «Наша Семья» до 2036 года';
      pptx.title = 'Наша Семья — Стратегия до 2036';

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
          fontSize: 7,
          color: 'B4B4B4',
        });
      }

      await pptx.writeFile({ fileName: 'Наша-семья-Стратегия-2036.pptx' });
    } catch (error) {
      console.error('Ошибка при создании PPTX:', error);
    } finally {
      setIsPptxDownloading(false);
      setPptxProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PresentationHeader
        onDownloadPDF={downloadPDF}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownloadPPTX={downloadPPTX}
        isPptxDownloading={isPptxDownloading}
        pptxProgress={pptxProgress}
      />

      <style>{`
        .printing [data-pdf-slide] {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        @media print {
          .fixed { display: none !important; }
        }
      `}</style>

      <div id="strategy-content" className="max-w-4xl mx-auto px-3 sm:px-6 pt-16 pb-8 sm:py-12 sm:pt-16">
        <StrategyTitleSlide />
        <SlideGovFramework615 />
        <SlideMilitaryFocus />
        <CircularEcosystem />
        <CircularArchitecture />
        <SlideStrategyCards />
        <SlideArchitectureCards />
        <StrategyFooter />
      </div>
    </div>
  );
}
