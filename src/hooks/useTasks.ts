import { useState, useEffect } from 'react';
import { initialTasks } from '@/data/mockData';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_name?: string;
  completed: boolean;
  points: number;
  priority: string;
  category?: string;
  reminder_time?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  recurring_interval?: number;
  recurring_days_of_week?: string;
  recurring_end_date?: string;
  next_occurrence?: string;
  cooking_day?: string;
  created_at: string;
  updated_at: string;
}

const API_URL = 'https://functions.poehali.dev/638290a3-bc43-46ef-9ca1-1e80b72544bf';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchTasks = async (completed?: boolean, silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    
    // Проверяем демо-режим
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    
    if (isDemoMode) {
      console.log('[useTasks] Demo mode active, using mock data');
      
      // Имитируем небольшую задержку загрузки
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const convertedTasks = initialTasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        assignee_id: `demo_${task.assignee}`,
        assignee_name: task.assignee,
        completed: task.completed,
        points: task.points,
        priority: task.priority || 'medium',
        category: task.category,
        reminder_time: task.reminderTime,
        is_recurring: task.isRecurring || false,
        recurring_frequency: task.recurringPattern?.frequency,
        recurring_interval: task.recurringPattern?.interval,
        recurring_days_of_week: task.recurringPattern?.daysOfWeek?.join(','),
        recurring_end_date: task.recurringPattern?.endDate,
        next_occurrence: task.nextOccurrence,
        cooking_day: task.cookingDay,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Фильтруем по completed если указано
      const filteredTasks = completed !== undefined 
        ? convertedTasks.filter(t => t.completed === completed)
        : convertedTasks;
      
      setTasks(filteredTasks);
      setError(null);
      setLoading(false);
      return;
    }
    
    try {
      const url = completed !== undefined ? `${API_URL}?completed=${completed}` : API_URL;
      const response = await fetch(url, {
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.tasks) {
        setTasks(data.tasks);
      } else {
        if (!silent) {
          setTasks([]);
          setError(data.error || 'Ошибка загрузки задач');
        }
      }
    } catch (err) {
      if (!silent) {
        setTasks([]);
        setError('Ошибка соединения с сервером');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const createTask = async (taskData: Partial<Task>) => {
    try {
      console.log('[useTasks] Creating task with data:', taskData);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify(taskData)
      });
      
      console.log('[useTasks] Response status:', response.status);
      const data = await response.json();
      console.log('[useTasks] Response data:', data);
      
      if (response.ok) {
        setTasks(prev => [data.task, ...prev]);
        
        // Отправляем push-уведомление исполнителю (исключая создателя)
        if (data.task.assignee_id) {
          try {
            const userDataStr = localStorage.getItem('userData');
            const currentUserId = userDataStr ? JSON.parse(userDataStr).id : null;
            
            const notifResponse = await fetch('https://functions.poehali.dev/3c808a69-0f14-4db0-b486-3e2a0e273a94', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': getAuthToken()
              },
              body: JSON.stringify({
                action: 'send',
                title: '✅ Новая задача',
                message: `${data.task.assignee_name || 'Вам'} назначена задача: ${data.task.title}`,
                exclude_user_id: currentUserId
              })
            });
            console.log('[useTasks] Notification response:', notifResponse.status, await notifResponse.text());
          } catch (err) {
            console.error('[useTasks] Failed to send notification:', err);
          }
        }
        
        return { success: true, task: data.task };
      } else {
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }
    } catch (err) {
      console.error('[useTasks] Error creating task:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Ошибка создания задачи' };
    }
  };

  const updateTask = async (taskData: Partial<Task> & { id: string }) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTasks(prev => prev.map(t => t.id === data.task.id ? data.task : t));
        return { success: true, task: data.task };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка обновления задачи' };
    }
  };

  const deleteTask = async (taskId: string) => {
    console.log('[useTasks] deleteTask called with ID:', taskId);
    try {
      const url = `${API_URL}?id=${taskId}`;
      console.log('[useTasks] DELETE request URL:', url);
      console.log('[useTasks] Auth token:', getAuthToken() ? 'EXISTS' : 'MISSING');
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });
      
      console.log('[useTasks] DELETE response status:', response.status);
      const data = await response.json();
      console.log('[useTasks] DELETE response data:', data);
      
      if (response.ok) {
        console.log('[useTasks] Removing task from local state:', taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
        return { success: true };
      } else {
        console.error('[useTasks] DELETE failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('[useTasks] DELETE exception:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Ошибка удаления задачи' };
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // В демо-режиме просто обновляем состояние локально
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    if (isDemoMode) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));
      return { success: true };
    }
    
    return updateTask({
      id: taskId,
      completed: !task.completed
    });
  };

  useEffect(() => {
    const token = getAuthToken();
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true';
    
    if (token || isDemoMode) {
      fetchTasks();
      
      // В демо-режиме не нужен автообновление с сервера
      if (!isDemoMode) {
        const interval = setInterval(() => {
          fetchTasks(undefined, true);
        }, 5000);
        
        return () => clearInterval(interval);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTask
  };
}