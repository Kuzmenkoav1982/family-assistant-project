import { useState, useEffect, useCallback } from 'react';
import func2url from '../../backend/func2url.json';

const API_URL = func2url['family-tree'];

interface TreeMember {
  id: number;
  family_id: number;
  name: string;
  relation: string | null;
  birth_year: number | null;
  death_year: number | null;
  bio: string | null;
  photo_url: string | null;
  parent_id: number | null;
  parent2_id: number | null;
  spouse_id: number | null;
  gender: string | null;
  birth_date: string | null;
  death_date: string | null;
  occupation: string | null;
  avatar: string;
  photos: Array<{id: number; photo_url: string; caption: string | null; sort_order: number; created_at: string}>;
  created_at: string;
  updated_at: string;
}

interface NewTreeMember {
  name: string;
  relation?: string;
  birth_year?: number;
  death_year?: number;
  bio?: string;
  photo_url?: string;
  parent_id?: number;
  parent2_id?: number;
  spouse_id?: number | null;
  gender?: string;
  birth_date?: string;
  death_date?: string;
  occupation?: string;
  avatar?: string;
}

const getAuthToken = () => localStorage.getItem('authToken') || '';

export function useFamilyTree() {
  const [members, setMembers] = useState<TreeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_URL, {
        headers: { 'X-Auth-Token': token },
        signal: AbortSignal.timeout(10000)
      });
      const data = await response.json();

      if (response.ok) {
        setMembers(data.members || []);
        setError(null);
      } else {
        setError(data.error || 'Ошибка загрузки древа');
      }
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = async (member: NewTreeMember): Promise<TreeMember | null> => {
    const token = getAuthToken();
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify(member)
      });
      const data = await response.json();

      if (response.ok && data.member) {
        setMembers(prev => [...prev, data.member]);
        return data.member;
      }
      setError(data.error || 'Ошибка добавления');
      return null;
    } catch {
      setError('Ошибка соединения');
      return null;
    }
  };

  const updateMember = async (id: number, updates: Partial<NewTreeMember>): Promise<boolean> => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();

      if (response.ok && data.member) {
        setMembers(prev => prev.map(m => m.id === id ? data.member : m));
        return true;
      }
      setError(data.error || 'Ошибка обновления');
      return false;
    } catch {
      setError('Ошибка соединения');
      return false;
    }
  };

  const deleteMember = async (id: number): Promise<boolean> => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token }
      });

      if (response.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        return true;
      }
      const data = await response.json();
      setError(data.error || 'Ошибка удаления');
      return false;
    } catch {
      setError('Ошибка соединения');
      return false;
    }
  };

  const addPhoto = async (memberId: number, photoUrl: string, caption?: string): Promise<boolean> => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_URL}?action=add_photo&member_id=${memberId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ photo_url: photoUrl, caption: caption || null })
      });
      const data = await response.json();

      if (response.ok && data.photo) {
        setMembers(prev => prev.map(m => {
          if (m.id === memberId) {
            return { ...m, photos: [...(m.photos || []), data.photo] };
          }
          return m;
        }));
        return true;
      }
      setError(data.error || 'Ошибка добавления фото');
      return false;
    } catch {
      setError('Ошибка соединения');
      return false;
    }
  };

  const deletePhoto = async (memberId: number, photoId: number): Promise<boolean> => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_URL}?action=delete_photo&member_id=${memberId}&photo_id=${photoId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token }
      });

      if (response.ok) {
        setMembers(prev => prev.map(m => {
          if (m.id === memberId) {
            return { ...m, photos: (m.photos || []).filter(p => p.id !== photoId) };
          }
          return m;
        }));
        return true;
      }
      const data = await response.json();
      setError(data.error || 'Ошибка удаления фото');
      return false;
    } catch {
      setError('Ошибка соединения');
      return false;
    }
  };

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return {
    members,
    loading,
    error,
    fetchTree,
    addMember,
    updateMember,
    deleteMember,
    addPhoto,
    deletePhoto
  };
}

export type { TreeMember, NewTreeMember };
export default useFamilyTree;