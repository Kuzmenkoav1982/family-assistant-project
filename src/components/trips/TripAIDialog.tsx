import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface AIRecommendation {
  place_name: string;
  description: string;
  place_type: string;
  priority: string;
  ai_recommended: boolean;
}

interface TripAIDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  error: string | null;
  recommendations: AIRecommendation[];
  tripDestination?: string;
  getPlaceIcon: (type: string) => string;
  getPlaceTypeLabel: (type: string) => string;
  getPriorityColor: (priority: string) => string;
  onAdd: (rec: AIRecommendation, index: number) => void;
  onRetry: () => void;
}

export function TripAIDialog({
  open,
  onOpenChange,
  isLoading,
  error,
  recommendations,
  tripDestination,
  getPlaceIcon,
  getPlaceTypeLabel,
  getPriorityColor,
  onAdd,
  onRetry,
}: TripAIDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Icon name="Sparkles" size={18} className="flex-shrink-0" />
            <span className="truncate">AI-рекомендации интересных мест</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Icon name="Loader2" className="animate-spin text-purple-600" size={48} />
            <p className="text-gray-600 text-center">
              AI анализирует лучшие места для посещения...<br />
              <span className="text-sm text-gray-500">Это может занять несколько секунд</span>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {error ? (
              <div className="text-center py-8">
                <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium mb-2">Ошибка получения рекомендаций</p>
                <p className="text-sm text-gray-600">{error}</p>
                <Button onClick={onRetry} variant="outline" className="mt-4">
                  <Icon name="RefreshCw" size={16} className="mr-2" />
                  Попробовать снова
                </Button>
              </div>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow border-purple-200">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                          <Icon name={getPlaceIcon(rec.place_type)} size={24} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base text-gray-900">{rec.place_name}</h3>
                            <Badge className="bg-purple-600 text-white flex-shrink-0">
                              <Icon name="Sparkles" size={10} className="mr-1" />
                              AI
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Icon name={getPlaceIcon(rec.place_type)} size={12} />
                            <span>{getPlaceTypeLabel(rec.place_type)}</span>
                            {rec.priority && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                                  {rec.priority === 'high' && '🔥 Обязательно'}
                                  {rec.priority === 'medium' && '⭐ Рекомендуем'}
                                  {rec.priority === 'low' && '💤 По желанию'}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed mb-3">{rec.description}</p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const searchQuery = encodeURIComponent(`${rec.place_name} ${tripDestination || ''}`);
                          window.open(`https://yandex.ru/maps/?text=${searchQuery}`, '_blank');
                        }}
                      >
                        <Icon name="MapPin" size={14} className="mr-1" />
                        На карте
                      </Button>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 flex-1"
                        onClick={() => onAdd(rec, index)}
                      >
                        <Icon name="Plus" size={14} className="mr-1" />
                        Добавить
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Icon name="Info" size={48} className="mx-auto mb-3 text-gray-400" />
                <p>Нет рекомендаций для отображения</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
