import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import func2url from '../../backend/func2url.json';

export default function SupportPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    email: currentUser?.email || ''
  });

  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

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
          type: 'support',
          user_id: currentUser?.id || 'guest',
          user_name: currentUser?.name || 'Гость',
          user_email: formData.email,
          title: formData.title,
          description: formData.description,
          rating: null
        })
      });

      if (response.ok) {
        setFormData({ title: '', description: '', email: currentUser?.email || '' });
        setSuccess(true);
        setTimeout(() => {
          navigate(-1);
        }, 3000);
      } else {
        alert('Ошибка при отправке обращения');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Ошибка при отправке обращения');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle2" size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Обращение отправлено!</h2>
          <p className="text-gray-600 mb-4">
            Мы получили ваше сообщение и свяжемся с вами в ближайшее время
          </p>
          <Button onClick={() => navigate(-1)} className="w-full">
            Вернуться назад
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>
        </div>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Headphones" size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Техническая поддержка
          </h1>
          <p className="text-gray-600">
            Опишите вашу проблему, и мы поможем её решить
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Icon name="User" size={16} className="inline mr-1" />
                Ваше имя
              </label>
              <Input
                value={currentUser?.name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Icon name="Mail" size={16} className="inline mr-1" />
                Email для связи
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Мы отправим ответ на этот адрес
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Icon name="AlertCircle" size={16} className="inline mr-1" />
                Тема обращения
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Кратко опишите проблему"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Icon name="FileText" size={16} className="inline mr-1" />
                Подробное описание
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Опишите проблему максимально подробно: что произошло, какие действия вы совершали, есть ли сообщения об ошибках"
                rows={6}
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Как мы поможем:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Ответим на email в течение 24 часов</li>
                    <li>Предложим решение проблемы</li>
                    <li>Проконсультируем по функционалу</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Или напишите нам напрямую:</p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} className="text-gray-500" />
                  <span className="font-medium">Техподдержка:</span>
                  <a href="mailto:support@nasha-semiya.ru" className="text-blue-600 hover:underline">
                    support@nasha-semiya.ru
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={16} className="text-gray-500" />
                  <span className="font-medium">Общие вопросы:</span>
                  <a href="mailto:info@nasha-semiya.ru" className="text-blue-600 hover:underline">
                    info@nasha-semiya.ru
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="CreditCard" size={16} className="text-gray-500" />
                  <span className="font-medium">Вопросы по оплате:</span>
                  <a href="mailto:payment@nasha-semiya.ru" className="text-blue-600 hover:underline">
                    payment@nasha-semiya.ru
                  </a>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 text-lg"
            >
              {submitting ? (
                <>
                  <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить обращение
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}