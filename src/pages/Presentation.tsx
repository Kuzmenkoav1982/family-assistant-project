import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import { PresentationTitleSlide } from '@/components/presentation/PresentationTitleSlide';
import { PresentationContentSections } from '@/components/presentation/PresentationContentSections';
import { PresentationFooter } from '@/components/presentation/PresentationFooter';

export default function Presentation() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const container = document.getElementById('presentation-content');
      if (!container) return;

      container.classList.add('printing');
      await new Promise(resolve => setTimeout(resolve, 200));

      const slides = container.querySelectorAll('[data-pdf-slide]');
      if (slides.length === 0) return;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      const renderWidth = 1200;

      for (let i = 0; i < slides.length; i++) {
        setDownloadProgress(`Обработка ${i + 1} из ${slides.length}...`);

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

        const imgAspect = canvas.width / canvas.height;
        let imgW = contentWidth;
        let imgH = imgW / imgAspect;

        if (imgH > contentHeight) {
          imgH = contentHeight;
          imgW = imgH * imgAspect;
        }

        const x = margin + (contentWidth - imgW) / 2;
        const y = margin + (contentHeight - imgH) / 2;

        if (i > 0) {
          pdf.addPage();
        }

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
        pdf.text(
          `${i + 1} / ${slides.length}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      container.classList.remove('printing');

      pdf.save('Наша-семья-Презентация.pdf');
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PresentationHeader 
        onDownloadPDF={downloadPDF}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
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

      <div id="presentation-content" className="max-w-4xl mx-auto px-6 py-12">
        <PresentationTitleSlide />
        <PresentationContentSections />
        <PresentationFooter />
      </div>
    </div>
  );
}
