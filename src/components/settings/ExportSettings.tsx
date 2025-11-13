import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface ExportSettingsProps {
  isExporting: boolean;
  onExport: (format: 'csv' | 'pdf') => Promise<void>;
}

export default function ExportSettings({ isExporting, onExport }: ExportSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Download" size={24} />
          Экспорт данных
        </CardTitle>
        <CardDescription>
          Скачайте данные вашей семьи в удобном формате
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Icon name="FileSpreadsheet" className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">CSV формат</h3>
                <Badge variant="outline" className="text-xs mt-1">Excel / Google Sheets</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Таблица со всеми членами семьи, задачами и баллами. Идеально для анализа в Excel.
            </p>
            <Button
              onClick={() => onExport('csv')}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isExporting ? (
                <>
                  <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                  Экспорт...
                </>
              ) : (
                <>
                  <Icon name="Download" className="mr-2" size={16} />
                  Скачать CSV
                </>
              )}
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Icon name="FileText" className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">PDF отчёт</h3>
                <Badge variant="outline" className="text-xs mt-1">Красивый формат</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Оформленный отчёт с графиками и статистикой. Готов для печати или отправки.
            </p>
            <Button
              onClick={() => onExport('pdf')}
              disabled={isExporting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500"
            >
              {isExporting ? (
                <>
                  <Icon name="Loader" className="mr-2 animate-spin" size={16} />
                  Экспорт...
                </>
              ) : (
                <>
                  <Icon name="Download" className="mr-2" size={16} />
                  Скачать PDF
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <Icon name="Info" className="inline mr-2" size={16} />
            Экспорт включает: членов семьи, задачи, баллы, достижения и статистику активности.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
