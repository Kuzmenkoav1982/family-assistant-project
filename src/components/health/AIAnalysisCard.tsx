import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AIAnalysisResult {
  status: string;
  extractedText?: string;
  interpretation: string;
  extractedValues?: string[];
  warnings?: string[];
  fullResponse?: string;
  processedAt?: string;
  sourceImageUrl?: string;
}

interface HealthAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'document';
  uploadedAt: string;
}

interface AIAnalysisCardProps {
  analysis: AIAnalysisResult;
  title?: string;
  sourceFile?: HealthAttachment;
}

export function AIAnalysisCard({ analysis, title = 'ИИ-анализ документа', sourceFile }: AIAnalysisCardProps) {
  if (!analysis || analysis.status !== 'completed') {
    return null;
  }

  const fileUrl = sourceFile?.fileUrl || analysis.sourceImageUrl;

  const handleViewFile = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-blue-900 text-base sm:text-lg min-w-0 flex-1">
            <Icon name="Sparkles" size={18} className="text-blue-600 flex-shrink-0 sm:w-5 sm:h-5" />
            <span className="truncate">{title}</span>
          </CardTitle>
          {fileUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFile}
              className="bg-white hover:bg-blue-50 whitespace-nowrap flex-shrink-0 text-xs sm:text-sm"
            >
              <Icon name="Eye" size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline sm:inline">Открыть файл</span>
              <span className="inline xs:hidden sm:hidden">Файл</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-2 mb-2">
            <Icon name="FileText" size={16} className="mt-1 text-blue-600" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-700 mb-1">Интерпретация результатов:</p>
              <p className="text-sm text-gray-900 whitespace-pre-line">{analysis.interpretation}</p>
            </div>
          </div>
        </div>

        {analysis.extractedValues && analysis.extractedValues.length > 0 && (
          <div>
            <p className="font-semibold text-sm text-blue-900 mb-2">Обнаруженные показатели:</p>
            <div className="flex flex-wrap gap-2">
              {analysis.extractedValues.map((value, idx) => (
                <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.warnings && analysis.warnings.length > 0 && (
          <Alert variant="destructive" className="bg-orange-50 border-orange-200">
            <Icon name="AlertTriangle" size={16} className="text-orange-600" />
            <AlertDescription>
              <p className="font-semibold text-orange-900 mb-2">⚠️ Требуют внимания:</p>
              <ul className="space-y-1">
                {analysis.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-orange-800 flex items-start gap-2">
                    <Icon name="AlertCircle" size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {analysis.processedAt && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Icon name="Clock" size={12} />
            Проанализировано: {new Date(analysis.processedAt).toLocaleString('ru-RU')}
          </p>
        )}

        <div className="bg-blue-100 rounded p-3 text-xs text-blue-800">
          <Icon name="Info" size={14} className="inline mr-1" />
          Результат создан искусственным интеллектом. Для точной диагностики обратитесь к врачу.
        </div>
      </CardContent>
    </Card>
  );
}