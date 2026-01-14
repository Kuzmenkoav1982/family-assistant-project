import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Trip {
  id: number;
  title: string;
  destination: string;
  country: string | { name: string };
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  spent: number;
  currency: string;
  description: string;
  cover_image?: string;
  participants: string;
}

interface TripsListProps {
  trips: Trip[];
  loading: boolean;
  onTripClick: (tripId: number) => void;
  onEditTrip: (trip: Trip) => void;
  onDeleteTrip: (tripId: number) => void;
  onArchiveTrip: (tripId: number) => void;
  onAddTrip: () => void;
}

const getStatusBadge = (status: string) => {
  const statusMap = {
    wishlist: { label: 'Мечта', variant: 'secondary' as const, icon: 'Star' },
    planning: { label: 'Планируем', variant: 'outline' as const, icon: 'Calendar' },
    booked: { label: 'Забронировано', variant: 'default' as const, icon: 'CheckCircle' },
    ongoing: { label: 'В пути', variant: 'default' as const, icon: 'Plane' },
    completed: { label: 'Завершено', variant: 'secondary' as const, icon: 'Check' },
  };

  const config = statusMap[status as keyof typeof statusMap] || statusMap.planning;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon name={config.icon} size={14} />
      {config.label}
    </Badge>
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

const calculateDays = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days;
};

const formatBudget = (amount: number, currency: string) => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' ' + currency;
};

const getBudgetProgress = (spent: number, budget: number) => {
  if (!budget) return 0;
  return Math.round((spent / budget) * 100);
};

export function TripsList({
  trips,
  loading,
  onTripClick,
  onEditTrip,
  onDeleteTrip,
  onArchiveTrip,
  onAddTrip,
}: TripsListProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Загрузка...</p>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Icon name="Plane" size={48} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет поездок</h3>
        <p className="text-gray-500 mb-4">Начните планировать свое путешествие</p>
        <Button onClick={onAddTrip} className="gap-2">
          <Icon name="Plus" size={18} />
          Добавить поездку
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {trips.map((trip) => (
        <Card key={trip.id} className="p-6 hover:shadow-lg transition-all group relative overflow-visible">
          <div className="flex gap-4 cursor-pointer" onClick={() => onTripClick(trip.id)}>
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                <Icon name="MapPin" size={32} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{trip.title}</h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Icon name="MapPin" size={16} />
                    <span>
                      {trip.destination},{' '}
                      {typeof trip.country === 'object' ? trip.country.name : trip.country}
                    </span>
                  </div>
                </div>
                {getStatusBadge(trip.status)}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Icon name="Calendar" size={16} />
                  <span>
                    {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Clock" size={16} />
                  <span>{calculateDays(trip.start_date, trip.end_date)} дней</span>
                </div>
              </div>

              {trip.budget > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Бюджет</span>
                    <span className="font-semibold text-gray-900">
                      {formatBudget(trip.spent, trip.currency)} /{' '}
                      {formatBudget(trip.budget, trip.currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        getBudgetProgress(trip.spent, trip.budget) > 100
                          ? 'bg-red-500'
                          : getBudgetProgress(trip.spent, trip.budget) > 80
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{
                        width: `${Math.min(getBudgetProgress(trip.spent, trip.budget), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex items-center">
              <Icon name="ChevronRight" size={24} className="text-gray-400" />
            </div>
          </div>

          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ zIndex: 50 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-100/90 backdrop-blur-sm pointer-events-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Icon name="MoreVertical" size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTrip(trip);
                  }}
                  className="cursor-pointer"
                >
                  <Icon name="Pencil" size={16} className="mr-2" />
                  Изменить
                </DropdownMenuItem>
                {trip.status !== 'archived' && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveTrip(trip.id);
                    }}
                    className="cursor-pointer"
                  >
                    <Icon name="Archive" size={16} className="mr-2" />
                    В архив
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTrip(trip.id);
                  }}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
}