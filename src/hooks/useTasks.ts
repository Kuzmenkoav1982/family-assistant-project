import { useState, useEffect } from 'react';

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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTasks(prev => [data.task, ...prev]);
        return { success: true, task: data.task };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка создания задачи' };
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
    try {
      const response = await fetch(`${API_URL}?id=${taskId}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': getAuthToken()
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Ошибка удаления задачи' };
    }
  };

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    return updateTask({
      id: taskId,
      completed: !task.completed
    });
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchTasks();
      
      const interval = setInterval(() => {
        fetchTasks(undefined, true);
      }, 5000);
      
      return () => clearInterval(interval);
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