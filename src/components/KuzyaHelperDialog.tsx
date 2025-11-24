import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface KuzyaHelperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type HelpType = 'support' | 'review' | 'suggestion' | null;

export default function KuzyaHelperDialog({ open, onOpenChange }: KuzyaHelperDialogProps) {
  const [selectedType, setSelectedType] = useState<HelpType>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    description: '',
    rating: 5
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const resetForm = () => {
    setSelectedType(null);
    setFormData({ name: '', email: '', title: '', description: '', rating: 5 });
    setSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      const emailSubject = selectedType === 'support' 
        ? `[ПОДДЕРЖКА] ${formData.title}`
        : selectedType === 'review'
        ? `[ОТЗЫВ] ${formData.title}`
        : `[ПРЕДЛОЖЕНИЕ] ${formData.title}`;

      const emailBody = `
От: ${formData.name}
Email: ${formData.email}
${selectedType === 'review' ? `Оценка: ${formData.rating}/5` : ''}

${formData.description}
      `;

      const mailtoLink = `mailto:ip.kuzmenkoav@yandex.ru?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;

      setSent(true);
      setTimeout(() => {
        resetForm();
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending feedback:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <img 
              src="https://cdn.poehali.dev/files/7f859c4f-787d-4dbe-98b9-e8d6ba7ba081.png"
              alt="Кузя"
              className="w-16 h-16 object-contain"
            />
            <div>
              <div>Привет! Я Кузя 👋</div>
              <div className="text-sm text-gray-600 font-normal">Ваш помощник в "Наша семья"</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {!selectedType && !sent && (
          <div className="space-y-4 py-4">
            <p className="text-gray-700">Чем могу помочь?</p>
            <div className="grid gap-3">
              <Button
                onClick={() => setSelectedType('support')}
                variant="outline"
                className="h-auto py-4 flex items-start gap-3 hover:border-blue-500 hover:bg-blue-50"
              >
                <Icon name="Headphones" size={24} className="text-blue-600 mt-1" />
                <div className="text-left">
                  <div className="font-semibold">Техническая поддержка</div>
                  <div className="text-sm text-gray-600">Возникла проблема или нужна помощь?</div>
                </div>
              </Button>

              <Button
                onClick={() => setSelectedType('review')}
                variant="outline"
                className="h-auto py-4 flex items-start gap-3 hover:border-green-500 hover:bg-green-50"
              >
                <Icon name="Star" size={24} className="text-green-600 mt-1" />
                <div className="text-left">
                  <div className="font-semibold">Оставить отзыв</div>
                  <div className="text-sm text-gray-600">Поделитесь впечатлениями о сервисе</div>
                </div>
              </Button>

              <Button
                onClick={() => setSelectedType('suggestion')}
                variant="outline"
                className="h-auto py-4 flex items-start gap-3 hover:border-purple-500 hover:bg-purple-50"
              >
                <Icon name="Lightbulb" size={24} className="text-purple-600 mt-1" />
                <div className="text-left">
                  <div className="font-semibold">Предложение</div>
                  <div className="text-sm text-gray-600">Идеи по улучшению сервиса</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {selectedType && !sent && (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              className="mb-2"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>

            <div>
              <Badge className="mb-2">
                {selectedType === 'support' && '🛠️ Техническая поддержка'}
                {selectedType === 'review' && '⭐ Отзыв'}
                {selectedType === 'suggestion' && '💡 Предложение'}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Ваше имя *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Как к вам обращаться?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (необязательно)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Для обратной связи"
              />
            </div>

            {selectedType === 'review' && (
              <div className="space-y-2">
                <Label>Ваша оценка *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-3xl transition-transform hover:scale-110"
                    >
                      {star <= formData.rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Тема *</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={
                  selectedType === 'support' 
                    ? 'Кратко опишите проблему'
                    : selectedType === 'review'
                    ? 'О чём ваш отзыв?'
                    : 'Ваша идея в одном предложении'
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Подробное описание *</Label>
              <Textarea
                id="description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={
                  selectedType === 'support'
                    ? 'Подробно опишите проблему, шаги для её воспроизведения...'
                    : selectedType === 'review'
                    ? 'Что вам понравилось или не понравилось?'
                    : 'Расскажите подробнее о вашей идее...'
                }
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={sending} className="flex-1">
                {sending ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Отправить
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </form>
        )}

        {sent && (
          <div className="py-8 text-center space-y-4">
            <div className="text-6xl">✅</div>
            <div className="text-xl font-semibold text-green-600">Спасибо!</div>
            <p className="text-gray-600">
              Ваше сообщение будет отправлено через почтовый клиент.<br />
              Мы свяжемся с вами в ближайшее время!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
