import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import { CircularMatryoshka } from '@/components/presentation/CircularMatryoshka';

async function captureSlides(
  onProgress: (msg: string) => void
): Promise<{ canvases: HTMLCanvasElement[]; count: number } | null> {
  const container = document.getElementById('matryoshka-content');
  if (!container) return null;

  container.classList.add('printing');
  window.dispatchEvent(new CustomEvent('presentation:print-mode', { detail: { active: true } }));
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

function MatryoshkaTitleSlide() {
  return (
    <section
      data-pdf-slide
      className="bg-gradient-to-br from-amber-600 via-orange-700 to-red-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14 mb-6 sm:mb-8 text-white"
    >
      <div className="flex items-center gap-2 mb-5 sm:mb-7 text-amber-100 text-xs sm:text-sm uppercase tracking-wider">
        <Icon name="Crown" size={16} />
        Ценностная матрёшка
      </div>
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6">
        От ценностей —<br />к каналам государства
      </h1>
      <p className="text-base sm:text-xl text-amber-100 leading-relaxed mb-6 sm:mb-8 max-w-3xl">
        В центре — традиционные ценности по Указу № 809. Вокруг — работающее ядро продукта,
        прикладные сервисы Стратегии 615-р и каналы дистрибуции до 2036 года.
      </p>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <a
          href="http://kremlin.ru/acts/bank/48502"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/15 hover:bg-white/25 transition backdrop-blur rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-white/20 inline-flex items-center gap-1.5"
        >
          Указ № 809
          <Icon name="ExternalLink" size={12} />
        </a>
        <a
          href="http://government.ru/docs/54573/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/15 hover:bg-white/25 transition backdrop-blur rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-white/20 inline-flex items-center gap-1.5"
        >
          Распоряжение № 615-р
          <Icon name="ExternalLink" size={12} />
        </a>
        <div className="bg-white/15 backdrop-blur rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-white/20">
          Версия для инвестора
        </div>
      </div>
    </section>
  );
}

function MatryoshkaLegend() {
  return (
    <section
      data-pdf-slide
      className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-10 mb-6 sm:mb-8"
    >
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full mb-3 border border-amber-200">
          <Icon name="BookOpen" size={14} className="text-amber-700" />
          <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
            Как читать матрёшку
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Четыре уровня — одна логика
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-amber-50 border-l-4 border-amber-600 rounded-r-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Heart" size={18} className="text-amber-700" />
            <h3 className="font-bold text-amber-900">Центр · Ценности 809</h3>
          </div>
          <p className="text-sm text-amber-900/80 leading-relaxed">
            7 традиционных ценностей по Указу Президента. Это смысловое сердце продукта —
            то, ради чего он существует.
          </p>
        </div>

        <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Zap" size={18} className="text-emerald-700" />
            <h3 className="font-bold text-emerald-900">Кольцо 2 · Ядро</h3>
          </div>
          <p className="text-sm text-emerald-900/80 leading-relaxed">
            8 модулей платформы, которые уже работают. Это готовый актив —
            фундамент, на который опирается остальное.
          </p>
        </div>

        <div className="bg-orange-50 border-l-4 border-orange-600 rounded-r-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Target" size={18} className="text-orange-700" />
            <h3 className="font-bold text-orange-900">Кольцо 3 · Стратегия 615-р</h3>
          </div>
          <p className="text-sm text-orange-900/80 leading-relaxed">
            12 прикладных сервисов из Распоряжения Правительства. Это направление достройки
            на горизонте до 2036 года.
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-700 rounded-r-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Network" size={18} className="text-blue-700" />
            <h3 className="font-bold text-blue-900">Кольцо 4 · Каналы государства</h3>
          </div>
          <p className="text-sm text-blue-900/80 leading-relaxed">
            8 каналов дистрибуции — Госуслуги, MAX, Web, региональные ИС, реестр ПО.
            Через них продукт доходит до семьи.
          </p>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border border-amber-200 rounded-xl p-5">
        <p className="text-sm text-gray-800 leading-relaxed">
          <strong className="text-amber-800">Логика чтения изнутри наружу:</strong> Указ
          формирует ценности → мы построили продукт под семью → он содержательно стыкуется с
          задачами 615-р → масштабируется через каналы государства.
        </p>
      </div>
    </section>
  );
}

function MatryoshkaFooter() {
  return (
    <section className="text-center text-xs sm:text-sm text-gray-400 py-6">
      <p>«Наша Семья» — ценностная матрёшка · nasha-semiya.ru · частный доступ</p>
    </section>
  );
}

export default function MatryoshkaDeck() {
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

      pdf.save('Наша-семья-Ценностная-матрёшка.pdf');
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
      pptx.subject = 'Ценностная матрёшка «Наша Семья»';
      pptx.title = 'Наша Семья — Ценностная матрёшка';

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

      await pptx.writeFile({ fileName: 'Наша-семья-Ценностная-матрёшка.pptx' });
    } catch (error) {
      console.error('Ошибка при создании PPTX:', error);
    } finally {
      setIsPptxDownloading(false);
      setPptxProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
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

      <div
        id="matryoshka-content"
        className="max-w-5xl mx-auto px-3 sm:px-6 pt-16 pb-8 sm:py-12 sm:pt-16"
      >
        <MatryoshkaTitleSlide />
        <CircularMatryoshka />
        <MatryoshkaLegend />
        <MatryoshkaFooter />
      </div>
    </div>
  );
}
