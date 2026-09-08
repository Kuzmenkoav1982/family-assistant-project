import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface PresentationHeaderProps {
  onDownloadPDF: () => void;
  isDownloading: boolean;
  downloadProgress?: string;
  onDownloadPPTX: () => void;
  isPptxDownloading: boolean;
  pptxProgress?: string;
  /** ID контейнера со слайдами — для запуска полноэкранного показа. По умолчанию ищет ближайший [data-pdf-slide]-контейнер. */
  contentId?: string;
}

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = async (targetId?: string) => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    const el = (targetId && document.getElementById(targetId)) || document.documentElement;
    try {
      await el.requestFullscreen();
    } catch {
      // Fullscreen API недоступен (например, iOS Safari) — молча игнорируем
    }
  };

  return { isFullscreen, toggle };
}

export function PresentationHeader({
  onDownloadPDF,
  isDownloading,
  downloadProgress,
  onDownloadPPTX,
  isPptxDownloading,
  pptxProgress,
  contentId,
}: PresentationHeaderProps) {
  const anyLoading = isDownloading || isPptxDownloading;
  const { isFullscreen, toggle } = useFullscreen();

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm px-3 py-2 flex items-center gap-2">
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
        onClick={() => toggle(contentId)}
        variant="outline"
        size="sm"
        className="shadow-sm hidden sm:inline-flex"
        title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Показать на весь экран (для показа в Zoom)'}
      >
        <Icon name={isFullscreen ? 'Minimize' : 'Maximize'} size={16} className="sm:mr-1.5" />
        <span className="hidden sm:inline">{isFullscreen ? 'Свернуть' : 'Полный экран'}</span>
      </Button>
      <Button
        onClick={() => toggle(contentId)}
        variant="outline"
        size="icon"
        className="shadow-sm sm:hidden"
        title={isFullscreen ? 'Выйти из полноэкранного режима' : 'Показать на весь экран'}
      >
        <Icon name={isFullscreen ? 'Minimize' : 'Maximize'} size={16} />
      </Button>
      <Button
        onClick={handleClose}
        variant="outline"
        size="sm"
        className="shadow-sm ml-auto"
        title="Закрыть презентацию"
      >
        <Icon name="X" size={16} />
      </Button>
    </div>
  );
}
