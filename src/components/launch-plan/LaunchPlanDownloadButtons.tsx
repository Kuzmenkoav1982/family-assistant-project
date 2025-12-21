import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LaunchPlanDownloadButtonsProps {
  onDownloadAsWord: () => void;
  onDownloadTechnicalSpec: () => void;
}

export function LaunchPlanDownloadButtons({
  onDownloadAsWord,
  onDownloadTechnicalSpec
}: LaunchPlanDownloadButtonsProps) {
  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={onDownloadAsWord} className="flex-1 gap-2" size="lg">
            <Icon name="FileText" size={20} />
            Скачать план (Word)
          </Button>
          <Button onClick={onDownloadTechnicalSpec} variant="outline" className="flex-1 gap-2" size="lg">
            <Icon name="Code" size={20} />
            Скачать ТЗ (Markdown)
          </Button>
        </div>
        <p className="text-center text-sm text-gray-600 mt-4">
          Документы готовы для передачи команде разработки
        </p>
      </CardContent>
    </Card>
  );
}
