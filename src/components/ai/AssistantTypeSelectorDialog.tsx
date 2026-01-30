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

  const handleTypeSelect = (type: 'neutral' | 'domovoy') => {
    setSelectedType(type);
    setCustomName('');
  };

  const handleConfirm = () => {
    if (!selectedType) return;

    if (selectedType === 'neutral') {
      if (!customName.trim()) {
        return;
      }
      setAssistantName(customName.trim());
      setAssistantType('neutral');
    } else {
      setAssistantName(customName.trim() || 'Домовой');
      setAssistantType('domovoy');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl flex items-center gap-2">
            <Icon name="Sparkles" size={24} className="text-purple-600" />
            🏠 Выберите вашего помощника
          </DialogTitle>
          <DialogDescription className="text-sm">
            AI-ассистент будет помогать вам в организации семейной жизни
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 md:space-y-4 py-3 md:py-4">
          <div
            onClick={() => handleTypeSelect('neutral')}
            className={`cursor-pointer rounded-xl border-2 p-4 md:p-6 transition-all ${
              selectedType === 'neutral'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <img src="https://cdn.poehali.dev/files/AI-ассистент.jpeg" alt="AI Ассистент" className="w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Нейтральный AI-ассистент</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-3 md:mb-4">
                  Практичный помощник без персонажа. Деловой стиль общения.
                </p>
                {selectedType === 'neutral' && (
                  <div className="space-y-2">
                    <Label className="text-sm">Имя ассистента</Label>
                    <Input
                      placeholder="Например: Алекс"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            onClick={() => handleTypeSelect('domovoy')}
            className={`cursor-pointer rounded-xl border-2 p-4 md:p-6 transition-all ${
              selectedType === 'domovoy'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-950'
                : 'border-gray-200 hover:border-amber-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-3 md:gap-4">
              <img src="https://cdn.poehali.dev/files/Домовой.jpeg" alt="Домовой" className="w-12 h-12 md:w-16 md:h-16 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">Домовой - хранитель очага</h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-2 md:mb-3">
                  Добрый дух славянской культуры. Оберегает семью и дом, говорит тёплым языком.
                </p>
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg mb-2">
                  <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200">
                    ✨ Основан на славянском фольклоре
                  </p>
                </div>
                {selectedType === 'domovoy' && (
                  <div className="space-y-2 mt-3">
                    <Label className="text-sm">Придумайте имя Домовому (опционально)</Label>
                    <Input
                      placeholder="Например: Кузя, Нафаня, Домовёнок..."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">Оставьте пустым для имени "Домовой"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 md:pt-4 border-t">
          <p className="text-xs md:text-sm text-gray-500">
            ℹ️ Вы сможете изменить выбор в любой момент в настройках
          </p>
          <Button
            onClick={handleConfirm}
            disabled={!selectedType || (selectedType === 'neutral' && !customName.trim())}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Icon name="Home" className="mr-2" size={18} />
            {selectedType === 'domovoy' ? 'Выбрать Домового' : 'Выбрать помощника'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}