import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useFamilyTraditions } from '@/hooks/useFamilyTraditions';
import type { TraditionItem } from '@/lib/familyTraditions/api';

const FREQ_LABEL: Record<string, string> = { weekly: 'Еженедельно', monthly: 'Ежемесячно', yearly: 'Ежегодно' };
const FREQ_COLOR: Record<string, string> = { weekly: 'bg-blue-500', monthly: 'bg-purple-500', yearly: 'bg-pink-500' };

export default function TraditionsTabContent() {
  const navigate = useNavigate();
  const { traditions, loading, persistTraditions } = useFamilyTraditions();

  const handleAdd = () => {
    const name = prompt('Название традиции:');
    if (!name) return;
    const description = prompt('Описание традиции:') ?? '';
    const icon = prompt('Эмодзи иконка (например: 🎄):') || '✨';
    const frequency = prompt('Частота (weekly/monthly/yearly):') || 'monthly';
    const nextDate = prompt('Следующая дата (ГГГГ-ММ-ДД):') ?? '';

    const newItem: TraditionItem = {
      id: Date.now().toString(),
      name,
      description,
      icon,
      frequency,
      nextDate,
      participants: [],
    };
    persistTraditions([...traditions, newItem]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить эту традицию?')) {
      persistTraditions(traditions.filter((t) => t.id !== id));
    }
  };

  return (
    <TabsContent value="traditions">
      <Card className="border-2 border-rose-200 bg-rose-50/50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Sparkles" size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Зачем нужны традиции?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Создавайте особые моменты</strong> — воскресные обеды, новогодние ритуалы, семейные игры.</p>
                <p><strong>Укрепляйте связи</strong> между поколениями через повторяющиеся события.</p>
                <p><strong>Передавайте ценности</strong> и создавайте уникальность вашей семьи.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="mb-4 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
        onClick={() => navigate('/nationalities')}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-3xl">🏛️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1 text-purple-900">Народы России</h3>
              <p className="text-sm text-purple-700">Познавательный раздел о культуре и традициях народов нашей страны</p>
            </div>
            <Icon name="ChevronRight" size={28} className="text-purple-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAdd} disabled={loading} className="bg-gradient-to-r from-rose-500 to-pink-500">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить традицию
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {traditions.length > 0 ? traditions.map((t, idx) => (
            <Card key={t.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{t.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`${FREQ_COLOR[t.frequency] ?? 'bg-gray-500'} text-white`}>
                            {FREQ_LABEL[t.frequency] ?? t.frequency}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">{t.description}</p>
                {t.nextDate && (
                  <div className="text-sm text-muted-foreground">
                    <Icon name="Calendar" size={14} className="inline mr-1" />
                    Следующая: {t.nextDate}
                  </div>
                )}
              </CardContent>
            </Card>
          )) : (
            <Card key="empty-traditions">
              <CardContent className="p-8 text-center">
                <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Нет традиций</h3>
                <p className="text-sm text-muted-foreground">Создайте семейные ритуалы и традиции</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </TabsContent>
  );
}
