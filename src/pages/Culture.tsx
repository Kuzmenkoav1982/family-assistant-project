import { useCallback, useEffect, useRef, useState } from 'react';
import SEOHead from "@/components/SEOHead";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReturnToPortfolio } from '@/hooks/useReturnToPortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import type { Tradition } from '@/types/family.types';
import { initialTraditions } from '@/data/mockData';
import { readActorUserId } from '@/lib/identity';
import func2url from '../../backend/func2url.json';

const API_URL = func2url['family-traditions'];

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const uid = readActorUserId();
  if (uid) headers['X-User-Id'] = uid;
  return headers;
}

async function fetchTraditions(): Promise<Tradition[]> {
  const res = await fetch(API_URL, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  return (data.traditions || []) as Tradition[];
}

async function syncTraditions(items: Tradition[]): Promise<void> {
  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
}

const LS_KEY = 'traditions';

export default function Culture() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { returnIfRequested } = useReturnToPortfolio();

  const [traditions, setTraditions] = useState<Tradition[]>([]);
  const [loading, setLoading] = useState(true);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTraditions()
      .then((remote) => {
        if (cancelled) return;
        if (remote.length > 0) {
          setTraditions(remote);
          localStorage.removeItem(LS_KEY);
        } else {
          const saved = localStorage.getItem(LS_KEY);
          const local: Tradition[] = saved ? JSON.parse(saved) : initialTraditions;
          setTraditions(local);
          if (local.length > 0) {
            syncTraditions(local).catch(() => null);
            localStorage.removeItem(LS_KEY);
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        const saved = localStorage.getItem(LS_KEY);
        setTraditions(saved ? JSON.parse(saved) : initialTraditions);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const persistTraditions = useCallback((next: Tradition[]) => {
    setTraditions(next);
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      syncTraditions(next).catch(() => {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      });
    }, 500);
  }, []);

  const handleAddTradition = useCallback(() => {
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
      nextDate: nextDate || new Date().toISOString().split('T')[0],
    };

    persistTraditions([...traditions, newTradition]);
    returnIfRequested();
  }, [returnIfRequested, traditions, persistTraditions]);

  // D.1: deep-link из портфолио — ?action=add-ritual или ?action=add-tradition
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

  const handleDeleteTradition = (id: string) => {
    if (window.confirm('Удалить эту традицию?')) {
      persistTraditions(traditions.filter(t => t.id !== id));
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
    <>
    <SEOHead title="Традиции семьи — обычаи и ритуалы" description="Семейные традиции и обычаи: праздничные ритуалы, кулинарные традиции, семейные игры. Сохраняйте и передавайте поколениям." path="/culture" breadcrumbs={[{ name: "Ценности", path: "/values-hub" }, { name: "Традиции", path: "/culture" }]} />
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
            disabled={loading}
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
                          <span>{tradition.name ?? tradition.title}</span>
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
                  {tradition.nextDate && (
                    <div className="text-sm text-muted-foreground">
                      <Icon name="Calendar" size={14} className="inline mr-1" />
                      Следующая: {tradition.nextDate}
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
