import type { FamilyMember } from '@/types/family.types';

export interface WorkloadMetrics {
  activeTasks: number;
  completedToday: number;
  responsibilities: number;
  todayEvents: number;
  weekAchievements: number;
  workloadPercentage: number;
  workloadStatus: 'free' | 'busy' | 'overloaded';
  workloadLabel: string;
  workloadColor: string;
}

interface Task {
  id: string;
  assignee_id?: string;
  assignee?: string;
  completed: boolean;
  completed_date?: string;
  due_date?: string;
}

interface CalendarEvent {
  id: string;
  date: string;
  participants?: string[];
}

/**
 * Рассчитывает метрики загруженности члена семьи
 */
export function calculateMemberWorkload(
  member: FamilyMember,
  tasks: Task[] = [],
  events: CalendarEvent[] = []
): WorkloadMetrics {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  // Активные задачи (поддержка и ID, и имени для демо-режима)
  const activeTasks = tasks.filter(
    t => (t.assignee_id === member.id || t.assignee === member.name) && !t.completed
  ).length;
  
  if (member.name === 'Алексей' && tasks.length > 0) {
    console.log('[calculateMemberWorkload] Debug for Алексей:', {
      memberId: member.id,
      memberName: member.name,
      totalTasks: tasks.length,
      sampleTask: tasks[0],
      matchingTasks: tasks.filter(t => t.assignee_id === member.id || t.assignee === member.name),
      activeTasks
    });
  }

  // Завершено сегодня (поддержка и ID, и имени для демо-режима)
  const completedToday = tasks.filter(t => {
    const isAssigned = t.assignee_id === member.id || t.assignee === member.name;
    if (!isAssigned || !t.completed || !t.completed_date) return false;
    const completedDate = new Date(t.completed_date);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  }).length;

  // Обязанности (из профиля)
  const responsibilities = member.responsibilities?.length || 0;

  // События на сегодня
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    const isToday = eventDate.getTime() === today.getTime();
    const isParticipant = event.participants?.includes(member.id) || 
                          event.participants?.includes(member.name);
    return isToday && isParticipant;
  }).length;

  // Достижения за неделю
  const weekAchievements = member.achievements?.filter(achievement => {
    // Если достижение - строка с датой или объект с датой
    if (typeof achievement === 'string') {
      const match = achievement.match(/\d{4}-\d{2}-\d{2}/);
      if (match) {
        const achievementDate = new Date(match[0]);
        return achievementDate >= weekAgo && achievementDate <= today;
      }
      return false;
    }
    return false;
  }).length || 0;

  // Расчёт процента загруженности
  // Формула: (активные задачи * 20 + обязанности * 10 + события * 15) / 100
  // Максимум: 5 задач (100) + 5 обязанностей (50) + 3 события (45) = 195
  // Нормализуем к 100%
  const rawScore = (activeTasks * 20) + (responsibilities * 10) + (todayEvents * 15);
  const workloadPercentage = Math.min(Math.round((rawScore / 195) * 100), 100);

  // Определяем статус
  let workloadStatus: 'free' | 'busy' | 'overloaded';
  let workloadLabel: string;
  let workloadColor: string;

  if (workloadPercentage < 50) {
    workloadStatus = 'free';
    workloadLabel = 'Свободен';
    workloadColor = 'bg-green-500';
  } else if (workloadPercentage < 80) {
    workloadStatus = 'busy';
    workloadLabel = 'Загружен';
    workloadColor = 'bg-yellow-500';
  } else {
    workloadStatus = 'overloaded';
    workloadLabel = 'Перегружен';
    workloadColor = 'bg-red-500';
  }

  return {
    activeTasks,
    completedToday,
    responsibilities,
    todayEvents,
    weekAchievements,
    workloadPercentage,
    workloadStatus,
    workloadLabel,
    workloadColor
  };
}

/**
 * Возвращает текстовое описание загруженности для подсказки
 */
export function getWorkloadDescription(metrics: WorkloadMetrics): string {
  const parts: string[] = [];
  
  if (metrics.activeTasks > 0) {
    parts.push(`${metrics.activeTasks} ${getTaskWord(metrics.activeTasks)}`);
  }
  
  if (metrics.responsibilities > 0) {
    parts.push(`${metrics.responsibilities} ${getResponsibilityWord(metrics.responsibilities)}`);
  }
  
  if (metrics.todayEvents > 0) {
    parts.push(`${metrics.todayEvents} ${getEventWord(metrics.todayEvents)} на сегодня`);
  }

  return parts.length > 0 ? parts.join(', ') : 'Нет активностей';
}

function getTaskWord(count: number): string {
  if (count === 1) return 'задача';
  if (count >= 2 && count <= 4) return 'задачи';
  return 'задач';
}

function getResponsibilityWord(count: number): string {
  if (count === 1) return 'обязанность';
  if (count >= 2 && count <= 4) return 'обязанности';
  return 'обязанностей';
}

function getEventWord(count: number): string {
  if (count === 1) return 'событие';
  if (count >= 2 && count <= 4) return 'события';
  return 'событий';
}