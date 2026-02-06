import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../backend/func2url.json';

const API_URL = func2url['events'];

function getUserId(): string {
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return userData.member_id || '1';
    } catch (e) {
      console.error('[getUserId] Failed to parse userData:', e);
    }
  }
  return '1';
}

export default function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    eventType: 'custom',
    eventDate: '',
    eventTime: '',
    location: '',
    description: '',
    budget: ''
  });

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setInitialLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URL}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          eventType: data.eventType || 'custom',
          eventDate: data.eventDate ? data.eventDate.split('T')[0] : '',
          eventTime: data.eventTime || '',
          location: data.location || '',
          description: data.description || '',
          budget: data.budget ? String(data.budget) : ''
        });
      }
    } catch (error) {
      console.error('[EditEventPage] Error fetching event:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные праздника',
        variant: 'destructive'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          eventId: id,
          title: formData.title,
          eventType: formData.eventType,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime || null,
          location: formData.location || null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          description: formData.description || null
        })
      });

      if (response.ok) {
        toast({
          title: 'Праздник обновлён!',
          description: 'Изменения сохранены'
        });
        navigate(`/events/${id}`);
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('[EditEvent] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить праздник',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Загрузка...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/events')}
        className="mb-4"
      >
        <Icon name="ArrowLeft" size={16} />
        Назад к праздникам
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Pencil" className="text-pink-500" />
            Редактировать праздник
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название праздника *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="День рождения Маши"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventType">Тип праздника</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({ ...formData, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">🎂 День рождения</SelectItem>
                  <SelectItem value="anniversary">💍 Годовщина</SelectItem>
                  <SelectItem value="holiday">🎉 Праздник</SelectItem>
                  <SelectItem value="custom">🎈 Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Дата *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventTime">Время</Label>
                <Input
                  id="eventTime"
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Место проведения</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Кафе «Теремок», ул. Ленина 1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Бюджет (₽)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Тематика, идеи, пожелания..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/events')}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
