import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth-context';
import {
  fetchRecommendations,
  saveProfile,
  setMeasureStatus,
  SupportMeasure,
  SupportProfile,
} from '@/lib/support-navigator-api';
import { toast } from '@/hooks/use-toast';

const CATEGORY_LABELS: Record<string, string> = {
  financial: 'Деньги',
  housing: 'Жильё',
  health: 'Здоровье',
  education: 'Образование',
  tax: 'Налоги',
  transport: 'Транспорт',
  status: 'Статус',
  disability: 'Инвалидность',
  military: 'СВО',
  student: 'Студенты',
  guardianship: 'Опека',
  leisure: 'Досуг',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Не начато', color: 'bg-slate-100 text-slate-700' },
  planned: { label: 'Запланировано', color: 'bg-amber-100 text-amber-700' },
  in_progress: { label: 'В процессе', color: 'bg-blue-100 text-blue-700' },
  done: { label: 'Получено', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Отказ', color: 'bg-rose-100 text-rose-700' },
  skipped: { label: 'Не интересно', color: 'bg-slate-100 text-slate-500' },
};

const DEFAULT_PROFILE: SupportProfile = {
  regionCode: '77',
  childrenCount: 0,
  childrenAges: [],
  isPregnant: false,
  isSingleParent: false,
  isLowIncome: false,
  hasDisability: false,
  isMilitaryFamily: false,
  isStudent: false,
  hasMortgage: false,
  monthlyIncomePerCapita: null,
  parentAge: null,
};

export default function SupportNavigator() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id ? String(currentUser.id) : '';

  const [profile, setProfile] = useState<SupportProfile>(DEFAULT_PROFILE);
  const [measures, setMeasures] = useState<SupportMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('eligible');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations(userId || undefined);
      setMeasures(data.measures || []);
      if (data.profile && data.profile.userId) {
        setProfile({ ...DEFAULT_PROFILE, ...data.profile });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const handleSaveProfile = async () => {
    if (!userId) {
      toast({ title: 'Войдите в аккаунт', description: 'Чтобы сохранить профиль семьи' });
      return;
    }
    setSaving(true);
    try {
      await saveProfile(userId, profile);
      await load();
      toast({ title: 'Профиль сохранён', description: 'Подбираем меры заново' });
    } catch (e) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (m: SupportMeasure, status: string) => {
    if (!userId) {
      toast({ title: 'Войдите в аккаунт' });
      return;
    }
    try {
      await setMeasureStatus(userId, m.id, status);
      setMeasures((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, user: { ...(x.user || { note: null, deadlineAt: null }), status } } : x)),
      );
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const eligible = useMemo(() => measures.filter((m) => m.match?.eligible), [measures]);
  const others = useMemo(() => measures.filter((m) => !m.match?.eligible), [measures]);
  const inWork = useMemo(
    () => measures.filter((m) => m.user && ['planned', 'in_progress'].includes(m.user.status)),
    [measures],
  );
  const done = useMemo(() => measures.filter((m) => m.user?.status === 'done'), [measures]);

  const totalAmount = useMemo(() => {
    return eligible
      .map((m) => m.amountText)
      .filter(Boolean)
      .slice(0, 5);
  }, [eligible]);

  const filterByCategory = (list: SupportMeasure[]) =>
    filterCategory === 'all' ? list : list.filter((m) => m.category === filterCategory);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    measures.forEach((m) => set.add(m.category));
    return Array.from(set);
  }, [measures]);

  const renderCard = (m: SupportMeasure) => {
    const userStatus = m.user?.status || 'pending';
    const statusInfo = STATUS_LABELS[userStatus] || STATUS_LABELS.pending;
    const eligible = m.match?.eligible;
    return (
      <Card
        key={m.id}
        className={`overflow-hidden border ${
          eligible ? 'border-emerald-200/60 bg-white' : 'border-slate-200 bg-slate-50/60 opacity-90'
        }`}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                eligible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <Icon name={m.icon} fallback="Gift" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-900 leading-tight">{m.title}</h3>
                <Badge className={`${statusInfo.color} shrink-0`} variant="secondary">
                  {statusInfo.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mt-1">{m.shortDescription}</p>

              {m.amountText && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium">
                  <Icon name="Wallet" size={14} />
                  {m.amountText}
                </div>
              )}

              {m.match && m.match.reasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.match.reasons.slice(0, 3).map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {r}
                    </span>
                  ))}
                </div>
              )}
              {m.match && !m.match.eligible && m.match.blockers.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.match.blockers.slice(0, 2).map((b, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                      {b}
                    </span>
                  ))}
                </div>
              )}

              {m.deadlineText && (
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Icon name="Clock" size={12} />
                  {m.deadlineText}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-3">
                {m.applyUrl && (
                  <Button
                    asChild
                    size="sm"
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700 h-8"
                  >
                    <a href={m.applyUrl} target="_blank" rel="noreferrer">
                      <Icon name="ExternalLink" size={14} />
                      Оформить
                    </a>
                  </Button>
                )}
                {eligible && (
                  <>
                    <Button
                      size="sm"
                      variant={userStatus === 'planned' ? 'default' : 'outline'}
                      className="h-8"
                      onClick={() => handleStatus(m, 'planned')}
                    >
                      Запланировать
                    </Button>
                    <Button
                      size="sm"
                      variant={userStatus === 'done' ? 'default' : 'outline'}
                      className={`h-8 ${userStatus === 'done' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      onClick={() => handleStatus(m, 'done')}
                    >
                      <Icon name="Check" size={14} />
                      Получено
                    </Button>
                  </>
                )}
                {m.legalSource && (
                  <span className="text-xs text-slate-400 self-center">{m.legalSource}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50/40 to-amber-50/30 pb-32">
      <SEOHead
        title="Навигатор мер поддержки семьи"
        description="Узнайте за 1 минуту, какие меры поддержки положены вашей семье — маткапитал, единое пособие, семейная ипотека и десятки других."
      />

      <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-4">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center hover:scale-105 transition-all"
            aria-label="Назад"
          >
            <Icon name="ChevronLeft" size={20} className="text-slate-600" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-slate-800">Навигатор мер поддержки</h1>
          <div className="w-10" />
        </div>

        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white mb-4">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Icon name="Sparkles" size={26} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Что положено вашей семье</h2>
                <p className="text-emerald-50 text-sm">Подбор по профилю · {measures.length} мер в базе</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/15 rounded-xl p-2 text-center">
                <div className="text-2xl font-bold">{eligible.length}</div>
                <div className="text-xs text-emerald-50">Положено</div>
              </div>
              <div className="bg-white/15 rounded-xl p-2 text-center">
                <div className="text-2xl font-bold">{inWork.length}</div>
                <div className="text-xs text-emerald-50">В работе</div>
              </div>
              <div className="bg-white/15 rounded-xl p-2 text-center">
                <div className="text-2xl font-bold">{done.length}</div>
                <div className="text-xs text-emerald-50">Получено</div>
              </div>
            </div>
            {totalAmount.length > 0 && (
              <p className="text-xs text-emerald-50 mt-3">
                Среди подобранных: {totalAmount.slice(0, 3).join(' · ')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Icon name="UserCog" size={18} className="text-emerald-600" />
                Профиль семьи
              </h3>
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? 'Сохраняем…' : 'Подобрать заново'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-500">Регион (код)</Label>
                <Input
                  value={profile.regionCode}
                  onChange={(e) => setProfile({ ...profile, regionCode: e.target.value })}
                  placeholder="77"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Детей</Label>
                <Input
                  type="number"
                  min={0}
                  max={15}
                  value={profile.childrenCount}
                  onChange={(e) => setProfile({ ...profile, childrenCount: Number(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-slate-500">Возраст детей через запятую</Label>
                <Input
                  value={profile.childrenAges.join(', ')}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      childrenAges: e.target.value
                        .split(',')
                        .map((s) => parseInt(s.trim(), 10))
                        .filter((n) => !Number.isNaN(n)),
                    })
                  }
                  placeholder="3, 7, 12"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Доход на чел./мес, ₽</Label>
                <Input
                  type="number"
                  value={profile.monthlyIncomePerCapita ?? ''}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      monthlyIncomePerCapita: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Возраст родителя</Label>
                <Input
                  type="number"
                  value={profile.parentAge ?? ''}
                  onChange={(e) =>
                    setProfile({ ...profile, parentAge: e.target.value ? Number(e.target.value) : null })
                  }
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {[
                { k: 'isPregnant', label: 'Беременность' },
                { k: 'isSingleParent', label: 'Единственный родитель' },
                { k: 'isLowIncome', label: 'Доход ниже ПМ' },
                { k: 'hasDisability', label: 'Инвалидность ребёнка' },
                { k: 'isMilitaryFamily', label: 'Семья участника СВО' },
                { k: 'isStudent', label: 'Студенческая семья' },
                { k: 'hasMortgage', label: 'Есть ипотека' },
              ].map((it) => (
                <div
                  key={it.k}
                  className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{it.label}</span>
                  <Switch
                    checked={Boolean((profile as unknown as Record<string, boolean>)[it.k])}
                    onCheckedChange={(v) => setProfile({ ...profile, [it.k]: v } as SupportProfile)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => setFilterCategory('all')}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              filterCategory === 'all'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Все
          </button>
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border ${
                filterCategory === c
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {CATEGORY_LABELS[c] || c}
            </button>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 mb-3">
            <TabsTrigger value="eligible">Положено ({eligible.length})</TabsTrigger>
            <TabsTrigger value="in_work">В работе ({inWork.length})</TabsTrigger>
            <TabsTrigger value="done">Получено ({done.length})</TabsTrigger>
            <TabsTrigger value="all">Все ({measures.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="eligible" className="space-y-3">
            {loading && <p className="text-sm text-slate-500">Подбираем меры…</p>}
            {!loading && filterByCategory(eligible).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">
                Заполните профиль семьи выше — и мы покажем, что вам положено
              </p>
            )}
            {filterByCategory(eligible).map(renderCard)}
          </TabsContent>

          <TabsContent value="in_work" className="space-y-3">
            {filterByCategory(inWork).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">
                Запланируйте оформление меры — она появится здесь
              </p>
            )}
            {filterByCategory(inWork).map(renderCard)}
          </TabsContent>

          <TabsContent value="done" className="space-y-3">
            {filterByCategory(done).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">Пока ничего не оформлено</p>
            )}
            {filterByCategory(done).map(renderCard)}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            {filterByCategory([...eligible, ...others]).map(renderCard)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}