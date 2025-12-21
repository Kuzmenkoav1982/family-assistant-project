import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';
import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import { PresentationTitleSlide } from '@/components/presentation/PresentationTitleSlide';
import { PresentationContentSections } from '@/components/presentation/PresentationContentSections';
import { PresentationFooter } from '@/components/presentation/PresentationFooter';

export default function Presentation() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('presentation-content');
      if (!element) return;

      element.classList.add('printing');
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        windowHeight: element.scrollHeight,
        imageTimeout: 0,
        removeContainer: true
      });

      element.classList.remove('printing');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const topMargin = 15;
      const bottomMargin = 15;
      const sideMargin = 10;
      
      const imgWidth = pageWidth - (2 * sideMargin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentHeight = pageHeight - topMargin - bottomMargin;
      
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yPosition = -(page * contentHeight) + topMargin;
        
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          sideMargin,
          yPosition,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }

      pdf.save('Наша-семья-Презентация.pdf');
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <PresentationHeader 
        onDownloadPDF={downloadPDF}
        isDownloading={isDownloading}
      />

      <style>{`
        @media print {
          .printing {
            padding: 12mm 8mm !important;
            max-width: 100% !important;
          }
          .printing section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 8mm !important;
            padding: 6mm !important;
          }
          .fixed {
            display: none !important;
          }
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
