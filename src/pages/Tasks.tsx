import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { TasksWidget } from '@/components/TasksWidget';

export default function Tasks() {
  return (
    <SectionPageFrame
      title="Задачи"
      subtitle="Распределение задач между членами семьи"
      backPath="/planning-hub"
      imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/fdd8e04c-361c-4e34-9beb-0ba5fbc78e4e.jpg"
      backgroundClass="bg-gradient-to-b from-emerald-50 via-teal-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
    >
      <TasksWidget />
    </SectionPageFrame>
  );
}