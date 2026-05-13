import func2url from '../../../backend/func2url.json';
import { lifeApi } from '@/components/life-road/api';

// Мост Workshop → Planning (Этап 3.1).
// Создание task с prefill из goal/milestone/KR + регистрация связи в goal_action_links.
// Связь: entityType='task', meta={source, sourceTitle}, milestoneId/keyResultId опционально.

const TASKS_URL = (func2url as Record<string, string>)['tasks'];

export type TaskSource = 'goal' | 'milestone' | 'keyresult';

export interface CreateTaskFromGoalInput {
  goalId: string;
  source: TaskSource;
  sourceTitle: string;
  milestoneId?: string;
  keyResultId?: string;
  // Prefilled task fields
  title: string;
  description?: string;
  deadline?: string | null; // ISO date
  assigneeId?: string | null;
  category?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

function getAuthToken(): string {
  return (
    localStorage.getItem('auth_token') ||
    localStorage.getItem('authToken') ||
    ''
  );
}

async function createTask(input: CreateTaskFromGoalInput): Promise<{ id: string }> {
  const token = getAuthToken();
  const res = await fetch(TASKS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
    body: JSON.stringify({
      title: input.title,
      assignee_id: input.assigneeId || null,
      category: input.category || 'general',
      priority: input.priority || 'medium',
      deadline: input.deadline || null,
      // помечаем источник в title-meta пока без отдельной колонки:
      // основная связь живёт в goal_action_links
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Не удалось создать задачу: ${res.status} ${text}`);
  }
  const data = await res.json();
  // Поддерживаем разные форматы ответа
  const taskId = data?.task?.id || data?.id || data?.taskId;
  if (!taskId) throw new Error('Задача создана, но не удалось получить её id');
  return { id: String(taskId) };
}

export async function createTaskFromGoal(input: CreateTaskFromGoalInput): Promise<{ taskId: string }> {
  // 1. Создаём task
  const { id: taskId } = await createTask(input);

  // 2. Регистрируем связь в goal_action_links
  try {
    await lifeApi.createLink({
      goalId: input.goalId,
      entityType: 'task',
      entityId: taskId,
      milestoneId: input.milestoneId,
      keyResultId: input.keyResultId,
      meta: {
        source: input.source,
        sourceTitle: input.sourceTitle,
        createdFromUI: 'workshop',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (e) {
    // Task создан, но связь не записана — это видимая ошибка, не silent fail.
    throw new Error(
      `Задача создана (id=${taskId}), но связь с целью записать не удалось: ${(e as Error).message}. ` +
        `Свяжи задачу с целью вручную в админке или повтори попытку.`,
    );
  }

  return { taskId };
}

export function buildPrefillFromGoal(args: {
  goalId: string;
  goalTitle: string;
  goalDeadline?: string | null;
}): CreateTaskFromGoalInput {
  return {
    goalId: args.goalId,
    source: 'goal',
    sourceTitle: args.goalTitle,
    title: args.goalTitle,
    description: `Из цели: ${args.goalTitle}`,
    deadline: args.goalDeadline ?? null,
    priority: 'medium',
  };
}

export function buildPrefillFromMilestone(args: {
  goalId: string;
  goalTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneDueDate?: string | null;
}): CreateTaskFromGoalInput {
  return {
    goalId: args.goalId,
    source: 'milestone',
    sourceTitle: args.milestoneTitle,
    milestoneId: args.milestoneId,
    title: args.milestoneTitle,
    description: `Веха цели «${args.goalTitle}»: ${args.milestoneTitle}`,
    deadline: args.milestoneDueDate ?? null,
    priority: 'medium',
  };
}

export function buildPrefillFromKr(args: {
  goalId: string;
  goalTitle: string;
  krId: string;
  krTitle: string;
  krDueDate?: string | null;
}): CreateTaskFromGoalInput {
  return {
    goalId: args.goalId,
    source: 'keyresult',
    sourceTitle: args.krTitle,
    keyResultId: args.krId,
    title: args.krTitle,
    description: `Key Result цели «${args.goalTitle}»: ${args.krTitle}`,
    deadline: args.krDueDate ?? null,
    priority: 'medium',
  };
}
