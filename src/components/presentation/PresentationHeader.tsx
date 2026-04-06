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
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm px-3 py-2 flex items-center gap-2">
      <Button
        onClick={onDownloadPPTX}
        disabled={anyLoading}
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm text-xs sm:text-sm flex-1 sm:flex-none sm:min-w-[140px]"
      >
        <Icon name={isPptxDownloading ? "Loader2" : "FileSliders"} size={16} className={`mr-1.5 ${isPptxDownloading ? 'animate-spin' : ''}`} />
        {isPptxDownloading ? (pptxProgress || 'PPTX...') : 'Скачать PPTX'}
      </Button>
      <Button
        onClick={onDownloadPDF}
        disabled={anyLoading}
        size="sm"
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm text-xs sm:text-sm flex-1 sm:flex-none sm:min-w-[140px]"
      >
        <Icon name={isDownloading ? "Loader2" : "Download"} size={16} className={`mr-1.5 ${isDownloading ? 'animate-spin' : ''}`} />
        {isDownloading ? (downloadProgress || 'PDF...') : 'Скачать PDF'}
      </Button>
      <Button
        onClick={() => window.history.back()}
        variant="outline"
        size="sm"
        className="shadow-sm ml-auto"
      >
        <Icon name="X" size={16} />
      </Button>
    </div>
  );
}