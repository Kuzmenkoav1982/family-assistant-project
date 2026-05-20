import WorkshopHero from '@/components/goals/workshop/WorkshopHero';
import WorkshopTriad from '@/components/goals/workshop/WorkshopTriad';
import WorkshopGoalsPanel from '@/components/goals/workshop/WorkshopGoalsPanel';
import { useWorkshopData } from '@/components/goals/workshop/useWorkshopData';
import FocusSection from '@/components/goals/focus/FocusSection';
import WeeklyReviewSection from '@/components/goals/review/WeeklyReviewSection';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

export default function WorkshopPage() {
  const {
    goals, checkinsByGoalId,
    loading, reviewLoading,
    error, reviewError,
    filter, setFilter,
    sort, setSort,
    summary, sorted,
    reload,
  } = useWorkshopData();

  return (
    <SectionPageFrame
      title="Мастерская жизни"
      backPath="/planning-hub"
      variant="light"
      hideTitle
      backgroundClass="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
    >
      <WorkshopHero />
      <WorkshopTriad />
      <FocusSection
        goals={goals}
        checkinsByGoalId={checkinsByGoalId}
        loading={reviewLoading}
        error={reviewError}
        onRetry={reload}
        onChanged={reload}
      />
      <WorkshopGoalsPanel
        loading={loading}
        error={error}
        summary={summary}
        sorted={sorted}
        filter={filter}
        sort={sort}
        onFilterChange={setFilter}
        onSortChange={setSort}
        onRetry={reload}
      />
      <WeeklyReviewSection
        goals={goals}
        checkinsByGoalId={checkinsByGoalId}
        loading={reviewLoading}
        error={reviewError}
        onRetry={reload}
      />
      <div className="text-[11px] text-gray-400 text-center italic">
        Этап 1 триады • фундамент модели. Методики, мосты и сверка часов появятся следующими волнами.
      </div>
    </SectionPageFrame>
  );
}