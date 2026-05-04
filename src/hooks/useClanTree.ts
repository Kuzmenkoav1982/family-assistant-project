import { useState, useEffect, useCallback } from 'react';
import func2url from '@/config/func2url';

const API_URL = func2url['clan-tree'];

interface ClanInfo {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  role: string;
  status: string;
}

interface ClanFamily {
  id: string;
  family_id: string;
  user_id: string;
  role: string;
  status: string;
  user_name: string | null;
  user_email: string | null;
  joined_at: string | null;
  created_at: string;
}

interface ClanInvite {
  id: string;
  clan_id: string;
  status: string;
  clan_name: string;
  clan_description: string | null;
  invited_by_name: string | null;
  created_at: string;
}

const getAuthToken = () => localStorage.getItem('authToken') || '';

export function useClanTree() {
  const [clan, setClan] = useState<ClanInfo | null>(null);
  const [families, setFamilies] = useState<ClanFamily[]>([]);
  const [invites, setInvites] = useState<ClanInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClan = useCallback(async () => {
    const token = getAuthToken();
    if (!token) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: { 'X-Auth-Token': token },
        signal: AbortSignal.timeout(10000)
      });
      const data = await res.json();
      if (res.ok) {
        setClan(data.clan || null);
        setFamilies(data.families || []);
        setInvites(data.invites || []);
      }
    } catch { /* network error */ }
    finally { setLoading(false); }
  }, []);

  const createClan = async (name: string, description?: string): Promise<{ success: boolean; error?: string }> => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}?action=create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ name, description })
      });
      const data = await res.json();
      if (res.ok) { await fetchClan(); return { success: true }; }
      return { success: false, error: data.error };
    } catch { return { success: false, error: 'Ошибка соединения' }; }
  };

  const inviteByEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}?action=invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) { await fetchClan(); return { success: true }; }
      return { success: false, error: data.error };
    } catch { return { success: false, error: 'Ошибка соединения' }; }
  };

  const acceptInvite = async (inviteId: string): Promise<boolean> => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}?action=accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ invite_id: inviteId })
      });
      if (res.ok) { await fetchClan(); return true; }
      return false;
    } catch { return false; }
  };

  const declineInvite = async (inviteId: string): Promise<boolean> => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}?action=decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ invite_id: inviteId })
      });
      if (res.ok) { await fetchClan(); return true; }
      return false;
    } catch { return false; }
  };

  useEffect(() => { fetchClan(); }, [fetchClan]);

  return { clan, families, invites, loading, fetchClan, createClan, inviteByEmail, acceptInvite, declineInvite };
}

export type { ClanInfo, ClanFamily, ClanInvite };
export default useClanTree;