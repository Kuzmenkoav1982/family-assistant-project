import SEOHead from "@/components/SEOHead";
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import { useFamilyTasks } from '@/components/family-tasks/useFamilyTasks';
import TasksStatsBar from '@/components/family-tasks/TasksStatsBar';
import TasksFilterBar from '@/components/family-tasks/TasksFilterBar';
import TaskCard from '@/components/family-tasks/TaskCard';
import TasksEmptyState from '@/components/family-tasks/TasksEmptyState';

export default function FamilyTasks() {
  const { filteredTasks, filter, setFilter, stats, getMemberById, toggleTask } = useFamilyTasks();

  return (
    <>
      <SEOHead
        title="Задачи семьи — планирование и контроль"
        description="Семейные задачи с приоритетами, сроками и ответственными. Распределяйте обязанности и отслеживайте выполнение."
        path="/tasks"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
              <Icon name="ArrowLeft" size={20} />
              <span>На главную</span>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Задачи</h1>
                <p className="text-lg text-gray-600">Управление задачами семьи</p>
              </div>
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
                <Icon name="Plus" className="w-5 h-5 mr-2" />
                Добавить задачу
              </Button>
            </div>
          </div>

          <TasksStatsBar
            total={stats.total}
            active={stats.active}
            completed={stats.completed}
            totalPoints={stats.totalPoints}
          />

          <TasksFilterBar filter={filter} onFilterChange={setFilter} />

          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                member={getMemberById(task.assignee)}
                onToggle={toggleTask}
              />
            ))}
          </div>

          {filteredTasks.length === 0 && <TasksEmptyState filter={filter} />}
        </div>
      </div>
    </>
  );
}
