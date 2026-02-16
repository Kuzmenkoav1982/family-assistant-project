import SectionHero from '@/components/ui/section-hero';
import { TasksWidget } from '@/components/TasksWidget';

export default function Tasks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-teal-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Задачи"
          subtitle="Распределение задач между членами семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/fdd8e04c-361c-4e34-9beb-0ba5fbc78e4e.jpg"
          backPath="/planning-hub"
        />

        <TasksWidget />
      </div>
    </div>
  );
}