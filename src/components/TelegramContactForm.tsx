import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const TELEGRAM_NOTIFY_API = 'https://functions.poehali.dev/15a6a286-e031-47fd-8e26-4c0e04d0ee27';

const services = [
  { value: 'nanny', label: '👶 Няня', description: 'Профессиональный уход за детьми' },
  { value: 'cook', label: '👨‍🍳 Повар', description: 'Приготовление домашней еды' },
  { value: 'gardener', label: '🌱 Садовник', description: 'Уход за садом и растениями' },
  { value: 'cleaning', label: '🧹 Уборка', description: 'Поддержание чистоты в доме' },
  { value: 'tutor', label: '📚 Репетитор', description: 'Обучение и развитие' },
  { value: 'driver', label: '🚗 Водитель', description: 'Транспортные услуги' }
];

interface TelegramContactFormProps {
  defaultService?: string;
}

export function TelegramContactForm({ defaultService }: TelegramContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service: defaultService || '',
    name: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service || !formData.name || !formData.phone) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Укажите услугу, имя и телефон',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedService = services.find(s => s.value === formData.service);
      
      const response = await fetch(TELEGRAM_NOTIFY_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: selectedService?.label || formData.service,
          name: formData.name,
          phone: formData.phone,
          message: formData.message,
          chat_id: window.location.search.includes('tgWebAppData') 
            ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id 
            : undefined
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: '✅ Заявка отправлена!',
          description: 'Мы свяжемся с вами в ближайшее время',
        });
        
        setFormData({
          service: defaultService || '',
          name: '',
          phone: '',
          message: ''
        });
      } else {
        throw new Error(result.error || 'Ошибка отправки');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Ошибка отправки',
        description: 'Попробуйте позже или свяжитесь с нами напрямую',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="MessageSquare" size={24} />
          Оставить заявку
        </CardTitle>
        <CardDescription>
          Заполните форму и мы свяжемся с вами в течение часа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="service">Нужная услуга *</Label>
            <Select 
              value={formData.service} 
              onValueChange={(value) => setFormData({ ...formData, service: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.value} value={service.value}>
                    <div>
                      <div className="font-medium">{service.label}</div>
                      <div className="text-xs text-gray-500">{service.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="name">Ваше имя *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Анна"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Телефон *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (900) 123-45-67"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Дополнительная информация</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Укажите удобное время для звонка, особые пожелания..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={16} className="mr-2" />
                Отправить заявку
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
