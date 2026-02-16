import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import type { Tradition } from '@/types/family.types';
import { initialTraditions } from '@/data/mockData';

export default function Culture() {
  const navigate = useNavigate();
  const [traditions, setTraditions] = useState<Tradition[]>(() => {
    const saved = localStorage.getItem('traditions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialTraditions;
      }
    }
    return initialTraditions;
  });

  useEffect(() => {
    localStorage.setItem('traditions', JSON.stringify(traditions));
  }, [traditions]);

  const handleAddTradition = () => {
    const name = prompt('Название традиции:');
    if (!name) return;
    const description = prompt('Описание традиции:');
    const icon = prompt('Эмодзи иконка (например: 🎄):') || '✨';
    const frequency = (prompt('Частота (weekly/monthly/yearly):') as 'weekly' | 'monthly' | 'yearly') || 'monthly';
    const nextDate = prompt('Следующая дата (ГГГГ-ММ-ДД):');

    const newTradition: Tradition = {
      id: Date.now().toString(),
      name,
      description: description || '',
      icon,
      frequency,
      nextDate: nextDate || new Date().toISOString().split('T')[0]
    };

    setTraditions(prev => [...prev, newTradition]);
  };

  const handleDeleteTradition = (id: string) => {
    if (window.confirm('Удалить эту традицию?')) {
      setTraditions(prev => prev.filter(t => t.id !== id));
    }
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Еженедельно';
      case 'monthly': return 'Ежемесячно';
      case 'yearly': return 'Ежегодно';
      default: return freq;
    }
  };

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'bg-blue-500';
      case 'monthly': return 'bg-purple-500';
      case 'yearly': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Традиции и культура"
          subtitle="Национальные традиции, обычаи и культурное наследие"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/962f5a91-1d42-4aab-852d-a46bb1f5888e.jpg"
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
                <p className="text-sm text-purple-700">
                  Познавательный раздел о культуре и традициях народов нашей страны
                </p>
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
            className="bg-gradient-to-r from-amber-500 to-orange-500"
          >
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить традицию
          </Button>
        </div>

        <div className="grid gap-4">
          {traditions.length > 0 ? traditions.map((tradition, idx) => (
            <Card
              key={tradition.id}
              className="animate-fade-in hover:shadow-lg transition-all"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tradition.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{tradition.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getFrequencyColor(tradition.frequency)} text-white`}>
                            {getFrequencyLabel(tradition.frequency)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTradition(tradition.id)}
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
                <p className="text-muted-foreground mb-3">{tradition.description}</p>
                <div className="text-sm text-muted-foreground">
                  <Icon name="Calendar" size={14} className="inline mr-1" />
                  Следующая: {tradition.nextDate}
                </div>
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
      </div>
    </div>
  );
}
