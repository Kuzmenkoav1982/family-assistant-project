import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Place {
  id: number;
  place_name: string;
  place_type: string;
  address?: string;
  description?: string;
  estimated_cost?: number;
  currency?: string;
  priority: string;
  status: string;
  ai_recommended: boolean;
}

interface TripPlaceCardProps {
  place: Place;
  currency: string;
  getPlaceIcon: (type: string) => string;
  getPriorityColor: (priority: string) => string;
  onMarkVisited: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export function TripPlaceCard({
  place,
  currency,
  getPlaceIcon,
  getPriorityColor,
  onMarkVisited,
  onDelete,
}: TripPlaceCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon name={getPlaceIcon(place.place_type)} size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight">{place.place_name}</CardTitle>
              {place.ai_recommended && (
                <Badge variant="outline" className="text-xs mt-1 bg-purple-50 text-purple-700 border-purple-200">
                  <Icon name="Sparkles" size={10} className="mr-1" />
                  AI
                </Badge>
              )}
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${getPriorityColor(place.priority)}`}>
            {place.priority === 'high' && '🔥'}
            {place.priority === 'medium' && '⭐'}
            {place.priority === 'low' && '💤'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {place.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{place.description}</p>
        )}
        {place.address && (
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Icon name="MapPin" size={12} className="mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{place.address}</span>
          </div>
        )}
        {place.estimated_cost && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Icon name="Coins" size={12} />
            <span>~{place.estimated_cost} {currency}</span>
          </div>
        )}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            variant="default"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => onMarkVisited(place.id, 'visited')}
          >
            <Icon name="Check" size={14} className="mr-1" />
            Посетили
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onMarkVisited(place.id, 'skipped')}
            title="Пропустить"
          >
            <Icon name="X" size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(place.id)}
            title="Удалить"
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
