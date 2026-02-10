import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useFamilyMembers } from '@/contexts/FamilyMembersContext';

export default function Purchases() {
  const { familyMembers } = useFamilyMembers();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<'winter' | 'spring' | 'summer' | 'autumn'>('winter');
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Одежда',
    estimated_cost: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    member_id: ''
  });

  const seasonLabels = {
    winter: 'зиму',
    spring: 'весну',
    summer: 'лето',
    autumn: 'осень'
  };

  const openAddDialog = (season: 'winter' | 'spring' | 'summer' | 'autumn') => {
    setCurrentSeason(season);
    setIsDialogOpen(true);
  };

  const handleAddPurchase = () => {
    console.log('Добавление покупки:', newItem, 'сезон:', currentSeason);
    setIsDialogOpen(false);
    setNewItem({ name: '', category: 'Одежда', estimated_cost: '', priority: 'medium', member_id: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Icon name="ShoppingBag" size={32} className="text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">План покупок</h1>
            <p className="text-gray-600">Планируйте покупки для всей семьи по сезонам</p>
          </div>
        </div>

        <Card 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl">💡</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1 flex items-center gap-2">
                  <Icon name="Info" size={16} />
                  Как работает План покупок
                  <Icon 
                    name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                    size={18} 
                    className="ml-auto text-blue-600"
                  />
                </h4>
                {isExpanded && (
                  <>
                    <p className="text-sm text-blue-800 mb-3">
                      Здесь вы можете планировать покупки для всей семьи: одежду, обувь, технику и другие необходимые вещи.
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-start gap-2 text-sm text-blue-700">
                        <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                        <span>Планируйте покупки по сезонам: зима, весна, лето, осень</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-700">
                        <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                        <span>Указывайте для кого покупка — видите весь список членов семьи</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-700">
                        <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                        <span>Оценивайте стоимость и приоритет каждой покупки</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-blue-700">
                        <Icon name="Check" size={14} className="mt-0.5 flex-shrink-0" />
                        <span>Отмечайте купленные вещи, чтобы не забыть ничего важного</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="winter" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="winter" className="gap-2">
              ❄️ Зима
            </TabsTrigger>
            <TabsTrigger value="spring" className="gap-2">
              🌸 Весна
            </TabsTrigger>
            <TabsTrigger value="summer" className="gap-2">
              ☀️ Лето
            </TabsTrigger>
            <TabsTrigger value="autumn" className="gap-2">
              🍂 Осень
            </TabsTrigger>
          </TabsList>

          {(['winter', 'spring', 'summer', 'autumn'] as const).map((season) => (
            <TabsContent key={season} value={season} className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="ShoppingCart" size={24} />
                      План на {seasonLabels[season]}
                    </CardTitle>
                    <Button className="gap-2" onClick={() => openAddDialog(season)}>
                      <Icon name="Plus" size={16} />
                      Добавить покупку
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="ShoppingBag" size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>Покупок на этот сезон пока нет</p>
                    <p className="text-sm">Добавьте первую покупку в план</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="CheckCircle2" size={24} className="text-green-600" />
                    Куплено
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 text-center py-4">
                    Пока ничего не куплено
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                Добавить покупку на {seasonLabels[currentSeason]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название покупки *</Label>
                <Input 
                  placeholder="Например: Зимняя куртка" 
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <Label>Для кого</Label>
                <Select 
                  value={newItem.member_id}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, member_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите члена семьи" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Для всей семьи</SelectItem>
                    {familyMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.avatar || '👤'} {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Категория</Label>
                <Select 
                  value={newItem.category}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Одежда">Одежда</SelectItem>
                    <SelectItem value="Обувь">Обувь</SelectItem>
                    <SelectItem value="Техника">Техника</SelectItem>
                    <SelectItem value="Мебель">Мебель</SelectItem>
                    <SelectItem value="Спорт">Спорт</SelectItem>
                    <SelectItem value="Игрушки">Игрушки</SelectItem>
                    <SelectItem value="Школьные принадлежности">Школьные принадлежности</SelectItem>
                    <SelectItem value="Прочее">Прочее</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Примерная стоимость (₽)</Label>
                <Input 
                  type="number"
                  placeholder="5000" 
                  value={newItem.estimated_cost}
                  onChange={(e) => setNewItem(prev => ({ ...prev, estimated_cost: e.target.value }))}
                />
              </div>

              <div>
                <Label>Приоритет</Label>
                <Select 
                  value={newItem.priority}
                  onValueChange={(value) => setNewItem(prev => ({ ...prev, priority: value as 'high' | 'medium' | 'low' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">🔴 Срочно</SelectItem>
                    <SelectItem value="medium">🟡 Средний</SelectItem>
                    <SelectItem value="low">🟢 Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddPurchase} disabled={!newItem.name.trim()}>
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}