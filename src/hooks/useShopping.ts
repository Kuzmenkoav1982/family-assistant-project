import { useState, useEffect } from 'react';

const SHOPPING_API_URL = 'https://functions.poehali.dev/3f85241b-6c17-4d3d-a5f2-99b3af90af1b';

export interface ShoppingItem {
  id: string;
  family_id: string;
  name: string;
  category: string;
  quantity?: string;
  priority: 'urgent' | 'normal' | 'low';
  bought: boolean;
  added_by?: string;
  added_by_name?: string;
  bought_by?: string;
  bought_by_name?: string;
  bought_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken');

  const fetchItems = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(SHOPPING_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setItems(data.items || []);
      setError(null);
    } catch (err: any) {
      console.error('[useShopping] Error fetching items:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData: Partial<ShoppingItem>) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(SHOPPING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchItems();
    } catch (err: any) {
      console.error('[useShopping] Error creating item:', err);
      setError(err.message);
    }
  };

  const updateItem = async (itemId: string, updates: Partial<ShoppingItem>) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(SHOPPING_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ id: itemId, ...updates })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchItems();
    } catch (err: any) {
      console.error('[useShopping] Error updating item:', err);
      setError(err.message);
    }
  };

  const toggleBought = async (itemId: string, bought: boolean) => {
    await updateItem(itemId, { bought });
  };

  const deleteItem = async (itemId: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${SHOPPING_API_URL}?id=${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchItems();
    } catch (err: any) {
      console.error('[useShopping] Error deleting item:', err);
      setError(err.message);
    }
  };

  const clearBought = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(SHOPPING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token
        },
        body: JSON.stringify({ action: 'clear_bought' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchItems();
    } catch (err: any) {
      console.error('[useShopping] Error clearing bought items:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    toggleBought,
    deleteItem,
    clearBought,
    refreshItems: fetchItems
  };
}
