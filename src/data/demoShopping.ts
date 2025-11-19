export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: 'food' | 'household' | 'health' | 'kids' | 'other';
  urgent: boolean;
  checked: boolean;
  addedBy: string;
  price?: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: string;
  createdBy: string;
}

export const DEMO_SHOPPING_LISTS: ShoppingList[] = [
  {
    id: 'list-1',
    name: 'Продукты на неделю',
    createdAt: '2025-11-20',
    createdBy: 'mom',
    items: [
      {
        id: 'item-1',
        name: 'Молоко 2.5%',
        quantity: '2 литра',
        category: 'food',
        urgent: false,
        checked: false,
        addedBy: 'mom',
        price: 160
      },
      {
        id: 'item-2',
        name: 'Хлеб белый',
        quantity: '1 батон',
        category: 'food',
        urgent: false,
        checked: false,
        addedBy: 'mom',
        price: 45
      },
      {
        id: 'item-3',
        name: 'Яйца',
        quantity: '20 шт',
        category: 'food',
        urgent: false,
        checked: true,
        addedBy: 'mom',
        price: 180
      },
      {
        id: 'item-4',
        name: 'Куриное филе',
        quantity: '1 кг',
        category: 'food',
        urgent: false,
        checked: false,
        addedBy: 'grandma',
        price: 350
      },
      {
        id: 'item-5',
        name: 'Яблоки',
        quantity: '2 кг',
        category: 'food',
        urgent: false,
        checked: false,
        addedBy: 'mom',
        price: 200
      },
      {
        id: 'item-6',
        name: 'Бананы',
        quantity: '1 кг',
        category: 'food',
        urgent: false,
        checked: false,
        addedBy: 'daughter',
        price: 120
      },
      {
        id: 'item-7',
        name: 'Макароны',
        quantity: '500 г',
        category: 'food',
        urgent: false,
        checked: true,
        addedBy: 'grandma',
        price: 65
      },
      {
        id: 'item-8',
        name: 'Сметана 20%',
        quantity: '200 г',
        category: 'food',
        urgent: false,
        checked: false,
        addedBy: 'dad',
        price: 90
      }
    ]
  },
  {
    id: 'list-2',
    name: 'Хозяйственные товары',
    createdAt: '2025-11-21',
    createdBy: 'mom',
    items: [
      {
        id: 'item-9',
        name: 'Стиральный порошок',
        quantity: '3 кг',
        category: 'household',
        urgent: true,
        checked: false,
        addedBy: 'mom',
        price: 450
      },
      {
        id: 'item-10',
        name: 'Туалетная бумага',
        quantity: '12 рулонов',
        category: 'household',
        urgent: false,
        checked: false,
        addedBy: 'mom',
        price: 280
      },
      {
        id: 'item-11',
        name: 'Средство для посуды',
        quantity: '1 шт',
        category: 'household',
        urgent: false,
        checked: false,
        addedBy: 'grandma',
        price: 150
      }
    ]
  },
  {
    id: 'list-3',
    name: 'Для детей',
    createdAt: '2025-11-21',
    createdBy: 'mom',
    items: [
      {
        id: 'item-12',
        name: 'Тетради в клетку',
        quantity: '5 шт',
        category: 'kids',
        urgent: false,
        checked: false,
        addedBy: 'daughter',
        price: 250
      },
      {
        id: 'item-13',
        name: 'Альбом для рисования',
        quantity: '2 шт',
        category: 'kids',
        urgent: false,
        checked: false,
        addedBy: 'son',
        price: 180
      },
      {
        id: 'item-14',
        name: 'Цветные карандаши',
        quantity: '1 набор',
        category: 'kids',
        urgent: false,
        checked: false,
        addedBy: 'son',
        price: 320
      }
    ]
  }
];
