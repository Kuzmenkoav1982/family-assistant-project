import { useCallback, useEffect, useRef } from 'react';
import SEOHead from "@/components/SEOHead";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReturnToPortfolio } from '@/hooks/useReturnToPortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useFamilyTraditions } from '@/hooks/useFamilyTraditions';
import type { TraditionItem } from '@/lib/familyTraditions/api';

const INITIAL_TRADITIONS: TraditionItem[] = [
  { id: '1', name: 'Воскресный семейный обед', description: 'Каждое воскресенье мы собираемся всей семьей за большим столом', icon: '🍽️', frequency: 'weekly', nextDate: '', participants: [] },
  { id: '2', name: 'Пятничный киновечер', description: 'Каждую пятницу вечером смотрим семейный фильм с попкорном', icon: '🎬', frequency: 'weekly', nextDate: '', participants: [] },
  { id: '3', name: 'Сказка перед сном', description: 'Каждый вечер читаем сказку перед сном', icon: '📖', frequency: 'weekly', nextDate: '', participants: [] },
];

const FREQ_LABEL: Record<string, string> = { weekly: 'Еженедельно', monthly: 'Ежемесячно', yearly: 'Ежегодно' };
const FREQ_COLOR: Record<string, string> = { weekly: 'bg-blue-500', monthly: 'bg-purple-500', yearly: 'bg-pink-500' };

export default function Culture() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { returnIfRequested } = useReturnToPortfolio();

  const { traditions, loading, persistTraditions } = useFamilyTraditions(INITIAL_TRADITIONS);

  const handleAddTradition = useCallback(() => {
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
    returnIfRequested();
  }, [returnIfRequested, traditions, persistTraditions]);

  // D.1: deep-link ?action=add-ritual | ?action=add-tradition
  const actionHandled = useRef(false);
  useEffect(() => {
    if (actionHandled.current || loading) return;
    const action = searchParams.get('action');
    if (action === 'add-ritual' || action === 'add-tradition') {
      actionHandled.current = true;
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      next.delete('tab');
      next.delete('from');
      setSearchParams(next, { replace: true });
      setTimeout(() => handleAddTradition(), 100);
    }
  }, [searchParams, setSearchParams, handleAddTradition, loading]);

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить эту традицию?')) {
      persistTraditions(traditions.filter((t) => t.id !== id));
    }
  };

  return (
    <>
      <SEOHead
        title="Традиции семьи — обычаи и ритуалы"
        description="Семейные традиции и обычаи: праздничные ритуалы, кулинарные традиции, семейные игры. Сохраняйте и передавайте поколениям."
        path="/culture"
        breadcrumbs={[{ name: 'Ценности', path: '/values-hub' }, { name: 'Традиции', path: '/culture' }]}
      />
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white pb-24">
        <div className="max-w-5xl mx-auto p-4 space-y-6">
          <SectionHero
            title="Традиции и культура"
            subtitle="Национальные традиции, обычаи и культурное наследие"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/0401359d-d55d-4d29-89b0-22856cfb46d1.jpg"
            backPath="/values-hub"
          />

          <Card className="border-2 border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
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
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50"
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

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="Sparkles" size={24} className="text-amber-600" />
              Семейные традиции
            </h2>
            <Button
              onClick={handleAddTradition}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-500"
            >
              <Icon name="Plus" className="mr-2" size={16} />
              Добавить традицию
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4">
              {traditions.length > 0 ? traditions.map((t, idx) => (
                <Card key={t.id} className="animate-fade-in hover:shadow-lg transition-all" style={{ animationDelay: `${idx * 0.1}s` }}>
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
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Sparkles" size={40} className="text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Нет традиций</h3>
                    <p className="text-sm text-muted-foreground">Создайте семейные традиции, которые объединяют вас</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
