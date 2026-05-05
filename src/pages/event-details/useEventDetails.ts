import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { API_URLS, getUserId } from './eventDetailsConstants';
import type { FamilyEvent, EventGuest, EventTask, EventExpense, WishlistItem, GuestGift } from '@/types/events';

export function useEventDetails(id: string | undefined) {
  const { toast } = useToast();

  const [event, setEvent] = useState<FamilyEvent | null>(null);
  const [guests, setGuests] = useState<EventGuest[]>([]);
  const [tasks, setTasks] = useState<EventTask[]>([]);
  const [expenses, setExpenses] = useState<EventExpense[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [guestGifts, setGuestGifts] = useState<GuestGift[]>([]);

  const [loading, setLoading] = useState(true);
  const [guestsLoading, setGuestsLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [guestGiftsLoading, setGuestGiftsLoading] = useState(false);

  const [showAddGuest, setShowAddGuest] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddWishlist, setShowAddWishlist] = useState(false);
  const [showAddGuestGift, setShowAddGuestGift] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAIIdeas, setShowAIIdeas] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.events}?id=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        throw new Error('Failed to fetch event');
      }
    } catch (error) {
      console.error('[EventDetails] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные праздника',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      setGuestsLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.guests}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('[FetchGuests] Error:', error);
    } finally {
      setGuestsLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.tasks}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('[FetchTasks] Error:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.expenses}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      }
    } catch (error) {
      console.error('[FetchExpenses] Error:', error);
    } finally {
      setExpensesLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setWishlistLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.wishlist}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      }
    } catch (error) {
      console.error('[FetchWishlist] Error:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchGuestGifts = async () => {
    try {
      setGuestGiftsLoading(true);
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${API_URLS.guestGifts}?eventId=${id}`, {
        headers: {
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGuestGifts(data);
      }
    } catch (error) {
      console.error('[FetchGuestGifts] Error:', error);
    } finally {
      setGuestGiftsLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, currentStatus: string) => {
    const statusOrder = ['pending', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    try {
      const userId = getUserId();
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(API_URLS.tasks, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
        toast({ title: 'Статус обновлён!' });
      }
    } catch (error) {
      console.error('[UpdateTask] Error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    event,
    guests,
    tasks,
    expenses,
    wishlist,
    guestGifts,
    loading,
    guestsLoading,
    tasksLoading,
    expensesLoading,
    wishlistLoading,
    guestGiftsLoading,
    showAddGuest,
    showAddTask,
    showAddExpense,
    showAddWishlist,
    showAddGuestGift,
    showShare,
    showAIIdeas,
    setShowAddGuest,
    setShowAddTask,
    setShowAddExpense,
    setShowAddWishlist,
    setShowAddGuestGift,
    setShowShare,
    setShowAIIdeas,
    fetchEvent,
    fetchGuests,
    fetchTasks,
    fetchExpenses,
    fetchWishlist,
    fetchGuestGifts,
    handleTaskStatusChange,
  };
}
