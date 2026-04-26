import { useState } from 'react';
import type { ShoppingItem } from '@/types/family.types';
import { initialShoppingList } from '@/data/mockData';

export default function useShoppingState() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('shoppingList');
    return saved ? JSON.parse(saved) : initialShoppingList;
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'products' | 'household' | 'clothes' | 'other'>('products');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'normal' | 'urgent'>('normal');
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);

  return {
    shoppingList, setShoppingList,
    newItemName, setNewItemName,
    newItemCategory, setNewItemCategory,
    newItemQuantity, setNewItemQuantity,
    newItemPriority, setNewItemPriority,
    showAddItemDialog, setShowAddItemDialog,
  };
}
