import { useState } from 'react';
import { initialTasks, initialFamilyMembers } from '@/data/mockData';

const CATEGORY_COLORS: Record<string, string> = {
  'Кухня': 'bg-orange-100 text-orange-700',
  'Дом': 'bg-blue-100 text-blue-700',
  'Учеба': 'bg-purple-100 text-purple-700',
  'Сад': 'bg-green-100 text-green-700',
  'Покупки': 'bg-pink-100 text-pink-700',
  'Питомцы': 'bg-amber-100 text-amber-700',
  'Финансы': 'bg-cyan-100 text-cyan-700',
};

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700';
}

export function useFamilyTasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const getMemberById = (id: string) =>
    initialFamilyMembers.find(m => m.name === id || m.id === id);

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    totalPoints: tasks.filter(t => !t.completed).reduce((sum, t) => sum + (t.points || 0), 0),
  };

  return { filteredTasks, filter, setFilter, stats, getMemberById, toggleTask };
}
