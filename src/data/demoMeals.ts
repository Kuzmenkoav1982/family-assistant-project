export interface MealPlan {
  id: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  dishName: string;
  description?: string;
  addedBy: string;
  addedByName: string;
  addedAt: string;
  emoji?: string;
}

export const DEMO_MEAL_PLANS: MealPlan[] = [
  {
    id: 'meal-1',
    day: 'monday',
    mealType: 'breakfast',
    dishName: 'Овсяная каша с фруктами',
    description: 'Овсянка на молоке с бананом, яблоком и медом',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T10:00:00Z',
    emoji: '🥣'
  },
  {
    id: 'meal-2',
    day: 'monday',
    mealType: 'lunch',
    dishName: 'Борщ украинский',
    description: 'Традиционный борщ со сметаной и чесночными пампушками',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T10:05:00Z',
    emoji: '🍲'
  },
  {
    id: 'meal-3',
    day: 'monday',
    mealType: 'dinner',
    dishName: 'Куриная грудка с овощами',
    description: 'Запеченная курица с брокколи и морковью',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T10:10:00Z',
    emoji: '🍗'
  },
  {
    id: 'meal-4',
    day: 'tuesday',
    mealType: 'breakfast',
    dishName: 'Блины с творогом',
    description: 'Тонкие блины с творожной начинкой и сметаной',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T10:15:00Z',
    emoji: '🥞'
  },
  {
    id: 'meal-5',
    day: 'tuesday',
    mealType: 'lunch',
    dishName: 'Макароны карбонара',
    description: 'Паста с беконом, яйцом и пармезаном',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T10:20:00Z',
    emoji: '🍝'
  },
  {
    id: 'meal-6',
    day: 'tuesday',
    mealType: 'dinner',
    dishName: 'Рыба на пару с рисом',
    description: 'Лосось на пару с гарниром из риса басмати',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T10:25:00Z',
    emoji: '🐟'
  },
  {
    id: 'meal-7',
    day: 'wednesday',
    mealType: 'breakfast',
    dishName: 'Яичница с беконом',
    description: 'Жареные яйца с хрустящим беконом и тостами',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T10:30:00Z',
    emoji: '🍳'
  },
  {
    id: 'meal-8',
    day: 'wednesday',
    mealType: 'lunch',
    dishName: 'Суп с фрикадельками',
    description: 'Легкий суп с мясными фрикадельками и овощами',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T10:35:00Z',
    emoji: '🍜'
  },
  {
    id: 'meal-9',
    day: 'wednesday',
    mealType: 'dinner',
    dishName: 'Котлеты с картофельным пюре',
    description: 'Домашние котлеты с нежным пюре',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T10:40:00Z',
    emoji: '🥔'
  },
  {
    id: 'meal-10',
    day: 'thursday',
    mealType: 'breakfast',
    dishName: 'Творожная запеканка',
    description: 'Запеканка с изюмом и сметанным соусом',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T10:45:00Z',
    emoji: '🍰'
  },
  {
    id: 'meal-11',
    day: 'thursday',
    mealType: 'lunch',
    dishName: 'Пицца Маргарита',
    description: 'Домашняя пицца с томатами, моцареллой и базиликом',
    addedBy: '3',
    addedByName: 'Матвей',
    addedAt: '2026-01-27T10:50:00Z',
    emoji: '🍕'
  },
  {
    id: 'meal-12',
    day: 'thursday',
    mealType: 'dinner',
    dishName: 'Гречка с тушеной говядиной',
    description: 'Гречневая каша с мясом в томатном соусе',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T10:55:00Z',
    emoji: '🍛'
  },
  {
    id: 'meal-13',
    day: 'friday',
    mealType: 'breakfast',
    dishName: 'Сырники со сметаной',
    description: 'Жареные творожные сырники с вареньем',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T11:00:00Z',
    emoji: '🥞'
  },
  {
    id: 'meal-14',
    day: 'friday',
    mealType: 'lunch',
    dishName: 'Салат Цезарь с курицей',
    description: 'Свежий салат с курицей, сухариками и пармезаном',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T11:05:00Z',
    emoji: '🥗'
  },
  {
    id: 'meal-15',
    day: 'friday',
    mealType: 'dinner',
    dishName: 'Пельмени домашние',
    description: 'Ручной работы пельмени со сметаной',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T11:10:00Z',
    emoji: '🥟'
  },
  {
    id: 'meal-16',
    day: 'saturday',
    mealType: 'breakfast',
    dishName: 'Вафли бельгийские',
    description: 'Хрустящие вафли с ягодами и кленовым сиропом',
    addedBy: '4',
    addedByName: 'Даша',
    addedAt: '2026-01-27T11:15:00Z',
    emoji: '🧇'
  },
  {
    id: 'meal-17',
    day: 'saturday',
    mealType: 'lunch',
    dishName: 'Шашлык из курицы',
    description: 'Маринованная курица на гриле с овощами',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T11:20:00Z',
    emoji: '🍢'
  },
  {
    id: 'meal-18',
    day: 'saturday',
    mealType: 'dinner',
    dishName: 'Суши ассорти',
    description: 'Домашние суши с лососем, огурцом и авокадо',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T11:25:00Z',
    emoji: '🍣'
  },
  {
    id: 'meal-19',
    day: 'sunday',
    mealType: 'breakfast',
    dishName: 'Омлет с овощами',
    description: 'Пышный омлет с помидорами, перцем и зеленью',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T11:30:00Z',
    emoji: '🍳'
  },
  {
    id: 'meal-20',
    day: 'sunday',
    mealType: 'lunch',
    dishName: 'Куриный суп-лапша',
    description: 'Домашний куриный бульон с лапшой и зеленью',
    addedBy: '1',
    addedByName: 'Анастасия',
    addedAt: '2026-01-27T11:35:00Z',
    emoji: '🍜'
  },
  {
    id: 'meal-21',
    day: 'sunday',
    mealType: 'dinner',
    dishName: 'Запеченная индейка с картофелем',
    description: 'Праздничное блюдо - индейка с картофельными дольками',
    addedBy: '2',
    addedByName: 'Алексей',
    addedAt: '2026-01-27T11:40:00Z',
    emoji: '🦃'
  }
];
