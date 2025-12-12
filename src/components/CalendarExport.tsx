import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

export function CalendarExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const token = localStorage.getItem('authToken');

  const handleExportIcal = async () => {
    if (!token) {
      toast({
        title: 'Ошибка',
        description: 'Необходимо войти в систему',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(func2url['calendar-export'], {
        method: 'GET',
        headers: {
          'X-Auth-Token': token
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Ошибка экспорта');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `family_calendar_${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Успешно!',
        description: 'Календарь экспортирован в формате iCal'
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Ошибка экспорта',
        description: error instanceof Error ? error.message : 'Не удалось экспортировать календарь',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calendar" size={24} className="text-purple-600" />
          Экспорт календаря
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Icon name="Info" size={18} className="text-blue-600" />
          <AlertDescription className="text-sm text-gray-700 ml-6">
            Экспортируйте события календаря в формате iCal (.ics) для импорта в:
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>Google Calendar</li>
              <li>Apple Calendar (iPhone/iPad/Mac)</li>
              <li>Microsoft Outlook</li>
              <li>Любой другой календарь с поддержкой iCal</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            onClick={handleExportIcal}
            disabled={isExporting || !token}
            className="w-full gap-2"
          >
            {isExporting ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                Экспорт...
              </>
            ) : (
              <>
                <Icon name="Download" size={18} />
                Экспортировать в iCal (.ics)
              </>
            )}
          </Button>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Icon name="HelpCircle" size={16} className="text-gray-600" />
              Как импортировать календарь?
            </h4>
            
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-medium text-gray-800">📱 Google Calendar:</p>
                <p className="text-xs">Настройки → Импорт и экспорт → Импортировать → Выберите файл .ics</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-800">🍎 Apple Calendar:</p>
                <p className="text-xs">Файл → Импорт → Выберите файл .ics</p>
              </div>
              
              <div>
                <p className="font-medium text-gray-800">📧 Outlook:</p>
                <p className="text-xs">Файл → Открыть и экспортировать → Импорт/экспорт → Выберите файл .ics</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
