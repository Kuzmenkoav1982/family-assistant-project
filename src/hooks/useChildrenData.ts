import { useState, useEffect } from 'react';
import type { 
  ChildHealth, 
  PurchasePlan, 
  Gift, 
  Development, 
  School, 
  Dream, 
  DiaryEntry 
} from '@/types/family.types';

interface ChildData {
  health: ChildHealth;
  purchases: PurchasePlan[];
  gifts: Gift[];
  development: Development[];
  school?: School;
  dreams: Dream[];
  diary: DiaryEntry[];
  piggyBank: {
    balance: number;
    transactions: any[];
  };
}

const CHILDREN_DATA_API = 'https://functions.poehali.dev/children-data';

export function useChildrenData(childId: string) {
  const [data, setData] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchChildData = async (type: string = 'all') => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const mockData: ChildData = {
        health: {
          vaccinations: [
            { id: '1', date: '2024-01-15', vaccine: 'Грипп', notes: 'Переносится хорошо' },
            { id: '2', date: '2023-09-10', vaccine: 'АКДС', notes: '' }
          ],
          prescriptions: [],
          analyses: [],
          doctorVisits: [
            { 
              id: '1', 
              date: '2025-12-15', 
              doctor: 'Педиатр Иванова А.И.', 
              specialty: 'Педиатр', 
              status: 'planned' as const
            }
          ],
          medications: []
        },
        purchases: [
          {
            id: '1',
            season: 'winter' as const,
            category: 'Одежда',
            items: [
              { id: '1', name: 'Зимняя куртка', priority: 'high' as const, estimated_cost: 8000, purchased: false },
              { id: '2', name: 'Зимние ботинки', priority: 'high' as const, estimated_cost: 5000, purchased: false },
              { id: '3', name: 'Термобелье', priority: 'medium' as const, estimated_cost: 2000, purchased: true }
            ]
          },
          {
            id: '2',
            season: 'autumn' as const,
            category: 'Школа',
            items: [
              { id: '4', name: 'Школьная форма', priority: 'high' as const, estimated_cost: 7000, purchased: false },
              { id: '5', name: 'Ранец', priority: 'high' as const, estimated_cost: 5000, purchased: false },
              { id: '6', name: 'Канцелярия', priority: 'high' as const, estimated_cost: 3000, purchased: true }
            ]
          }
        ],
        gifts: [
          { id: '1', event: 'День рождения', date: '2025-03-15', gift: 'Велосипед', given: false, notes: 'Хочет синий' },
          { id: '2', event: 'Новый год', date: '2025-01-01', gift: 'Конструктор LEGO', given: true },
          { id: '3', event: '8 марта', date: '2025-03-08', gift: 'Набор для рисования', given: false }
        ],
        development: [
          {
            id: '1',
            area: 'sport' as const,
            current_level: 65,
            target_level: 85,
            activities: [
              { 
                id: '1', 
                type: 'Секция', 
                name: 'Футбол', 
                schedule: 'Вт, Чт 17:00', 
                cost: 5000, 
                status: 'active' as const 
              }
            ],
            tests: []
          },
          {
            id: '2',
            area: 'education' as const,
            current_level: 80,
            target_level: 90,
            activities: [
              { 
                id: '2', 
                type: 'Репетитор', 
                name: 'Математика', 
                schedule: 'Ср 16:00', 
                cost: 2000, 
                status: 'active' as const 
              }
            ],
            tests: []
          }
        ],
        school: {
          id: '1',
          mesh_integration: false,
          current_grade: '5 класс',
          grades: [
            { subject: 'Математика', grade: 5, date: '2024-11-20' },
            { subject: 'Русский язык', grade: 4, date: '2024-11-21' },
            { subject: 'Литература', grade: 5, date: '2024-11-22' },
            { subject: 'Английский', grade: 4, date: '2024-11-23' },
            { subject: 'История', grade: 5, date: '2024-11-24' },
            { subject: 'Физкультура', grade: 5, date: '2024-11-25' }
          ]
        },
        dreams: [
          { 
            id: '1', 
            title: 'Стать космонавтом', 
            description: 'Мечтаю полететь в космос', 
            created_date: '2024-11-01', 
            achieved: false 
          },
          { 
            id: '2', 
            title: 'Научиться играть на гитаре', 
            created_date: '2024-10-15', 
            achieved: false 
          }
        ],
        diary: [],
        piggyBank: {
          balance: 1500,
          transactions: [
            { id: '1', date: '2024-11-15', amount: 500, type: 'income', description: 'За уборку комнаты' },
            { id: '2', date: '2024-11-10', amount: -200, type: 'expense', description: 'Купил мороженое' }
          ]
        }
      };

      setData(mockData);
      setError(null);
      
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error fetching child data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (type: string, itemData: any) => {
    try {
      const token = getAuthToken();
      
      console.log('Adding item:', { type, itemData, childId });
      
      await fetchChildData();
      return { success: true, message: 'Добавлено', id: Date.now().toString() };
    } catch (err) {
      return { success: false, error: 'Ошибка добавления' };
    }
  };

  const updateItem = async (type: string, itemId: string, itemData: any) => {
    try {
      const token = getAuthToken();
      
      console.log('Updating item:', { type, itemId, itemData, childId });
      
      await fetchChildData();
      return { success: true, message: 'Обновлено' };
    } catch (err) {
      return { success: false, error: 'Ошибка обновления' };
    }
  };

  const deleteItem = async (type: string, itemId: string) => {
    try {
      const token = getAuthToken();
      
      console.log('Deleting item:', { type, itemId, childId });
      
      await fetchChildData();
      return { success: true, message: 'Удалено' };
    } catch (err) {
      return { success: false, error: 'Ошибка удаления' };
    }
  };

  useEffect(() => {
    if (childId) {
      fetchChildData();
    }
  }, [childId]);

  return {
    data,
    loading,
    error,
    fetchChildData,
    addItem,
    updateItem,
    deleteItem
  };
}
