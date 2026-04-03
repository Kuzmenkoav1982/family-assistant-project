import { useState, useEffect, useCallback } from 'react';
import { getCurrencyByCode } from '@/data/currencies';
import { useDemoMode } from '@/contexts/DemoModeContext';
import type { LeisureActivity, NewActivityForm } from '@/data/leisureTypes';
import { TRIPS_API_URL, INITIAL_NEW_ACTIVITY } from '@/data/leisureTypes';

export default function useLeisure() {
  const { isDemoMode, demoLeisureActivities } = useDemoMode();
  const [activities, setActivities] = useState<LeisureActivity[]>([]);
  const [allActivities, setAllActivities] = useState<LeisureActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('want_to_go');
  const [viewMode, setViewMode] = useState<'grid' | 'map' | 'calendar' | 'stats'>('grid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<LeisureActivity | null>(null);
  const [newActivity, setNewActivity] = useState<NewActivityForm>({ ...INITIAL_NEW_ACTIVITY });
  const [tagInput, setTagInput] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);

  const getAllTags = () => {
    const tagsSet = new Set<string>();
    if (allActivities && Array.isArray(allActivities)) {
      allActivities.forEach(activity => {
        activity.tags?.forEach(tag => tagsSet.add(tag));
      });
    }
    return Array.from(tagsSet).sort();
  };

  const loadActivities = useCallback(async (status: string) => {
    if (isDemoMode) {
      setLoading(true);
      const filtered = status === 'all'
        ? demoLeisureActivities
        : demoLeisureActivities.filter(a => a.status === status);
      setActivities(filtered);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/?action=leisure&status=${status}`, {
        headers: { 'X-Auth-Token': token || '' }
      });
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode, demoLeisureActivities]);

  const loadAllActivities = useCallback(async () => {
    if (isDemoMode) {
      setAllActivities(demoLeisureActivities);
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(`${TRIPS_API_URL}/?action=leisure&status=all`, {
        headers: { 'X-Auth-Token': token || '' }
      });
      const data = await response.json();
      setAllActivities(data.activities || []);
    } catch (error) {
      console.error('Error loading all activities:', error);
    }
  }, [isDemoMode, demoLeisureActivities]);

  useEffect(() => {
    loadActivities(activeTab);
    loadAllActivities();
  }, [activeTab, loadActivities, loadAllActivities]);

  const handleCreateActivity = async () => {
    if (!newActivity.title || !newActivity.category) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({
          action: 'create_leisure',
          ...newActivity,
          price: newActivity.price ? parseFloat(newActivity.price) : null,
          latitude: newActivity.latitude ? parseFloat(newActivity.latitude) : null,
          longitude: newActivity.longitude ? parseFloat(newActivity.longitude) : null,
          tags: newActivity.tags,
          participants: newActivity.participants,
        }),
      });

      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
        setIsAddDialogOpen(false);
        resetNewActivity();
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      alert('Ошибка при создании активности');
    }
  };

  const handleUpdateActivity = async () => {
    if (!editingActivity || !editingActivity.title) {
      alert('Заполните обязательные поля');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ action: 'update_leisure', ...editingActivity }),
      });

      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
        setIsEditDialogOpen(false);
        setEditingActivity(null);
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      alert('Ошибка при обновлении активности');
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('Удалить эту активность?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ action: 'delete_leisure', id }),
      });

      await loadActivities(activeTab);
      await loadAllActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleGenerateShareLink = async (activity: LeisureActivity) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ action: 'share_leisure', id: activity.id }),
      });
      const data = await response.json();
      if (data.share_url) {
        navigator.clipboard.writeText(data.share_url);
        alert('Ссылка скопирована в буфер обмена!');
        await loadActivities(activeTab);
        await loadAllActivities();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRevokeShareLink = async (activity: LeisureActivity) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ action: 'revoke_share_leisure', id: activity.id }),
      });
      await loadActivities(activeTab);
      await loadAllActivities();
    } catch (error) {
      console.error('Error revoking share:', error);
    }
  };

  const handleAddFromAI = async (place: { name: string; category: string; description: string }) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({
          action: 'create_leisure',
          title: place.name,
          category: place.category || 'other',
          notes: place.description,
          status: 'want_to_go',
          currency: 'RUB',
        }),
      });
      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
      }
    } catch (error) {
      console.error('Error adding from AI:', error);
    }
  };

  const handleAddFromSearch = async (place: { name: string; address: string; lat: number; lon: number }) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({
          action: 'create_leisure',
          title: place.name,
          location: place.address,
          latitude: place.lat,
          longitude: place.lon,
          category: 'other',
          status: 'want_to_go',
          currency: 'RUB',
        }),
      });
      if (response.ok) {
        await loadActivities(activeTab);
        await loadAllActivities();
      }
    } catch (error) {
      console.error('Error adding from search:', error);
    }
  };

  const handleCalendarDateChange = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setNewActivity(prev => ({ ...prev, date: dateStr }));
    setIsAddDialogOpen(true);
  };

  const handleCalendarDateClick = (activity: LeisureActivity) => {
    setEditingActivity(activity);
    setIsEditDialogOpen(true);
  };

  const resetNewActivity = () => {
    setNewActivity({ ...INITIAL_NEW_ACTIVITY });
    setTagInput('');
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return null;
    const currencyInfo = getCurrencyByCode(currency || 'RUB');
    return `${new Intl.NumberFormat('ru-RU').format(price)} ${currencyInfo?.symbol || currency}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getTabCounts = () => ({
    want_to_go: allActivities.filter(a => a.status === 'want_to_go').length,
    planned: allActivities.filter(a => a.status === 'planned').length,
    visited: allActivities.filter(a => a.status === 'visited').length,
    all: allActivities.length,
  });

  return {
    activities, allActivities, loading,
    activeTab, setActiveTab, viewMode, setViewMode,
    isAddDialogOpen, setIsAddDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    editingActivity, setEditingActivity,
    newActivity, setNewActivity,
    tagInput, setTagInput,
    selectedTagFilter, setSelectedTagFilter,
    getAllTags, getTabCounts, formatPrice, formatDate,
    handleCreateActivity, handleUpdateActivity,
    handleDeleteActivity, handleGenerateShareLink,
    handleRevokeShareLink, handleAddFromAI,
    handleAddFromSearch, handleCalendarDateChange,
    handleCalendarDateClick,
  };
}
