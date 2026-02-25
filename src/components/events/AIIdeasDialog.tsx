import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionLimits } from '@/hooks/useSubscriptionLimits';
import { useNavigate } from 'react-router-dom';
import func2url from '../../../backend/func2url.json';

const API_URL = func2url['event-ai-ideas'];

interface AIIdeasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventType: string;
}

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

export default function AIIdeasDialog({ open, onOpenChange, eventType }: AIIdeasDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Получаем familyId из userData
  const getFamilyId = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.family_id || null;
      }
      return localStorage.getItem('familyId') || null;
    } catch {
      return null;
    }
  };
  
  const familyId = getFamilyId();
  const { incrementUsage, isPremium, aiRequestsAllowed, limits } = useSubscriptionLimits(familyId);

  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState('');
  const [formData, setFormData] = useState({
    age: '',
    budget: '',
    theme: '',
    requestType: 'general'
  });

  const requestTypeLabels: Record<string, string> = {
    general: 'Общие рекомендации',
    theme: 'Идеи тематики',
    menu: 'Меню',
    activities: 'Игры и развлечения',
    budget: 'Распределение бюджета'
  };

  const handleGenerate = async () => {
    // Логирование для отладки
    console.log('[AIIdeasDialog] Limits check:', {
      familyId,
      aiRequestsAllowed,
      isPremium,
      limits: JSON.stringify(limits, null, 2)
    });

    // Проверка лимитов
    if (!aiRequestsAllowed) {
      toast({
        title: '⚠️ Лимит AI-запросов исчерпан',
        description: isPremium 
          ? 'Произошла ошибка. Обратитесь в поддержку.'
          : `Вы использовали ${limits?.limits?.ai_requests?.used || 0} из ${limits?.limits?.ai_requests?.limit || 5} бесплатных запросов сегодня. Обновитесь до Premium!`,
        variant: 'destructive',
        action: !isPremium ? (
          <Button 
            size="sm" 
            onClick={() => { onOpenChange(false); navigate('/pricing'); }}
            className="bg-gradient-to-r from-purple-500 to-indigo-600"
          >
            Перейти на Premium
          </Button>
        ) : undefined
      });
      return;
    }

    setLoading(true);
    setIdeas('');

    try {
      // Инкрементируем счётчик
      await incrementUsage('ai_requests');

      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          eventType,
          age: formData.age ? parseInt(formData.age) : null,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          theme: formData.theme || null,
          requestType: formData.requestType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIdeas(data.ideas);
      } else {
        throw new Error('Failed to generate ideas');
      }
    } catch (error) {
      console.error('[AIIdeas] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить идеи от ИИ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="Sparkles" className="text-purple-500" />
            ИИ-помощник по организации праздника
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Возраст (необязательно)</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Бюджет, ₽ (необязательно)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="50000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Тема (необязательно)</Label>
            <Input
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              placeholder="Супергерои, Космос, Единороги..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestType">Что нужно?</Label>
            <Select value={formData.requestType} onValueChange={(value) => setFormData({ ...formData, requestType: value })}>
              <SelectTrigger id="requestType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(requestTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Icon name="Loader2" className="animate-spin" size={16} />
                Генерирую идеи...
              </>
            ) : (
              <>
                <Icon name="Sparkles" size={16} />
                Получить идеи от ИИ
              </>
            )}
          </Button>

          {ideas && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Lightbulb" className="text-purple-500" />
                <h3 className="font-bold text-lg">Рекомендации ИИ:</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                  {ideas}
                </pre>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}