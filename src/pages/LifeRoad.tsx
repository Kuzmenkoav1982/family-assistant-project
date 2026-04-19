import { useMemo, useState } from 'react';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import LifeRoadInstructions from '@/components/life-road/LifeRoadInstructions';
import LifeFiltersBar from '@/components/life-road/LifeFiltersBar';
import LifeTimeline from '@/components/life-road/LifeTimeline';
import LifeEventDialog from '@/components/life-road/LifeEventDialog';
import LifeGoalsList from '@/components/life-road/LifeGoalsList';
import LifeGoalDialog from '@/components/life-road/LifeGoalDialog';
import BalanceWheel from '@/components/life-road/BalanceWheel';
import FrameworksLibrary from '@/components/life-road/FrameworksLibrary';
import CoachDialog from '@/components/life-road/CoachDialog';
import LifeStoryMode from '@/components/life-road/LifeStoryMode';
import LifeInsights from '@/components/life-road/LifeInsights';
import { useLifeEvents } from '@/components/life-road/useLifeEvents';
import { useLifeGoals } from '@/components/life-road/useLifeGoals';
import type { LifeEvent, LifeEventCategory, LifeGoal } from '@/components/life-road/types';

const BANNER_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/9c12f708-e83f-4b07-ad65-5fd7179c3c5a.jpg';

type TabId = 'road' | 'insights' | 'goals' | 'balance' | 'methods';

const TABS: { id: TabId; label: string; icon: string; gradient: string }[] = [
  { id: 'road',     label: 'Дорога',   icon: 'Route',     gradient: 'from-pink-500 to-purple-600' },
  { id: 'insights', label: 'Инсайты',  icon: 'BarChart3', gradient: 'from-rose-500 to-orange-500' },
  { id: 'goals',    label: 'Цели',     icon: 'Target',    gradient: 'from-blue-500 to-cyan-500' },
  { id: 'balance',  label: 'Баланс',   icon: 'PieChart',  gradient: 'from-emerald-500 to-teal-500' },
  { id: 'methods',  label: 'Методики', icon: 'Library',   gradient: 'from-amber-500 to-orange-500' },
];

