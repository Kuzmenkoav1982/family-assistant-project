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
import LifeRoadOnboarding from '@/components/life-road/LifeRoadOnboarding';
import LifeShareDialog from '@/components/life-road/LifeShareDialog';
import { useSwipe } from '@/components/life-road/useSwipe';
import { useLifeEvents } from '@/components/life-road/useLifeEvents';
import { useLifeGoals } from '@/components/life-road/useLifeGoals';
import type { LifeEvent, LifeEventCategory, LifeGoal } from '@/components/life-road/types';

const BANNER_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/39baf30c-06fc-442f-867d-afbfc906d6c4.jpg';

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
  const [shareOpen, setShareOpen] = useState(false);
  const [search, setSearch] = useState('');

  const goPrevTab = () => {
    const idx = TABS.findIndex((t) => t.id === tab);
    if (idx > 0) setTab(TABS[idx - 1].id);
  };
  const goNextTab = () => {
    const idx = TABS.findIndex((t) => t.id === tab);
    if (idx < TABS.length - 1) setTab(TABS[idx + 1].id);
  };
  const swipeRef = useSwipe<HTMLDivElement>({ onSwipeLeft: goNextTab, onSwipeRight: goPrevTab });

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (category !== 'all' && e.category !== category) return false;
      if (year !== 'all' && new Date(e.date).getFullYear().toString() !== year) return false;
      if (q) {
        const hay = [e.title, e.description, e.quote].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [events, category, year, search]);

  const openAddToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditingEvent({
      id: '',
      date: today,
      title: '',
      category: 'other',
      importance: 'medium',
      participants: [],
    } as LifeEvent);
    setEventDialogOpen(true);
  };

  const isLoading = familyLoading || eventsLoading;

  return (
    <>
      <SEOHead
        title="Мастерская жизни — твой путь и план будущего"
        description="Хронология важных событий семьи, сезоны жизни, цели и инструменты для осознанного планирования."
        path="/life-road"
        breadcrumbs={[
          { name: 'Развитие', path: '/development-hub' },
          { name: 'Мастерская жизни', path: '/life-road' },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50/30 to-white pb-24">
        <div className="max-w-6xl mx-auto p-4 space-y-4">
          <SectionHero
            title="Мастерская жизни"
            subtitle="Твори свой путь: прошлое, настоящее и план будущего"
            imageUrl={BANNER_URL}
            backPath="/development-hub"
            rightAction={
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => setStoryOpen(true)}
                  size="sm"
                  className="bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30 px-2 sm:px-3"
                  title="Смотреть как историю"
                >
                  <Icon name="Film" size={14} className="sm:mr-1.5" />
                  <span className="hidden sm:inline">История</span>
                </Button>
                <Button
                  onClick={() => setShareOpen(true)}
                  size="sm"
                  className="bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30 px-2 sm:px-3"
                  title="Поделиться"
                >
                  <Icon name="Share2" size={14} />
                </Button>
                <Button
                  onClick={() => setCoachOpen(true)}
                  size="sm"
                  className="bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white/30 px-2 sm:px-3"
                >
                  <Icon name="Sparkles" size={14} className="sm:mr-1.5" />
                  <span className="hidden sm:inline">Домовой</span>
                </Button>
              </div>
            }
          />

          <LifeRoadInstructions />

          <div className="flex gap-2 bg-white/60 backdrop-blur-md rounded-2xl p-2 border border-white/60 shadow-sm overflow-x-auto scrollbar-hide">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-shrink-0 sm:flex-1 sm:min-w-[110px] flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? `bg-gradient-to-r ${t.gradient} text-white shadow-md`
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  <Icon name={t.icon} size={16} />
                  <span className={active ? '' : 'hidden xs:inline sm:inline'}>{t.label}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 p-3 text-sm">{error}</div>
          )}

          <div ref={swipeRef} className="space-y-4">

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
                search={search}
                setSearch={setSearch}
                onAdd={() => {
                  setEditingEvent(null);
                  setEventDialogOpen(true);
                }}
                onAddToday={openAddToday}
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

          </div>

          <LifeRoadOnboarding />

          <LifeShareDialog
            open={shareOpen}
            onOpenChange={setShareOpen}
            events={events}
          />

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
            defaultFramework={defaultFramework as never}
            onSave={async (data, id) => {
              if (id) return await updateGoal(id, data);
              return await createGoal(data);
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