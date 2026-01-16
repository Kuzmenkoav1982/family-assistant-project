import type { FamilyMember, Task } from '@/types/family.types';

export interface CohesionMetrics {
  category: string;
  score: number;
  maxScore: number;
  icon: string;
  details: string;
}

export interface CohesionCalculationResult {
  metrics: CohesionMetrics[];
  averageScore: number;
  totalPoints: number;
}

export function calculateFamilyCohesion(
  familyMembers: FamilyMember[],
  tasks: Task[],
  chatMessagesCount: number = 0,
  albumPhotosCount: number = 0,
  lastActivityDays: number = 0
): CohesionCalculationResult {
  const metrics: CohesionMetrics[] = [];

  const safeMembers = Array.isArray(familyMembers) ? familyMembers : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const completedTasks = safeTasks.filter(t => t.completed).length;
  const totalTasks = safeTasks.length || 1;
  const taskCompletionRate = Math.round((completedTasks / totalTasks) * 100);
  metrics.push({
    category: 'Задачи',
    score: taskCompletionRate,
    maxScore: 100,
    icon: 'CheckSquare',
    details: `${completedTasks} из ${totalTasks} выполнено`
  });

  const hasProfilesComplete = safeMembers.filter(m => 
    m.name && m.avatar && m.role
  ).length;
  const profileCompleteness = Math.round((hasProfilesComplete / (safeMembers.length || 1)) * 100);
  const activeMembers = safeMembers.filter(m => m.points && m.points > 0).length;
  const activityScore = Math.min(100, Math.round((activeMembers / (safeMembers.length || 1)) * 100));
  
  metrics.push({
    category: 'Традиции',
    score: Math.min(100, profileCompleteness + (activeMembers > 0 ? 20 : 0)),
    maxScore: 100,
    icon: 'Heart',
    details: `${hasProfilesComplete} профилей заполнено`
  });

  const communicationScore = Math.min(100, Math.round((chatMessagesCount / 10) * 100));
  metrics.push({
    category: 'Общение',
    score: communicationScore,
    maxScore: 100,
    icon: 'MessageCircle',
    details: `${chatMessagesCount} сообщений`
  });

  const totalPoints = safeMembers.reduce((sum, m) => sum + (m.points || 0), 0);
  const avgPointsPerMember = totalPoints / (safeMembers.length || 1);
  const valuesScore = Math.min(100, Math.round(avgPointsPerMember / 10));
  
  metrics.push({
    category: 'Ценности',
    score: valuesScore,
    maxScore: 100,
    icon: 'Star',
    details: `${totalPoints} баллов набрано`
  });

  const recentActivityScore = lastActivityDays === 0 
    ? 100 
    : Math.max(0, 100 - lastActivityDays * 10);
  
  metrics.push({
    category: 'Активность',
    score: Math.round(recentActivityScore),
    maxScore: 100,
    icon: 'Activity',
    details: lastActivityDays === 0 ? 'Сегодня активны' : `${lastActivityDays} дней назад`
  });

  const albumScore = Math.min(100, Math.round((albumPhotosCount / 20) * 100));
  metrics.push({
    category: 'Поддержка',
    score: albumScore,
    maxScore: 100,
    icon: 'HandHelping',
    details: `${albumPhotosCount} фото в альбоме`
  });

  const averageScore = Math.round(
    metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length
  );

  return {
    metrics,
    averageScore,
    totalPoints
  };
}

export function calculateFamilyRank(
  averageScore: number,
  totalPoints: number,
  totalFamilies: number = 1250
): number {
  const scoreWeight = 0.7;
  const pointsWeight = 0.3;
  
  const normalizedScore = averageScore / 100;
  const normalizedPoints = Math.min(1, totalPoints / 1000);
  
  const overallScore = (normalizedScore * scoreWeight) + (normalizedPoints * pointsWeight);
  
  const estimatedRank = Math.max(1, Math.round(totalFamilies * (1 - overallScore)));
  
  return estimatedRank;
}