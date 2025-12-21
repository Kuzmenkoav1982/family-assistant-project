import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useAIAssistant } from '@/contexts/AIAssistantContext';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssistantTypeSelectorDialog({ open, onOpenChange }: Props) {
  const { setAssistantType, setAssistantName } = useAIAssistant();
  const [selectedType, setSelectedType] = useState<'neutral' | 'domovoy' | null>(null);
  const [customName, setCustomName] = useState('');

  const handleConfirm = () => {
    if (!selectedType) return;

    if (selectedType === 'neutral') {
      if (!customName.trim()) {
        return;
      }
      setAssistantName(customName.trim());
      setAssistantType('neutral');
    } else {
      setAssistantName('Домовой');
      setAssistantType('domovoy');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Icon name="Sparkles" size={28} className="text-purple-600" />
            Выберите вашего помощника
          </DialogTitle>
          <DialogDescription>
            Выберите тип AI-ассистента, который будет помогать вашей семье
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            onClick={() => setSelectedType('neutral')}
            className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
              selectedType === 'neutral'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <img src="https://cdn.poehali.dev/files/AI-ассистент.jpeg" alt="AI Ассистент" className="w-16 h-16 rounded-full" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Нейтральный AI-ассистент</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Практичный помощник без персонажа. Деловой, точный, современный стиль общения.
                </p>
                {selectedType === 'neutral' && (
                  <div className="space-y-2">
                    <Label>Имя ассистента</Label>
                    <Input
                      placeholder="Введите имя (например, Алекс)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            onClick={() => setSelectedType('domovoy')}
            className={`cursor-pointer rounded-xl border-2 p-6 transition-all ${
              selectedType === 'domovoy'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <img src="https://cdn.poehali.dev/files/Домовой.jpeg" alt="Домовой" className="w-16 h-16 rounded-full" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Домовой - хранитель очага</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Добрый дух славянской культуры. Оберегает семью и дом, помогает в хозяйстве.
                  Тёплый, традиционный, семейный стиль общения.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                    🧙‍♂️ Мудрый советник
                  </span>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                    🏡 Хранитель семьи
                  </span>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                    📖 Славянские традиции
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-500">
            ℹ️ Вы сможете изменить выбор в настройках
          </p>
          <Button
            onClick={handleConfirm}
            disabled={!selectedType || (selectedType === 'neutral' && !customName.trim())}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Icon name="Check" className="mr-2" size={20} />
            Подтвердить выбор
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}