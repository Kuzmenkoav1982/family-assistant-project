import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { FinanceGoalsInstructions } from '@/components/finance/FinanceInstructions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_GOALS } from '@/data/demoFinanceData';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
  status: string;
  progress: number;
}

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const GOAL_PRESETS = [
  { icon: 'Home', label: 'Квартира', color: '#3B82F6' },
  { icon: 'Car', label: 'Машина', color: '#EF4444' },
  { icon: 'Plane', label: 'Отпуск', color: '#F59E0B' },
  { icon: 'GraduationCap', label: 'Образование', color: '#8B5CF6' },
  { icon: 'Smartphone', label: 'Техника', color: '#6366F1' },
  { icon: 'Paintbrush', label: 'Ремонт', color: '#EC4899' },
  { icon: 'Heart', label: 'Свадьба', color: '#F43F5E' },
  { icon: 'Baby', label: 'Дети', color: '#14B8A6' },
  { icon: 'Shield', label: 'Подушка безопасности', color: '#22C55E' },
  { icon: 'Gift', label: 'Подарок', color: '#F97316' },
  { icon: 'Dumbbell', label: 'Здоровье', color: '#06B6D4' },
  { icon: 'Star', label: 'Другое', color: '#64748B' },
];

export default function FinanceGoals() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showContribute, setShowContribute] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', target_amount: '', current_amount: '', target_date: '',
    icon: 'Target', color: '#3B82F6'
  });
  const [contributeAmount, setContributeAmount] = useState('');

  const loadGoals = useCallback(async () => {
    const res = await fetch(`${API}?section=goals`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setGoals(data.goals || []);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setGoals(DEMO_GOALS as Goal[]);
      setLoading(false);
      return;
    }
    loadGoals().finally(() => setLoading(false));
  }, [isDemoMode, loadGoals]);

  const addGoal = async () => {
    if (!form.name.trim() || !form.target_amount || parseFloat(form.target_amount) <= 0) {
      toast.error('Укажите название и целевую сумму');
      return;
    }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({
        action: 'add_goal', name: form.name,
        target_amount: parseFloat(form.target_amount),
        current_amount: form.current_amount ? parseFloat(form.current_amount) : 0,
        target_date: form.target_date || null,
        icon: form.icon, color: form.color
      })
    });
    setSaving(false);
    if (res.ok) {
      toast.success('Цель создана');
      setShowAdd(false);
      setForm({ name: '', target_amount: '', current_amount: '', target_date: '', icon: 'Target', color: '#3B82F6' });
      loadGoals();
    } else { toast.error('Ошибка'); }
  };

  const contribute = async () => {
    if (!showContribute || !contributeAmount || parseFloat(contributeAmount) <= 0) {
      toast.error('Укажите сумму');
      return;
    }
    setSaving(true);
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'contribute_goal', id: showContribute.id, amount: parseFloat(contributeAmount) })
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      if (data.progress >= 100) {
        toast.success('Цель достигнута!');
      } else {
        toast.success(`Отложено! Прогресс: ${data.progress}%`);
      }
      setShowContribute(null);
      setContributeAmount('');
      loadGoals();
    } else { toast.error('Ошибка'); }
  };

  const deleteGoal = async (id: string) => {
    const res = await fetch(API, {
      method: 'POST', headers: getHeaders(),
      body: JSON.stringify({ action: 'delete_goal', id })
    });
    if (res.ok) { toast.success('Удалено'); loadGoals(); }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalTarget = activeGoals.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved = activeGoals.reduce((s, g) => s + g.current_amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Финансовые цели"
          subtitle="Копите на мечты всей семьёй"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/ed60650e-aeba-4207-8ad6-870ec1760abf.jpg"
          backPath="/finance"
          rightAction={
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => setShowAdd(true)}>
              <Icon name="Plus" size={16} className="mr-1" /> Цель
            </Button>
          }
        />

        <FinanceGoalsInstructions />

        {activeGoals.length > 0 && (
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-amber-100 text-sm">Накоплено</p>
                  <p className="text-2xl font-bold">{formatMoney(totalSaved)} ₽</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-100 text-sm">Цель</p>
                  <p className="text-lg font-bold">{formatMoney(totalTarget)} ₽</p>
                </div>
              </div>
              <div className="mt-3">
                <Progress value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
                  className="h-2 bg-white/20" />
              </div>
            </CardContent>
          </Card>
        )}

        {goals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Target" size={48} className="mx-auto mb-3 text-amber-300" />
            <p className="font-medium text-foreground">Нет целей</p>
            <p className="text-sm mt-1">Создайте финансовую цель — квартира, машина, отпуск</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeGoals.map(goal => {
              const remaining = goal.target_amount - goal.current_amount;
              const daysLeft = goal.target_date
                ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000))
                : null;

              return (
                <Card key={goal.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className="w-16 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: goal.color + '15' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: goal.color }}>
                          <Icon name={goal.icon || 'Target'} size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm truncate">{goal.name}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); deleteGoal(goal.id); }}>
                            <Icon name="X" size={14} />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-medium" style={{ color: goal.color }}>
                            {formatMoney(goal.current_amount)} ₽
                          </span>
                          <span className="text-muted-foreground">из {formatMoney(goal.target_amount)} ₽</span>
                        </div>
                        <Progress value={goal.progress} className="h-2 mb-2" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{Math.round(goal.progress)}%</span>
                            {remaining > 0 && <span>· осталось {formatMoney(remaining)} ₽</span>}
                            {daysLeft !== null && <span>· {daysLeft} дн.</span>}
                          </div>
                          <Button size="sm" variant="outline" className="h-7 text-xs"
                            onClick={() => { setShowContribute(goal); setContributeAmount(''); }}>
                            <Icon name="Plus" size={12} className="mr-1" /> Отложить
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {completedGoals.length > 0 && (
              <>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide pt-2">Достигнутые</p>
                {completedGoals.map(goal => (
                  <Card key={goal.id} className="overflow-hidden opacity-70">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-100">
                        <Icon name="Check" size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{goal.name}</span>
                        <span className="text-xs text-green-600">{formatMoney(goal.target_amount)} ₽</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 text-[10px]">Достигнута</Badge>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Новая цель</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Выберите шаблон</label>
              <div className="grid grid-cols-4 gap-2">
                {GOAL_PRESETS.map(p => (
                  <button key={p.icon} onClick={() => setForm({ ...form, name: form.name || p.label, icon: p.icon, color: p.color })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs ${
                      form.icon === p.icon ? 'border-amber-500 bg-amber-50' : 'border-transparent hover:bg-gray-50'
                    }`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: p.color + '20' }}>
                      <Icon name={p.icon} size={16} style={{ color: p.color }} />
                    </div>
                    <span className="truncate w-full text-center">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Название</label>
              <Input placeholder="На что копим?" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Нужно, ₽</label>
                <Input type="number" inputMode="decimal" placeholder="500000" value={form.target_amount}
                  onChange={e => setForm({ ...form, target_amount: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Уже есть, ₽</label>
                <Input type="number" inputMode="decimal" placeholder="0" value={form.current_amount}
                  onChange={e => setForm({ ...form, current_amount: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Дедлайн</label>
              <Input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addGoal} disabled={saving} className="bg-amber-600 hover:bg-amber-700 w-full">
              {saving ? 'Сохраняю...' : 'Создать цель'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!showContribute} onOpenChange={() => setShowContribute(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Отложить на «{showContribute?.name}»</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {showContribute && (
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <p className="text-sm text-muted-foreground">Осталось накопить</p>
                <p className="text-xl font-bold text-amber-700">
                  {formatMoney(showContribute.target_amount - showContribute.current_amount)} ₽
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Сумма, ₽</label>
              <Input type="number" inputMode="decimal" placeholder="5000" autoFocus
                value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={contribute} disabled={saving} className="bg-amber-600 hover:bg-amber-700 w-full">
              {saving ? 'Сохраняю...' : 'Отложить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}