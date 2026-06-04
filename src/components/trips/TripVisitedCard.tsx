import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Place {
  id: number;
  place_name: string;
  place_type: string;
  visited_date?: string;
  notes?: string;
}

interface TripVisitedCardProps {
  place: Place;
  getPlaceIcon: (type: string) => string;
  onUndo: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

export function TripVisitedCard({ place, getPlaceIcon, onUndo, onDelete }: TripVisitedCardProps) {
  return (
    <Card className="bg-green-50 border-green-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <Icon name={getPlaceIcon(place.place_type)} size={20} className="text-green-600" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base">{place.place_name}</CardTitle>
            {place.visited_date && (
              <p className="text-xs text-gray-600 mt-1">
                Посещено: {new Date(place.visited_date).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onUndo(place.id, 'planned')}
              title="Вернуть в планы"
            >
              <Icon name="Undo2" size={14} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(place.id)}
              title="Удалить"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          </div>
        </div>
      </CardHeader>
      {place.notes && (
        <CardContent>
          <p className="text-sm text-gray-700">{place.notes}</p>
        </CardContent>
      )}
    </Card>
  );
}
