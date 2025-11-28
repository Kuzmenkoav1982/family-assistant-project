import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import func2url from '../../backend/func2url.json';

interface SuggestionItem {
  id: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
}

export default function SuggestionsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`${feedbackUrl}?type=suggestion`);
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Пожалуйста, войдите в систему');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(feedbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'suggestion',
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_email: currentUser.email || '',
          title: formData.title,
          description: formData.description,
          rating: null
        })
      });

      if (response.ok) {
        setFormData({ title: '', description: '' });
        setShowForm(false);
        loadSuggestions();
      } else {
        alert('Ошибка при отправке предложения');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при отправке предложения');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
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
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Icon name="Lightbulb" size={20} />
            Предложить идею
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Предложения и идеи
          </h1>
          <p className="text-gray-600">
            Помогите нам стать лучше - поделитесь своими идеями
          </p>
        </div>

        {showForm && (
          <Card className="p-6 mb-6 border-2 border-blue-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Название идеи
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Кратко опишите вашу идею"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Описание
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Расскажите подробнее о вашем предложении"
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {submitting ? 'Отправка...' : 'Отправить предложение'}
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
              Загрузка предложений...
            </div>
          ) : items.length === 0 ? (
            <Card className="p-12 text-center">
              <Icon name="Lightbulb" size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg">
                Пока нет предложений. Поделитесь своей идеей первым!
              </p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Icon name="Lightbulb" size={24} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.user_name}</p>
                    <p className="text-gray-700 mb-3">{item.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
