import { useState, useEffect, useCallback } from 'react';
import func2url from '../../backend/func2url.json';

const API = func2url['garage'];

function getToken() {
  return localStorage.getItem('authToken') || '';
}

async function api(action: string, params?: Record<string, string>) {
  const qs = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${API}?${qs}`, {
    headers: { 'X-Auth-Token': getToken() },
  });
  return res.json();
}

async function post(action: string, body: Record<string, unknown>) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Auth-Token': getToken() },
    body: JSON.stringify({ action, ...body }),
  });
  return res.json();
}

export interface Vehicle {
  id: string;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
  vin?: string;
  mileage?: number;
  photo_url?: string;
  responsible_member_id?: string;
  notes?: string;
  urgent_reminders?: number;
  total_expenses?: number;
  created_at: string;
}

export interface ServiceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  title: string;
  description?: string;
  date: string;
  mileage?: number;
  cost?: number;
  service_station?: string;
  parts_replaced?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  vehicle_id: string;
  category: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Reminder {
  id: string;
  vehicle_id: string;
  reminder_type: string;
  title: string;
  description?: string;
  due_date?: string;
  due_mileage?: number;
  is_completed: boolean;
  created_at: string;
}

export interface GarageNote {
  id: string;
  vehicle_id: string;
  author_name?: string;
  text: string;
  priority: string;
  is_resolved: boolean;
  created_at: string;
}

export interface GarageStats {
  vehicle_count: number;
  total_expenses: number;
  month_expenses: number;
  active_reminders: number;
  urgent_reminders: number;
  expenses_by_category: { category: string; total: number }[];
}

export default function useGarage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<GarageStats | null>(null);

  const loadVehicles = useCallback(async () => {
    setLoading(true);
    const data = await api('list');
    if (data.vehicles) setVehicles(data.vehicles);
    setLoading(false);
  }, []);

  const loadStats = useCallback(async (vehicleId?: string) => {
    const params: Record<string, string> = {};
    if (vehicleId) params.vehicle_id = vehicleId;
    const data = await api('stats', params);
    if (data.stats) setStats(data.stats);
  }, []);

  useEffect(() => {
    loadVehicles();
    loadStats();
  }, [loadVehicles, loadStats]);

  const createVehicle = async (v: Partial<Vehicle>) => {
    const data = await post('create_vehicle', v);
    if (data.success) await loadVehicles();
    return data;
  };

  const updateVehicle = async (vehicleId: string, v: Partial<Vehicle>) => {
    const data = await post('update_vehicle', { vehicle_id: vehicleId, ...v });
    if (data.success) await loadVehicles();
    return data;
  };

  const deleteVehicle = async (vehicleId: string) => {
    const data = await post('delete_vehicle', { vehicle_id: vehicleId });
    if (data.success) await loadVehicles();
    return data;
  };

  const loadServices = async (vehicleId: string): Promise<ServiceRecord[]> => {
    const data = await api('services', { vehicle_id: vehicleId });
    return data.services || [];
  };

  const createService = async (vehicleId: string, s: Partial<ServiceRecord>) => {
    return post('create_service', { vehicle_id: vehicleId, ...s });
  };

  const deleteService = async (serviceId: string) => {
    return post('delete_service', { service_id: serviceId });
  };

  const loadExpenses = async (vehicleId: string): Promise<Expense[]> => {
    const data = await api('expenses', { vehicle_id: vehicleId });
    return data.expenses || [];
  };

  const createExpense = async (vehicleId: string, e: Partial<Expense>) => {
    return post('create_expense', { vehicle_id: vehicleId, ...e });
  };

  const deleteExpense = async (expenseId: string) => {
    return post('delete_expense', { expense_id: expenseId });
  };

  const loadReminders = async (vehicleId?: string): Promise<Reminder[]> => {
    const params: Record<string, string> = {};
    if (vehicleId) params.vehicle_id = vehicleId;
    const data = await api('reminders', params);
    return data.reminders || [];
  };

  const createReminder = async (vehicleId: string, r: Partial<Reminder>) => {
    return post('create_reminder', { vehicle_id: vehicleId, ...r });
  };

  const toggleReminder = async (reminderId: string) => {
    return post('toggle_reminder', { reminder_id: reminderId });
  };

  const deleteReminder = async (reminderId: string) => {
    return post('delete_reminder', { reminder_id: reminderId });
  };

  const loadNotes = async (vehicleId: string): Promise<GarageNote[]> => {
    const data = await api('notes', { vehicle_id: vehicleId });
    return data.notes || [];
  };

  const createNote = async (vehicleId: string, n: Partial<GarageNote>) => {
    return post('create_note', { vehicle_id: vehicleId, ...n });
  };

  const toggleNote = async (noteId: string) => {
    return post('toggle_note', { note_id: noteId });
  };

  const deleteNote = async (noteId: string) => {
    return post('delete_note', { note_id: noteId });
  };

  return {
    vehicles, loading, stats,
    loadVehicles, loadStats,
    createVehicle, updateVehicle, deleteVehicle,
    loadServices, createService, deleteService,
    loadExpenses, createExpense, deleteExpense,
    loadReminders, createReminder, toggleReminder, deleteReminder,
    loadNotes, createNote, toggleNote, deleteNote,
  };
}
