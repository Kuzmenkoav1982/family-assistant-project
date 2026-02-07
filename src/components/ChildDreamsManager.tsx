import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { Dream } from '@/types/family.types';

interface ChildDreamsManagerProps {
  dreams: Dream[];
  onAddDream: (dream: Omit<Dream, 'id' | 'createdAt'>) => void;
  onUpdateDream: (dreamId: string, updates: Partial<Dream>) => void;
  onDeleteDream?: (dreamId: string) => void;
}

export function ChildDreamsManager({ dreams, onAddDream, onUpdateDream, onDeleteDream }: ChildDreamsManagerProps) {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [editingDream, setEditingDream] = useState<Dream | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const getAIAdvice = (dream: Dream): string => {
    const adviceList = [
      `Начни с малого: составь план на неделю для достижения "${dream.title}"`,
      `Совет: изучи истории людей, которые достигли похожей цели`,
      `Попробуй разбить мечту на 5 маленьких шагов и выполняй по одному в неделю`,
      `Расскажи родителям о своей мечте - они обязательно помогут!`,
      `Найди книгу или видео об этом и узнай больше`,
    ];
    
    return adviceList[Math.floor(Math.random() * adviceList.length)];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Icon name="Sparkles" className="text-yellow-500" />
          Мои мечты
        </h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Icon name="Plus" className="mr-2" size={16} />
              Добавить мечту
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая мечта</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onAddDream({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                targetAmount: formData.get('targetAmount') ? Number(formData.get('targetAmount')) : undefined,
                savedAmount: 0,
                icon: '✨'
              });
              (e.target as HTMLFormElement).reset();
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Моя мечта *</label>
                <Input name="title" placeholder="Например: Купить велосипед" required />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <Input name="description" placeholder="Почему это важно для меня?" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Нужно денег (₽)</label>
                <Input name="targetAmount" type="number" min="0" placeholder="Если нужны деньги" />
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                Сохранить мечту
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {dreams.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-gray-300" />
              <p>У тебя пока нет записанных мечт</p>
              <p className="text-sm mt-2">Добавь свою первую мечту и начни к ней идти!</p>
            </CardContent>
          </Card>
        ) : (
          dreams.map((dream) => {
            const progress = dream.targetAmount && dream.savedAmount 
              ? (dream.savedAmount / dream.targetAmount) * 100 
              : 0;

            return (
              <Card key={dream.id} className="hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{dream.icon}</span>
                      {dream.title}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setEditingDream(dream);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Icon name="Pencil" size={16} className="text-blue-500" />
                      </Button>
                      {onDeleteDream && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Удалить мечту "${dream.title}"?`)) {
                              onDeleteDream(dream.id);
                            }
                          }}
                        >
                          <Icon name="Trash2" size={16} className="text-red-500" />
                        </Button>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedDream(dream)}
                          >
                            <Icon name="Lightbulb" size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>💡 Совет от ИИ</DialogTitle>
                          </DialogHeader>
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm">{getAIAdvice(dream)}</p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dream.description && (
                    <p className="text-sm text-muted-foreground mb-4">{dream.description}</p>
                  )}
                  
                  {dream.targetAmount && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Накоплено:</span>
                        <span className="font-bold">
                          {dream.savedAmount || 0} ₽ / {dream.targetAmount} ₽
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            const amount = prompt('Сколько ты накопил?');
                            if (amount && !isNaN(Number(amount))) {
                              onUpdateDream(dream.id, {
                                savedAmount: (dream.savedAmount || 0) + Number(amount)
                              });
                            }
                          }}
                        >
                          <Icon name="Plus" size={14} className="mr-1" />
                          Добавить
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Диалог редактирования мечты */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать мечту</DialogTitle>
          </DialogHeader>
          {editingDream && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              onUpdateDream(editingDream.id, {
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                targetAmount: formData.get('targetAmount') ? Number(formData.get('targetAmount')) : undefined,
              });
              setIsEditDialogOpen(false);
              setEditingDream(null);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Моя мечта *</label>
                <Input 
                  name="title" 
                  defaultValue={editingDream.title}
                  placeholder="Например: Купить велосипед" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <Input 
                  name="description" 
                  defaultValue={editingDream.description || ''}
                  placeholder="Почему это важно для меня?" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Нужно денег (₽)</label>
                <Input 
                  name="targetAmount" 
                  type="number" 
                  min="0"
                  defaultValue={editingDream.targetAmount || ''}
                  placeholder="Если нужны деньги" 
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500">
                  Сохранить изменения
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingDream(null);
                  }}
                >
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}