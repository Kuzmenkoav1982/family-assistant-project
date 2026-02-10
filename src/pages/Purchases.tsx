import { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { FamilyMembersContext } from '@/contexts/FamilyMembersContext';
import func2url from '../../backend/func2url.json';

interface Purchase {
  id: number;
  family_id: string;
  member_id?: string;
  season: 'winter' | 'spring' | 'summer' | 'autumn';
  name: string;
  category: string;
  estimated_cost?: number;
  priority: 'high' | 'medium' | 'low';
  purchased: boolean;
  purchase_date?: string;
  created_at: string;
}

export default function Purchases() {
  const familyContext = useContext(FamilyMembersContext);
  const familyMembers = familyContext?.members || [];
  const familyId = familyContext?.familyId;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<'winter' | 'spring' | 'summer' | 'autumn'>('winter');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
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

  const fetchPurchases = async () => {
    if (!familyId) return;
    setLoading(true);
    try {
      const response = await fetch(func2url.purchases, {
        headers: { 'X-User-Id': familyId }
      });
      const data = await response.json();
      setPurchases(data.purchases || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [familyId]);

  const openAddDialog = (season: 'winter' | 'spring' | 'summer' | 'autumn') => {
    setCurrentSeason(season);
    setIsDialogOpen(true);
  };

  const handleAddPurchase = async () => {
    if (!familyId || !newItem.name.trim()) return;
    
    try {
      const response = await fetch(func2url.purchases, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': familyId
        },
        body: JSON.stringify({
          ...newItem,
          season: currentSeason,
          estimated_cost: newItem.estimated_cost ? parseInt(newItem.estimated_cost) : undefined,
          member_id: newItem.member_id || undefined
        })
      });
      
      if (response.ok) {
        await fetchPurchases();
        setIsDialogOpen(false);
        setNewItem({ name: '', category: 'Одежда', estimated_cost: '', priority: 'medium', member_id: '' });
      }
    } catch (error) {
      console.error('Error adding purchase:', error);
      alert('Ошибка при добавлении покупки');
    }
  };

  const handleTogglePurchased = async (id: number, purchased: boolean) => {
    if (!familyId) return;
    
    try {
      const response = await fetch(`${func2url.purchases}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': familyId
        },
        body: JSON.stringify({
          purchased: !purchased,
          purchase_date: !purchased ? new Date().toISOString().split('T')[0] : undefined
        })
      });
      
      if (response.ok) {
        await fetchPurchases();
      }
    } catch (error) {
      console.error('Error toggling purchase:', error);
    }
  };

  const handleDeletePurchase = async (id: number) => {
    if (!familyId || !confirm('Удалить эту покупку?')) return;
    
    try {
      const response = await fetch(`${func2url.purchases}?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': familyId }
      });
      
      if (response.ok) {
        await fetchPurchases();
      }
    } catch (error) {
      console.error('Error deleting purchase:', error);
    }
  };

  const getSeasonPurchases = (season: string, purchased: boolean) => {
    return purchases.filter(p => p.season === season && p.purchased === purchased);
  };

  const getSeasonTotal = (season: string, purchased: boolean) => {
    return getSeasonPurchases(season, purchased)
      .reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  };

  const getMemberName = (memberId?: string) => {
    if (!memberId || memberId === 'family') return 'Для всей семьи';
    const member = familyMembers.find(m => m.id === memberId);
    return member ? `${member.avatar || '👤'} ${member.name}` : 'Неизвестно';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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

          {(['winter', 'spring', 'summer', 'autumn'] as const).map((season) => {
            const planned = getSeasonPurchases(season, false);
            const completed = getSeasonPurchases(season, true);
            const plannedTotal = getSeasonTotal(season, false);
            const completedTotal = getSeasonTotal(season, true);
            
            return (
              <TabsContent key={season} value={season} className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Icon name="ShoppingCart" size={24} />
                          План на {seasonLabels[season]}
                        </CardTitle>
                        {plannedTotal > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Общая сумма: <span className="font-semibold">{plannedTotal.toLocaleString()} ₽</span>
                          </p>
                        )}
                      </div>
                      <Button className="gap-2" onClick={() => openAddDialog(season)}>
                        <Icon name="Plus" size={16} />
                        Добавить покупку
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Загрузка...</p>
                      </div>
                    ) : planned.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Icon name="ShoppingBag" size={48} className="mx-auto mb-3 text-gray-300" />
                        <p>Покупок на этот сезон пока нет</p>
                        <p className="text-sm">Добавьте первую покупку в план</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {planned.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8"
                              onClick={() => handleTogglePurchased(item.id, item.purchased)}
                            >
                              <Icon name="Circle" size={20} className="text-gray-400" />
                            </Button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold">{item.name}</h4>
                                <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                  {item.priority === 'high' ? '🔴 Срочно' : item.priority === 'medium' ? '🟡 Средний' : '🟢 Низкий'}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                                <span>{item.category}</span>
                                <span>•</span>
                                <span>{getMemberName(item.member_id)}</span>
                                {item.estimated_cost && (
                                  <>
                                    <span>•</span>
                                    <span className="font-semibold">{item.estimated_cost.toLocaleString()} ₽</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePurchase(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Icon name="Trash2" size={18} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="CheckCircle2" size={24} className="text-green-600" />
                      Куплено
                      {completedTotal > 0 && (
                        <span className="text-sm font-normal text-gray-600 ml-2">
                          ({completedTotal.toLocaleString()} ₽)
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {completed.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Пока ничего не куплено
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {completed.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-8 w-8"
                              onClick={() => handleTogglePurchased(item.id, item.purchased)}
                            >
                              <Icon name="CheckCircle2" size={20} className="text-green-600" />
                            </Button>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-700">{item.name}</h4>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                                <span>{item.category}</span>
                                <span>•</span>
                                <span>{getMemberName(item.member_id)}</span>
                                {item.estimated_cost && (
                                  <>
                                    <span>•</span>
                                    <span className="font-semibold">{item.estimated_cost.toLocaleString()} ₽</span>
                                  </>
                                )}
                                {item.purchase_date && (
                                  <>
                                    <span>•</span>
                                    <span>Куплено: {new Date(item.purchase_date).toLocaleDateString('ru-RU')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePurchase(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Icon name="Trash2" size={18} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
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