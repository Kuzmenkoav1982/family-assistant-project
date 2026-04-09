import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useAIAssistant } from '@/contexts/AIAssistantContext';
import { useToast } from '@/hooks/use-toast';
import AssistantTypeSelectorDialog from '@/components/AssistantTypeSelectorDialog';

export default function AssistantSettings() {
  const { assistantType, assistantName, assistantLevel, setAssistantName, resetSelection } = useAIAssistant();
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(assistantName);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleSaveName = async () => {
    if (newName.trim()) {
      await setAssistantName(newName.trim());
      setIsEditingName(false);
      toast({
        title: '✅ Имя изменено',
        description: `Теперь ваш ассистент - ${newName.trim()}`
      });
    }
  };

  const handleChangeType = () => {
    resetSelection();
    setShowTypeSelector(true);
  };

  if (!assistantType) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Bot" size={24} />
            AI-ассистент
          </CardTitle>
          <CardDescription>
            Выберите тип помощника для вашей семьи
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowTypeSelector(true)} className="w-full">
            <Icon name="Sparkles" className="mr-2" size={18} />
            Выбрать ассистента
          </Button>
          <AssistantTypeSelectorDialog
            open={showTypeSelector}
            onOpenChange={setShowTypeSelector}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {assistantType === 'domovoy' ? (
              <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/7b22f58e-5e92-433c-a828-92484495a246.jpg" alt="Домовой" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI Ассистент" className="w-8 h-8 rounded-full" />
            )}
            Мой AI-ассистент
          </CardTitle>
          <CardDescription>
            Управление настройками вашего помощника
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Текущий тип */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {assistantType === 'domovoy' ? (
                    <><img src="https://cdn.poehali.dev/files/Семейный помощник.png" alt="Домовой" className="w-6 h-6 rounded-full" /> Домовой</>
                  ) : (
                    <><img src="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4a8cd84b-8eb3-43f6-b24c-712f67d25a29.jpg" alt="AI Ассистент" className="w-6 h-6 rounded-full" /> Нейтральный AI</>
                  )}
                  {assistantType === 'domovoy' && assistantLevel > 1 && (
                    <Badge className="bg-amber-500">
                      Уровень {assistantLevel}
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600">
                  {assistantType === 'domovoy'
                    ? 'Хранитель очага, добрый дух семьи'
                    : 'Практичный помощник'}
                </p>
              </div>
            </div>

            {/* Имя */}
            <div className="space-y-2">
              <Label>Имя ассистента</Label>
              {isEditingName ? (
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Введите имя"
                    maxLength={30}
                  />
                  <Button onClick={handleSaveName} size="sm">
                    <Icon name="Check" size={16} />
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditingName(false);
                      setNewName(assistantName);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <span className="font-medium">{assistantName || 'Не задано'}</span>
                  <Button
                    onClick={() => setIsEditingName(true)}
                    variant="ghost"
                    size="sm"
                  >
                    <Icon name="Pencil" size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Информация о Домовом */}
          {assistantType === 'domovoy' && (
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/domovoy'}
                variant="outline"
                className="w-full"
              >
                <Icon name="BookOpen" className="mr-2" size={18} />
                Узнать больше о Домовом
              </Button>
            </div>
          )}

          {/* Смена типа */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleChangeType}
              variant="outline"
              className="w-full"
            >
              <Icon name="RefreshCw" className="mr-2" size={18} />
              Сменить тип ассистента
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              История общения сохранится
            </p>
          </div>
        </CardContent>
      </Card>

      <AssistantTypeSelectorDialog
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
      />
    </>
  );
}