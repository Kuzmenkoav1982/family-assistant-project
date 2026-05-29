import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import func2url from '../../backend/func2url.json';

const CATEGORIES = [
  { id: 'auth',        label: 'Проблема со входом',       icon: 'LogIn' },
  { id: 'bug',         label: 'Ошибка / баг',             icon: 'Bug' },
  { id: 'payment',     label: 'Оплата / подписка',        icon: 'CreditCard' },
  { id: 'question',    label: 'Вопрос по сервису',        icon: 'HelpCircle' },
  { id: 'suggestion',  label: 'Предложение / идея',       icon: 'Lightbulb' },
  { id: 'other',       label: 'Другое',                   icon: 'MoreHorizontal' },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: number; email: string } | null>(null);

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    email: currentUser?.email || '',
  });

  const feedbackUrl = func2url['feedback' as keyof typeof func2url];

  const selectedCategory = CATEGORIES.find(c => c.id === formData.category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const titleWithCategory = selectedCategory
      ? `[${selectedCategory.label}] ${formData.title}`
      : formData.title;

    try {
      const response = await fetch(feedbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'support',
          user_id: currentUser?.id || 'guest',
          user_name: currentUser?.name || 'Гость',
          user_email: formData.email,
          title: titleWithCategory,
          description: formData.description,
          rating: null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessData({
          id: data.id,
          email: formData.email || currentUser?.email || '',
        });
      } else {
        alert('Ошибка при отправке обращения');
      }
    } catch {
      alert('Ошибка при отправке обращения');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle2" size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Обращение отправлено!</h2>
          <p className="text-gray-500 mb-5">
            Мы получили ваш запрос и ответим в течение 24 часов
          </p>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
            {successData.id && (
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="Hash" size={15} className="text-gray-400 flex-shrink-0" />
                <span>Номер обращения: <strong className="text-gray-900">#{successData.id}</strong></span>
              </div>
            )}
            {successData.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Icon name="Mail" size={15} className="text-gray-400 flex-shrink-0" />
                <span>Ответ придёт на: <strong className="text-gray-900">{successData.email}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              <Icon name="Clock" size={15} className="text-gray-400 flex-shrink-0" />
              <span>Обычно отвечаем в течение <strong className="text-gray-900">24 часов</strong></span>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={() => navigate('/')} className="w-full">
              На главную
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSuccessData(null)}
            >
              Отправить ещё одно обращение
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <SectionPageFrame
      title="Поддержка"
      subtitle="Опишите проблему или вопрос — ответим на email"
      backPath="/"
      variant="light"
      width="narrow"
    >
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Категория */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Tag" size={16} className="inline mr-1" />
              Тема обращения
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${
                    formData.category === cat.id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={cat.icon} size={14} className="flex-shrink-0" />
                  <span className="leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="Mail" size={16} className="inline mr-1" />
              Email для ответа
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <Icon name="Info" size={12} />
              Ответ придёт именно на этот адрес
            </p>
          </div>

          {/* Краткая тема */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="AlertCircle" size={16} className="inline mr-1" />
              Кратко о проблеме
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={
                formData.category === 'auth' ? 'Например: не могу войти после смены пароля' :
                formData.category === 'bug' ? 'Например: не загружается страница заданий' :
                formData.category === 'payment' ? 'Например: списали деньги, подписка не активирована' :
                'Опишите в одном предложении'
              }
              required
            />
          </div>

          {/* Подробное описание */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Icon name="FileText" size={16} className="inline mr-1" />
              Подробное описание
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Что именно произошло? Какие шаги вы делали? Есть ли текст ошибки?"
              rows={5}
              required
            />
          </div>

          {/* Инфо-блок */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2.5 text-sm text-blue-800">
            <Icon name="Clock" size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p>Обычно отвечаем в течение <strong>24 часов</strong>. Ответ придёт на указанный email.</p>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-12 text-base"
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
    </SectionPageFrame>
  );
}
