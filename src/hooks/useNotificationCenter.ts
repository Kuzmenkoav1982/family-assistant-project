import { useState, useEffect, useCallback } from 'react';
import func2url from '../../backend/func2url.json';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  target_url: string;
  channel: string;
  status: string;
  sent_at: string | null;
  read_at: string | null;
  created_at: string;
}

const API = func2url['notifications-api'];

export function useNotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getToken = () => localStorage.getItem('authToken');

  const fetchCount = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}?action=count`, {
        headers: { 'X-Auth-Token': token }
      });
      const data = await res.json();
      if (data.success) setUnreadCount(data.count);
    } catch { /* */ }
  }, []);

  const fetchNotifications = useCallback(async (limit = 50, offset = 0, type?: string) => {
    const token = getToken();
    if (!token) return;
    setIsLoading(true);
    try {
      let url = `${API}?action=list&limit=${limit}&offset=${offset}`;
      if (type) url += `&type=${type}`;
      const res = await fetch(url, { headers: { 'X-Auth-Token': token } });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch { /* */ }
    setIsLoading(false);
  }, []);

  const markRead = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ action: 'mark_read', id })
      });
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* */ }
  }, []);

  const markAllRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ action: 'mark_all_read' })
      });
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read', read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchCount,
    markRead,
    markAllRead
  };
}

export default useNotificationCenter;
