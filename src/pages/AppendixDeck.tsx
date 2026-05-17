import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import AppendixIndicator from '@/components/strategy-appendix/AppendixIndicator';
import AppendixBackLinks from '@/components/strategy-appendix/AppendixBackLinks';
import Apx1Architecture from '@/components/strategy-appendix/Apx1Architecture';
import Apx2Data from '@/components/strategy-appendix/Apx2Data';
import Apx3Security from '@/components/strategy-appendix/Apx3Security';
import Apx4Formats from '@/components/strategy-appendix/Apx4Formats';
import Apx5Asset from '@/components/strategy-appendix/Apx5Asset';
import Apx6Team from '@/components/strategy-appendix/Apx6Team';
import Apx7Pilot from '@/components/strategy-appendix/Apx7Pilot';
import Apx8Metrics from '@/components/strategy-appendix/Apx8Metrics';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('appendix-content');
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

export default function AppendixDeck() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isPptxDownloading, setIsPptxDownloading] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');

  // noindex — закрытый резерв, не для публичной индексации
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

      pdf.save('Наша-Семья-Appendix-внутренний-резерв.pdf');
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
      pptx.subject = 'Appendix — внутренний резерв';
      pptx.title = 'Наша Семья — Appendix';

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

      await pptx.writeFile({
        fileName: 'Наша-Семья-Appendix-внутренний-резерв.pptx',
      });
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
    <div className="min-h-screen bg-slate-50">
      <PresentationHeader
        onDownloadPDF={downloadPDF}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownloadPPTX={downloadPPTX}
        isPptxDownloading={isPptxDownloading}
        pptxProgress={pptxProgress}
      />

      <AppendixIndicator />

      <style>{`
        .printing [data-pdf-slide] {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        @media print {
          .fixed { display: none !important; }
        }
      `}</style>

      <div
        id="appendix-content"
        className="max-w-4xl mx-auto px-3 sm:px-6 pt-16 pb-12 sm:pt-16"
      >
        <header className="mb-5 pt-2">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-1.5">
            Внутренний резерв · не публичный материал
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
            Appendix · 8 секций
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-3xl">
            Материал для углубления разговора и ответов на уточняющие вопросы.
            Не предназначен для отправки в открытом виде.
          </p>
        </header>

        <Apx1Architecture />
        <Apx2Data />
        <Apx3Security />
        <Apx4Formats />
        <Apx5Asset />
        <Apx6Team />
        <Apx7Pilot />
        <Apx8Metrics />

        <AppendixBackLinks />

        <footer className="text-center text-xs text-slate-400 py-4">
          «Наша Семья» · Appendix · внутренний резерв · nasha-semiya.ru
        </footer>
      </div>
    </div>
  );
}