export default function LifeRoad() {
  const { members, loading: familyLoading } = useFamilyMembersContext();
  const { events, loading: eventsLoading, error, create: createEvent, update: updateEvent, remove: removeEvent } = useLifeEvents();
  const { goals, create: createGoal, update: updateGoal, remove: removeGoal } = useLifeGoals();

  const [tab, setTab] = useState<TabId>('road');
  const [category, setCategory] = useState<'all' | LifeEventCategory>('all');
  const [year, setYear] = useState<'all' | string>('all');

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LifeEvent | null>(null);

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LifeGoal | null>(null);
  const [defaultFramework, setDefaultFramework] = useState<string | undefined>(undefined);

  const [coachOpen, setCoachOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);

  const birthYear = useMemo(() => {
    const me = members?.find((m) => m.birth_date);
    if (!me?.birth_date) return undefined;
    const y = new Date(me.birth_date).getFullYear();
    return Number.isFinite(y) ? y : undefined;
  }, [members]);

  const years = useMemo(
    () => Array.from(new Set(events.map((e) => new Date(e.date).getFullYear().toString()))).sort(),
    [events],
  );

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (category !== 'all' && e.category !== category) return false;
        if (year !== 'all' && new Date(e.date).getFullYear().toString() !== year) return false;
        return true;
      }),
    [events, category, year],
  );

  const isLoading = familyLoading || eventsLoading;

  return (
    <>
      <SEOHead
        title="Дорога жизни — твой путь и план будущего"
        description="Хронология важных событий семьи, сезоны жизни, цели и инструменты для осознанного планирования."
        path="/life-road"
        breadcrumbs={[
          { name: 'Развитие', path: '/development-hub' },
          { name: 'Дорога жизни', path: '/life-road' },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50/30 to-white pb-24">
        <div className="max-w-6xl mx-auto p-4 space-y-4">
          <SectionHero
            title="Дорога жизни"
            subtitle="Прошлое, настоящее и план будущего на одной линии"
            imageUrl={BANNER_URL}
            backPath="/development-hub"
            rightAction={
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setStoryOpen(true)}
                  size="sm"
                  className="bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30"
                  title="Смотреть как историю"
                >
                  <Icon name="Film" size={14} className="mr-1.5" />
                  История
                </Button>
                <Button
                  onClick={() => setCoachOpen(true)}
                  size="sm"
                  className="bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30"
                >
                  <Icon name="Sparkles" size={14} className="mr-1.5" />
                  Домовой
                </Button>
              </div>
            }
          />

          <LifeRoadInstructions />

          <div className="flex flex-wrap gap-2 bg-white/60 backdrop-blur-md rounded-2xl p-2 border border-white/60 shadow-sm">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? `bg-gradient-to-r ${t.gradient} text-white shadow-md`
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 p-3 text-sm">{error}</div>
          )}

          {tab === 'road' && (
            <>
              <LifeFiltersBar
                total={events.length}
                shown={filtered.length}
                category={category}
                setCategory={setCategory}
                year={year}
                setYear={setYear}
                years={years}
                onAdd={() => {
                  setEditingEvent(null);
                  setEventDialogOpen(true);
                }}
              />
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600" />
                </div>
              ) : (
                <LifeTimeline
                  events={filtered}
                  birthYear={birthYear}
                  onEditEvent={(ev) => {
                    setEditingEvent(ev);
                    setEventDialogOpen(true);
                  }}
                  onDeleteEvent={async (ev) => {
                    if (!confirm(`Удалить событие «${ev.title}»?`)) return;
                    await removeEvent(ev.id);
                  }}
                />
              )}
            </>
          )}

          {tab === 'insights' && (
            <LifeInsights
              events={events}
              birthYear={birthYear}
              onOpenStory={() => setStoryOpen(true)}
              onJumpEvent={(ev) => {
                setEditingEvent(ev);
                setEventDialogOpen(true);
              }}
            />
          )}

          {tab === 'goals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Icon name="Target" size={18} className="text-blue-600" />
                  Мои цели
                </h3>
                <Button
                  onClick={() => {
                    setEditingGoal(null);
                    setDefaultFramework(undefined);
                    setGoalDialogOpen(true);
                  }}
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                >
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Цель
                </Button>
              </div>
              <LifeGoalsList
                goals={goals}
                onAdd={() => {
                  setEditingGoal(null);
                  setGoalDialogOpen(true);
                }}
                onEdit={(g) => {
                  setEditingGoal(g);
                  setGoalDialogOpen(true);
                }}
                onDelete={async (g) => {
                  if (!confirm(`Удалить цель «${g.title}»?`)) return;
                  await removeGoal(g.id);
                }}
                onUpdateProgress={(g, progress) => updateGoal(g.id, { progress })}
              />
            </div>
          )}

          {tab === 'balance' && <BalanceWheel />}

          {tab === 'methods' && (
            <FrameworksLibrary
              onPick={(fw) => {
                setEditingGoal(null);
                setDefaultFramework(fw.id);
                setTab('goals');
                setGoalDialogOpen(true);
              }}
            />
          )}

          <LifeEventDialog
            open={eventDialogOpen}
            onOpenChange={setEventDialogOpen}
            initialEvent={editingEvent}
            onSave={async (data, id) => {
              if (id) await updateEvent(id, data);
              else await createEvent(data);
            }}
          />

          <LifeGoalDialog
            open={goalDialogOpen}
            onOpenChange={setGoalDialogOpen}
            initial={editingGoal}
            defaultFramework={defaultFramework}
            onSave={async (data, id) => {
              if (id) await updateGoal(id, data);
              else await createGoal(data);
            }}
          />

          <CoachDialog open={coachOpen} onOpenChange={setCoachOpen} />

          <LifeStoryMode
            open={storyOpen}
            onClose={() => setStoryOpen(false)}
            events={events}
            birthYear={birthYear}
          />
        </div>
      </div>
    </>
  );
}