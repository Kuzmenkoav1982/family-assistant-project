import { useState, useEffect, useRef } from 'react';
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
import type { AssistantType } from '@/contexts/AIAssistantContext';

interface AssistantTypeSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AssistantTypeSelectorDialog({
  open,
  onOpenChange
}: AssistantTypeSelectorDialogProps) {
  const { setAssistantType, setAssistantName } = useAIAssistant();
  const [selectedType, setSelectedType] = useState<AssistantType | null>(null);
  const [customName, setCustomName] = useState('');
  const [domovoyName, setDomovoyName] = useState('');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!selectedType || isProcessing) {
      console.log('[AssistantSelector] Confirm blocked:', { selectedType, isProcessing });
      return;
    }

    setIsProcessing(true);
    console.log('[AssistantSelector] Confirm clicked, type:', selectedType);

    try {
      await setAssistantType(selectedType);
      
      if (selectedType === 'neutral' && customName.trim()) {
        await setAssistantName(customName.trim());
      } else if (selectedType === 'domovoy') {
        await setAssistantName(domovoyName.trim() || 'Домовой');
      }

      console.log('[AssistantSelector] Setup completed, closing dialog');
      
      // Задержка для iOS
      setTimeout(() => {
        onOpenChange(false);
      }, 100);
    } catch (error) {
      console.error('[AssistantSelector] Error during confirmation:', error);
      setIsProcessing(false);
    }
  };

  const isValid = selectedType && (
    (selectedType === 'neutral' && customName.trim().length > 0) ||
    (selectedType === 'domovoy')
  );

  // Прокрутка к кнопке при выборе типа (для iOS с большим шрифтом)
  useEffect(() => {
    if (selectedType && buttonRef.current) {
      setTimeout(() => {
        buttonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [selectedType]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (isOpen || isValid) {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            🏠 Выберите вашего помощника
          </DialogTitle>
          <DialogDescription>
            AI-ассистент будет помогать вам в организации семейной жизни
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Нейтральный AI */}
          <div
            className={`p-6 cursor-pointer transition-all rounded-lg border-2 ${
              selectedType === 'neutral'
                ? 'border-blue-500 border-2 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedType('neutral')}
          >
            <div className="flex items-start gap-4">
              <img src="https://cdn.poehali.dev/files/AI-ассистент.jpeg" alt="AI Ассистент" className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  Нейтральный AI-ассистент
                  {selectedType === 'neutral' && (
                    <Icon name="CheckCircle2" className="text-blue-500" size={20} />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Практичный помощник без персонажа. Деловой стиль общения.
                </p>
                
                {selectedType === 'neutral' && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="custom-name">Придумайте имя ассистенту</Label>
                    <Input
                      id="custom-name"
                      placeholder="Например: Алиса, Помощник, AI-друг..."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      maxLength={30}
                    />
                    <p className="text-xs text-gray-500">
                      Это имя будет использоваться в диалогах
                    </p>
                    <Button
                      onClick={handleConfirm}
                      disabled={!customName.trim()}
                      className="w-full bg-blue-500 hover:bg-blue-600 mt-2"
                      size="lg"
                    >
                      <Icon name="Bot" className="mr-2" />
                      🤖 Выбрать этого ассистента
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Домовой */}
          <div
            className={`p-6 cursor-pointer transition-all rounded-lg border-2 ${
              selectedType === 'domovoy'
                ? 'border-amber-500 border-2 bg-amber-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => setSelectedType('domovoy')}
          >
            <div className="flex items-start gap-4">
              <img src="https://cdn.poehali.dev/files/Домовой.jpeg" alt="Домовой" className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  Домовой - хранитель очага
                  {selectedType === 'domovoy' && (
                    <Icon name="CheckCircle2" className="text-amber-500" size={20} />
                  )}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Добрый дух славянской культуры. Оберегает семью и дом, говорит тёплым языком.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100 px-3 py-1.5 rounded-full w-fit">
                  <Icon name="Sparkles" size={14} />
                  <span>Основан на славянском фольклоре</span>
                </div>
                
                {selectedType === 'domovoy' && (
                  <div className="space-y-2 pt-2 border-t mt-3">
                    <Label htmlFor="domovoy-name">Придумайте имя Домовому (опционально)</Label>
                    <Input
                      id="domovoy-name"
                      placeholder="Например: Кузя, Нафаня, Домовёнок..."
                      value={domovoyName}
                      onChange={(e) => setDomovoyName(e.target.value)}
                      maxLength={30}
                    />
                    <p className="text-xs text-gray-500">
                      Оставьте пустым для имени "Домовой"
                    </p>
                    <Button
                      onClick={handleConfirm}
                      className="w-full bg-amber-500 hover:bg-amber-600 mt-2"
                      size="lg"
                    >
                      <Icon name="Home" className="mr-2" />
                      🏠 Выбрать Домового прямо сейчас
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
              <Icon name="Info" size={14} />
              Вы сможете изменить выбор в любой момент в настройках
            </p>
            <p className="text-xs text-center text-gray-400">
              Экран не реагирует? <a href="/debug-auth" className="text-blue-500 underline">Открыть аварийную страницу</a>
            </p>
          </div>
        </div>

        <div className="flex gap-3 sticky bottom-0 bg-white pt-4 pb-2 border-t mt-4">
          <Button
            ref={buttonRef}
            onClick={handleConfirm}
            disabled={!isValid || isProcessing}
            className="flex-1"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Icon name="Loader" className="mr-2 animate-spin" />
                Применяем...
              </>
            ) : (
              <>
                {selectedType === 'neutral' && '🤖 Выбрать нейтрального ассистента'}
                {selectedType === 'domovoy' && '🏠 Выбрать Домового'}
                {!selectedType && 'Выберите тип ассистента'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}