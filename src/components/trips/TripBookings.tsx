import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Combobox } from '@/components/ui/combobox';
import { formatCurrencyOptions } from '@/data/currencies';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';

interface Booking {
  id: number;
  booking_type: string;
  title: string;
  booking_number?: string;
  provider?: string;
  date_from?: string;
  date_to?: string;
  cost?: number;
  currency: string;
  status: string;
  notes?: string;
}

interface TripBookingsProps {
  tripId: number;
  bookings: Booking[];
  tripCurrency: string;
  onUpdate: () => void;
}

export function TripBookings({ tripId, bookings, tripCurrency, onUpdate }: TripBookingsProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [newBooking, setNewBooking] = useState({
    booking_type: 'flight',
    title: '',
    booking_number: '',
    provider: '',
    date_from: '',
    date_to: '',
    cost: '',
    currency: tripCurrency,
    status: 'pending',
    notes: ''
  });

  const handleAddBooking = async () => {
    if (!newBooking.title) {
      alert('Укажите название брони');
      return;
    }

    if (!newBooking.date_from || !newBooking.date_to) {
      alert('Укажите даты начала и окончания брони');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: editingBooking ? 'update_booking' : 'add_booking',
          ...(editingBooking && { booking_id: editingBooking.id }),
          trip_id: tripId,
          ...newBooking,
          cost: newBooking.cost ? parseFloat(newBooking.cost) : null
        })
      });

      if (response.ok) {
        onUpdate();
        setIsAddOpen(false);
        setEditingBooking(null);
        setNewBooking({
          booking_type: 'flight',
          title: '',
          booking_number: '',
          provider: '',
          date_from: '',
          date_to: '',
          cost: '',
          currency: tripCurrency,
          status: 'pending',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Ошибка при сохранении брони');
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setNewBooking({
      booking_type: booking.booking_type,
      title: booking.title,
      booking_number: booking.booking_number || '',
      provider: booking.provider || '',
      date_from: booking.date_from || '',
      date_to: booking.date_to || '',
      cost: booking.cost?.toString() || '',
      currency: booking.currency,
      status: booking.status,
      notes: booking.notes || ''
    });
    setIsAddOpen(true);
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Удалить эту бронь?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || ''
        },
        body: JSON.stringify({
          action: 'delete_booking',
          booking_id: bookingId
        })
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Ошибка при удалении брони');
    }
  };

  const getBookingIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      flight: 'Plane',
      train: 'Train',
      bus: 'Bus',
      hotel: 'Hotel',
      car: 'Car',
      other: 'Ticket'
    };
    return iconMap[type] || 'Ticket';
  };

  const getBookingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      flight: 'Авиабилет',
      train: 'Ж/д билет',
      bus: 'Автобус',
      hotel: 'Отель',
      car: 'Аренда авто',
      other: 'Другое'
    };
    return labels[type] || 'Бронь';
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'В ожидании', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Подтверждено', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Отменено', className: 'bg-red-100 text-red-800' }
    };
    const config = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const formatCost = (cost: number, currency: string) => {
    return new Intl.NumberFormat('ru-RU').format(cost) + ' ' + currency;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Брони и билеты</h3>
        <Button onClick={() => setIsAddOpen(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить бронь
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="Ticket" size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Нет броней</p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить первую бронь
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Icon name={getBookingIcon(booking.booking_type)} size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base mb-1">{booking.title}</CardTitle>
                      <p className="text-xs text-gray-500">{getBookingTypeLabel(booking.booking_type)}</p>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {booking.provider && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="Building2" size={14} />
                    <span>{booking.provider}</span>
                  </div>
                )}
                {booking.booking_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="Hash" size={14} />
                    <span>{booking.booking_number}</span>
                  </div>
                )}
                {(booking.date_from || booking.date_to) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Icon name="Calendar" size={14} />
                    <span>
                      {booking.date_from && formatDate(booking.date_from)}
                      {booking.date_to && ` - ${formatDate(booking.date_to)}`}
                    </span>
                  </div>
                )}
                {booking.cost && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Icon name="Wallet" size={14} />
                    <span>{formatCost(booking.cost, booking.currency)}</span>
                  </div>
                )}
                {booking.notes && (
                  <p className="text-sm text-gray-500 italic mt-2 pt-2 border-t">{booking.notes}</p>
                )}
                <div className="flex gap-2 pt-2 border-t mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBooking(booking)}
                    className="flex-1"
                  >
                    <Icon name="Pencil" size={14} className="mr-1" />
                    Изменить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) {
          setEditingBooking(null);
          setNewBooking({
            booking_type: 'flight',
            title: '',
            booking_number: '',
            provider: '',
            date_from: '',
            date_to: '',
            cost: '',
            currency: tripCurrency,
            status: 'pending',
            notes: ''
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBooking ? 'Изменить бронь / билет' : 'Добавить бронь / билет'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAddBooking(); }} className="space-y-4">
            <div>
              <Label htmlFor="booking_type">Тип брони</Label>
              <Select value={newBooking.booking_type} onValueChange={(val) => setNewBooking({ ...newBooking, booking_type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flight">✈️ Авиабилет</SelectItem>
                  <SelectItem value="train">🚂 Ж/д билет</SelectItem>
                  <SelectItem value="bus">🚌 Автобус</SelectItem>
                  <SelectItem value="hotel">🏨 Отель</SelectItem>
                  <SelectItem value="car">🚗 Аренда авто</SelectItem>
                  <SelectItem value="other">🎫 Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                value={newBooking.title}
                onChange={(e) => setNewBooking({ ...newBooking, title: e.target.value })}
                placeholder="Москва - Сочи"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Провайдер</Label>
                <Input
                  id="provider"
                  value={newBooking.provider}
                  onChange={(e) => setNewBooking({ ...newBooking, provider: e.target.value })}
                  placeholder="Аэрофлот"
                />
              </div>
              <div>
                <Label htmlFor="booking_number">Номер брони</Label>
                <Input
                  id="booking_number"
                  value={newBooking.booking_number}
                  onChange={(e) => setNewBooking({ ...newBooking, booking_number: e.target.value })}
                  placeholder="ABC123"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_from">Дата начала *</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={newBooking.date_from}
                  onChange={(e) => setNewBooking({ ...newBooking, date_from: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_to">Дата окончания *</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={newBooking.date_to}
                  onChange={(e) => setNewBooking({ ...newBooking, date_to: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cost">Стоимость</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newBooking.cost}
                  onChange={(e) => setNewBooking({ ...newBooking, cost: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="currency">Валюта</Label>
                <Combobox
                  value={newBooking.currency}
                  onValueChange={(val) => setNewBooking({ ...newBooking, currency: val })}
                  options={formatCurrencyOptions()}
                  placeholder="Выберите валюту"
                  searchPlaceholder="Поиск валюты..."
                  emptyText="Валюта не найдена"
                />
              </div>
              <div>
                <Label htmlFor="status">Статус</Label>
                <Select value={newBooking.status} onValueChange={(val) => setNewBooking({ ...newBooking, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">В ожидании</SelectItem>
                    <SelectItem value="confirmed">Подтверждено</SelectItem>
                    <SelectItem value="cancelled">Отменено</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={newBooking.notes}
                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                placeholder="Важная информация, детали..."
                rows={3}
              />
            </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
              Отмена
            </Button>
            <Button type="submit">{editingBooking ? 'Сохранить' : 'Добавить'}</Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}