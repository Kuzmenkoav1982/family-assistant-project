import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import AnchorNav from '@/components/strategy-v21/AnchorNav';
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
  const [searchParams] = useSearchParams();
  const isMeetingMode = searchParams.get('mode') === 'meeting';

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

      <style>{`
        .printing [data-pdf-slide] {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        @media print {
          .fixed { display: none !important; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <div
        id="strategy-v21-content"
        className="max-w-5xl mx-auto px-3 sm:px-6 pt-16 pb-12 sm:pt-16"
      >
        <Slide01Title />
        <AnchorNav />
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
