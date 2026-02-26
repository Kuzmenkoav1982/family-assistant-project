import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface PresentationHeaderProps {
  onDownloadPDF: () => void;
  isDownloading: boolean;
  downloadProgress?: string;
  onDownloadPPTX: () => void;
  isPptxDownloading: boolean;
  pptxProgress?: string;
}

export function PresentationHeader({ 
  onDownloadPDF, 
  isDownloading, 
  downloadProgress,
  onDownloadPPTX,
  isPptxDownloading,
  pptxProgress,
}: PresentationHeaderProps) {
  const anyLoading = isDownloading || isPptxDownloading;

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Button
        onClick={() => window.location.href = '/welcome'}
        variant="outline"
        className="shadow-lg"
      >
        <Icon name="Home" size={18} />
      </Button>
      <Button
        onClick={onDownloadPPTX}
        disabled={anyLoading}
        className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg min-w-[160px]"
      >
        <Icon name={isPptxDownloading ? "Loader2" : "FileSliders"} size={18} className={`mr-2 ${isPptxDownloading ? 'animate-spin' : ''}`} />
        {isPptxDownloading ? (pptxProgress || 'Создаём PPTX...') : 'Скачать PPTX'}
      </Button>
      <Button
        onClick={onDownloadPDF}
        disabled={anyLoading}
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg min-w-[160px]"
      >
        <Icon name={isDownloading ? "Loader2" : "Download"} size={18} className={`mr-2 ${isDownloading ? 'animate-spin' : ''}`} />
        {isDownloading ? (downloadProgress || 'Создаём PDF...') : 'Скачать PDF'}
      </Button>
      <Button
        onClick={() => window.history.back()}
        variant="outline"
        className="shadow-lg"
      >
        <Icon name="X" size={18} />
      </Button>
    </div>
  );
}
