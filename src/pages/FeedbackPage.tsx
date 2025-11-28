import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import func2url from '../../backend/func2url.json';

interface FeedbackItem {
  id: string;
  user_name: string;
  title: string;
  description: string;
  rating: number;
  created_at: string;
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: 5
  });

  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const response = await fetch(`${feedbackUrl}?type=review`);
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      const response = await fetch(feedbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'review',
          user_id: currentUser?.id || 'guest',
          user_name: currentUser?.name || 'Гость',
          user_email: currentUser?.email || '',
          title: formData.title,
          description: formData.description,
          rating: formData.rating
        })
      });

      if (response.ok) {
        setFormData({ title: '', description: '', rating: 5 });
        setShowForm(false);
        loadFeedback();
      } else {
        alert('Ошибка при отправке отзыва');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при отправке отзыва');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icon
            key={star}
            name="Star"
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>
          
          <Button
            onClick={() => setShowForm(!showForm)}
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Icon name="MessageSquarePlus" size={20} />
            Оставить отзыв
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Отзывы пользователей
          </h1>
          <p className="text-gray-600">
            Делитесь своим опытом использования приложения
          </p>
        </div>

        {showForm && (
          <Card className="p-6 mb-6 border-2 border-purple-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Заголовок
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Кратко опишите ваше впечатление"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Оценка
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Icon
                        name="Star"
                        size={32}
                        className={star <= formData.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Отзыв
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Расскажите подробнее о вашем опыте"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {submitting ? 'Отправка...' : 'Отправить отзыв'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Загрузка отзывов...
            </div>
          ) : items.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">
                Пока нет отзывов. Будьте первым!
              </p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.user_name}</p>
                  </div>
                  {renderStars(item.rating)}
                </div>
                <p className="text-gray-700 mb-3">{item.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}