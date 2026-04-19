import { useMemo, useState } from 'react';
import SectionHero from '@/components/ui/section-hero';
import SEOHead from '@/components/SEOHead';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import LifeRoadInstructions from '@/components/life-road/LifeRoadInstructions';
import LifeFiltersBar from '@/components/life-road/LifeFiltersBar';
import LifeTimeline from '@/components/life-road/LifeTimeline';
import LifeEventDialog from '@/components/life-road/LifeEventDialog';
import { useLifeEvents } from '@/components/life-road/useLifeEvents';
import type { LifeEvent, LifeEventCategory } from '@/components/life-road/types';

const BANNER_URL =
  'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/9c12f708-e83f-4b07-ad65-5fd7179c3c5a.jpg';

export default function LifeRoad() {
  const { members, loading: familyLoading } = useFamilyMembersContext();
  const { events, loading, error, create, update, remove } = useLifeEvents();

  const [category, setCategory] = useState<'all' | LifeEventCategory>('all');
  const [year, setYear] = useState<'all' | string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LifeEvent | null>(null);

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

  const handleSave = async (data: Partial<LifeEvent>, id?: string) => {
    if (id) await update(id, data);
    else await create(data);
  };

  const handleDelete = async (ev: LifeEvent) => {
    if (!confirm(`Удалить событие «${ev.title}»?`)) return;
    await remove(ev.id);
  };

  const isLoading = familyLoading || loading;

  return (
    <>
      <SEOHead
        title="Дорога жизни — твой путь и план будущего"
        description="Хронология важных событий семьи, сезоны жизни и инструменты для осознанного планирования."
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
          />

          <LifeRoadInstructions />

          <LifeFiltersBar
            total={events.length}
            shown={filtered.length}
            category={category}
            setCategory={setCategory}
            year={year}
            setYear={setYear}
            years={years}
            onAdd={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          />

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 p-3 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600" />
            </div>
          ) : (
            <LifeTimeline
              events={filtered}
              birthYear={birthYear}
              onEditEvent={(ev) => {
                setEditing(ev);
                setDialogOpen(true);
              }}
              onDeleteEvent={handleDelete}
            />
          )}

          <LifeEventDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            initialEvent={editing}
            onSave={handleSave}
          />
        </div>
      </div>
    </>
  );
}
