import { Download, X } from 'lucide-react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface PresentationHeaderProps {
  onDownloadPDF: () => void;
  isDownloading: boolean;
}

export function PresentationHeader({ onDownloadPDF, isDownloading }: PresentationHeaderProps) {
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
        onClick={onDownloadPDF}
        disabled={isDownloading}
        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
      >
        <Download className="mr-2" size={18} />
        {isDownloading ? 'Создаём PDF...' : 'Скачать PDF'}
      </Button>
      <Button
        onClick={() => window.history.back()}
        variant="outline"
        className="shadow-lg"
      >
        <X size={18} />
      </Button>
    </div>
  );
}
