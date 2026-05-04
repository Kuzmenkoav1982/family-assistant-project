import { useState, useEffect, useCallback } from 'react';
import func2url from '@/config/func2url';

const API = func2url['pets'];

function getToken() {
  return localStorage.getItem('authToken') || '';
}

async function apiGet(action: string, params?: Record<string, string>) {
  const qs = new URLSearchParams({ action, ...(params || {}) }).toString();
  const res = await fetch(`${API}?${qs}`, {
    headers: { 'X-Auth-Token': getToken() },
  });
  return res.json();
}

async function apiSend(action: string, body: Record<string, unknown>, method: 'POST' | 'PUT' | 'DELETE' = 'POST') {
  const res = await fetch(API, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
    body: JSON.stringify({ action, ...body }),
  });
  return res.json();
}

export interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  gender?: string;
  birth_date?: string;
  weight?: number;
  color?: string;
  chip_number?: string;
  photo_url?: string;
  notes?: string;
  allergies?: string;
  responsible_member_id?: string;
  created_at: string;
}

export interface PetStats {
  pets_count: number;
  total_expenses: number;
  month_expenses: number;
  upcoming_vaccines: number;
  active_medications: number;
}

export type PetSubKind =
  | 'vaccines' | 'vet' | 'medications' | 'food' | 'grooming'
  | 'activities' | 'expenses' | 'health' | 'items' | 'responsibilities' | 'photos';

export default function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PetStats | null>(null);

  const loadPets = useCallback(async () => {
    setLoading(true);
    const data = await apiGet('list_pets');
    if (data.pets) setPets(data.pets);
    setLoading(false);
  }, []);

  const loadStats = useCallback(async (petId?: string) => {
    const params: Record<string, string> = {};
    if (petId) params.pet_id = petId;
    const data = await apiGet('stats', params);
    if (data.stats) setStats(data.stats);
  }, []);

  const createPet = useCallback(async (pet: Partial<Pet>) => {
    const data = await apiSend('create_pet', pet as Record<string, unknown>);
    await loadPets();
    return data.pet;
  }, [loadPets]);

  const updatePet = useCallback(async (id: string, patch: Partial<Pet>) => {
    const data = await apiSend('update_pet', { id, ...patch }, 'PUT');
    await loadPets();
    return data.pet;
  }, [loadPets]);

  const deletePet = useCallback(async (id: string) => {
    await apiSend('delete_pet', { id }, 'DELETE');
    await loadPets();
  }, [loadPets]);

  const listSub = useCallback(async <T = Record<string, unknown>>(kind: PetSubKind, petId?: string): Promise<T[]> => {
    const params: Record<string, string> = {};
    if (petId) params.pet_id = petId;
    const data = await apiGet(`list_${kind}`, params);
    return (data.items || []) as T[];
  }, []);

  const createSub = useCallback(async (kind: PetSubKind, payload: Record<string, unknown>) => {
    const data = await apiSend(`create_${kind}`, payload);
    return data.item;
  }, []);

  const updateSub = useCallback(async (kind: PetSubKind, payload: Record<string, unknown>) => {
    const data = await apiSend(`update_${kind}`, payload, 'PUT');
    return data.item;
  }, []);

  const deleteSub = useCallback(async (kind: PetSubKind, id: string) => {
    await apiSend(`delete_${kind}`, { id }, 'DELETE');
  }, []);

  useEffect(() => { loadPets(); }, [loadPets]);

  return {
    pets, loading, stats,
    loadPets, loadStats,
    createPet, updatePet, deletePet,
    listSub, createSub, updateSub, deleteSub,
  };
}