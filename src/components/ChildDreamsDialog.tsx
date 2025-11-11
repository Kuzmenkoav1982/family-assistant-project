import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { FamilyMember, Dream } from '@/types/family.types';

interface ChildDreamsDialogProps {
  child: FamilyMember;
  onUpdate: (updatedChild: FamilyMember) => void;
}

export function ChildDreamsDialog({ child, onUpdate }: ChildDreamsDialogProps) {
  const [newDream, setNewDream] = useState({ title: '', targetAmount: '' });
  const dreams = child.dreams || [];
  const piggyBank = child.piggyBank || 0;

  const addDream = () => {
    if (!newDream.title) return;
    
    const dream: Dream = {
      id: Date.now().toString(),
      title: newDream.title,
      targetAmount: newDream.targetAmount ? parseInt(newDream.targetAmount) : undefined,
      savedAmount: 0,
      createdAt: new Date().toISOString(),
    };

    onUpdate({
      ...child,
      dreams: [...dreams, dream],
    });

    setNewDream({ title: '', targetAmount: '' });
  };

  const updateDreamSavings = (dreamId: string, amount: number) => {
    const updatedDreams = dreams.map(d =>
      d.id === dreamId
        ? { ...d, savedAmount: (d.savedAmount || 0) + amount }
        : d
    );

    onUpdate({
      ...child,
      dreams: updatedDreams,
      piggyBank: Math.max(0, piggyBank - amount),
    });
  };

  const addToPiggyBank = (amount: number) => {
    onUpdate({
      ...child,
      piggyBank: piggyBank + amount,
    });
  };

  const deleteDream = (dreamId: string) => {
    const updatedDreams = dreams.filter(d => d.id !== dreamId);
    onUpdate({
      ...child,
      dreams: updatedDreams,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-purple-300 hover:bg-purple-50">
          <Icon name="Sparkles" size={14} className="mr-1" />
          Мечты
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-3xl">{child.avatar}</span>
            <div>
              Мечты {child.name}
              <p className="text-sm font-normal text-muted-foreground">
                Пусть мечтает и копит на желаемое
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🐷</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Копилка</h3>
                    <p className="text-sm text-muted-foreground">Накопления</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-yellow-700">
                  {piggyBank} ₽
                </div>
              </div>
              <div className="flex gap-2">
                {[50, 100, 200, 500].map(amount => (
                  <Button
                    key={amount}
                    size="sm"
                    variant="outline"
                    onClick={() => addToPiggyBank(amount)}
                    className="flex-1 border-yellow-400 hover:bg-yellow-100"
                  >
                    +{amount} ₽
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Icon name="Star" size={20} className="text-purple-600" />
              Список мечт
            </h3>
            
            {dreams.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Пока нет мечт. Добавьте первую!
              </p>
            ) : (
              <div className="space-y-3">
                {dreams.map(dream => {
                  const progress = dream.targetAmount
                    ? ((dream.savedAmount || 0) / dream.targetAmount) * 100
                    : 0;
                  const remaining = dream.targetAmount
                    ? dream.targetAmount - (dream.savedAmount || 0)
                    : 0;

                  return (
                    <Card key={dream.id} className="border-purple-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold flex items-center gap-2">
                              ✨ {dream.title}
                            </h4>
                            {dream.targetAmount && (
                              <div className="mt-2 space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    Накоплено: {dream.savedAmount || 0} ₽ / {dream.targetAmount} ₽
                                  </span>
                                  <span className="font-medium text-purple-600">
                                    {remaining > 0 ? `Осталось: ${remaining} ₽` : '🎉 Достигнуто!'}
                                  </span>
                                </div>
                                <Progress value={Math.min(progress, 100)} className="h-2" />
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDream(dream.id)}
                          >
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </div>
                        {dream.targetAmount && remaining > 0 && (
                          <div className="flex gap-2 mt-3">
                            {[50, 100, 200].map(amount => (
                              <Button
                                key={amount}
                                size="sm"
                                variant="outline"
                                onClick={() => updateDreamSavings(dream.id, amount)}
                                disabled={piggyBank < amount}
                                className="flex-1"
                              >
                                Перевести {amount} ₽
                              </Button>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Card className="border-2 border-dashed border-purple-300">
            <CardContent className="pt-4">
              <h4 className="font-bold mb-3 flex items-center gap-2">
                <Icon name="Plus" size={16} />
                Добавить новую мечту
              </h4>
              <div className="space-y-3">
                <Input
                  placeholder="Название мечты (например: Велосипед, Планшет)"
                  value={newDream.title}
                  onChange={(e) => setNewDream({ ...newDream, title: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Сумма (необязательно)"
                  value={newDream.targetAmount}
                  onChange={(e) => setNewDream({ ...newDream, targetAmount: e.target.value })}
                />
                <Button onClick={addDream} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Icon name="Sparkles" size={16} className="mr-2" />
                  Добавить мечту
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
