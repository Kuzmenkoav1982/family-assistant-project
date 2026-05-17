import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import ProofAnchorNav from '@/components/strategy-proof/ProofAnchorNav';
import ProofBackToStrategy from '@/components/strategy-proof/ProofBackToStrategy';
import Proof01Map from '@/components/strategy-proof/Proof01Map';
import Proof02Routes from '@/components/strategy-proof/Proof02Routes';
import Proof03Domovoy from '@/components/strategy-proof/Proof03Domovoy';
import Proof04Bank from '@/components/strategy-proof/Proof04Bank';
import Proof05Readiness from '@/components/strategy-proof/Proof05Readiness';
import Proof06Data from '@/components/strategy-proof/Proof06Data';
import Proof07Integration from '@/components/strategy-proof/Proof07Integration';
import Proof08Asset from '@/components/strategy-proof/Proof08Asset';
import Proof09Format from '@/components/strategy-proof/Proof09Format';
import HubReturnLink from '@/components/strategy-shared/HubReturnLink';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('proof-content');
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

export default function ProofDeck() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [isPptxDownloading, setIsPptxDownloading] = useState(false);
  const [pptxProgress, setPptxProgress] = useState('');

  // noindex — страница не для публичной индексации
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

      pdf.save('Наша-Семья-Доказательная-продуктовая.pdf');
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
      pptx.subject = 'Доказательная продуктовая презентация';
      pptx.title = 'Наша Семья — Доказательная продуктовая';

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

      await pptx.writeFile({ fileName: 'Наша-Семья-Доказательная-продуктовая.pptx' });
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <PresentationHeader
        onDownloadPDF={downloadPDF}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownloadPPTX={downloadPPTX}
        isPptxDownloading={isPptxDownloading}
        pptxProgress={pptxProgress}
      />

      <HubReturnLink variant="corner" topOffset="4rem" />

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
        id="proof-content"
        className="max-w-5xl mx-auto px-3 sm:px-6 pt-16 pb-12 sm:pt-16"
      >
        {/* Короткая шапка — назначение страницы */}
        <header className="mb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">
            Доказательная продуктовая логика
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            Что уже собрано в платформе
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-3xl">
            Материал для углубления разговора после основной стратегической
            логики.
          </p>
        </header>

        <ProofAnchorNav />

        <Proof01Map />
        <Proof02Routes />
        <Proof03Domovoy />
        <Proof04Bank />
        <Proof05Readiness />
        <Proof06Data />
        <Proof07Integration />
        <Proof08Asset />
        <Proof09Format />

        <ProofBackToStrategy />

        <footer className="text-center text-xs sm:text-sm text-slate-400 py-6">
          «Наша Семья» — доказательная продуктовая презентация ·
          nasha-semiya.ru · частный доступ
        </footer>
      </div>
    </div>
  );
}