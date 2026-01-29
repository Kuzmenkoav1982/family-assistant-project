export interface Recipe {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: string[];
  instructions: string[];
  image?: string;
  rating: number;
  favoriteBy: string[];
  tags: string[];
}

export interface MealVote {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  options: {
    recipeId: string;
    recipeName: string;
    votes: string[];
  }[];
  status: 'active' | 'closed';
  winnerId?: string;
}

export const DEMO_RECIPES: Recipe[] = [
  {
    id: 'recipe-1',
    name: 'Борщ классический',
    category: 'lunch',
    prepTime: 20,
    cookTime: 90,
    servings: 6,
    difficulty: 'medium',
    ingredients: [
      'Говядина на кости - 500г',
      'Свекла - 2 шт',
      'Капуста белокочанная - 300г',
      'Картофель - 3 шт',
      'Морковь - 1 шт',
      'Лук репчатый - 1 шт',
      'Томатная паста - 2 ст.л.',
      'Чеснок - 3 зубчика',
      'Лавровый лист - 2 шт',
      'Соль, перец по вкусу'
    ],
    instructions: [
      'Залить мясо холодной водой и поставить варить на 1,5 часа',
      'Нарезать свеклу соломкой и потушить с томатной пастой',
      'Нарезать овощи: капусту, картофель, морковь, лук',
      'Добавить в бульон картофель, варить 10 минут',
      'Добавить капусту, морковь, лук, варить 10 минут',
      'Добавить свеклу, варить 5 минут',
      'Добавить специи, чеснок, дать настояться 15 минут',
      'Подавать со сметаной и чесночными пампушками'
    ],
    image: 'https://images.unsplash.com/photo-1604908815699-9d9a4c103b90?w=800',
    rating: 5,
    favoriteBy: ['dad', 'grandpa', 'grandma'],
    tags: ['семейный', 'традиционный', 'сытный']
  },
  {
    id: 'recipe-2',
    name: 'Блины тонкие на молоке',
    category: 'breakfast',
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      'Молоко - 500мл',
      'Яйца - 2 шт',
      'Мука - 200г',
      'Сахар - 2 ст.л.',
      'Соль - щепотка',
      'Растительное масло - 3 ст.л.',
      'Ванилин - по вкусу'
    ],
    instructions: [
      'Смешать яйца с сахаром и солью',
      'Добавить половину молока, перемешать',
      'Постепенно всыпать муку, размешивая до однородности',
      'Влить оставшееся молоко и масло',
      'Разогреть сковороду, смазать маслом',
      'Выливать тесто тонким слоем, жарить с двух сторон',
      'Подавать с медом, вареньем или сметаной'
    ],
    image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800',
    rating: 5,
    favoriteBy: ['daughter', 'son', 'mom'],
    tags: ['завтрак', 'быстро', 'любимое']
  },
  {
    id: 'recipe-3',
    name: 'Котлеты домашние',
    category: 'dinner',
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      'Фарш говяжий - 500г',
      'Лук репчатый - 1 шт',
      'Чеснок - 2 зубчика',
      'Яйцо - 1 шт',
      'Батон - 2 ломтика',
      'Молоко - 100мл',
      'Соль, перец по вкусу',
      'Панировочные сухари'
    ],
    instructions: [
      'Замочить батон в молоке на 5 минут',
      'Измельчить лук и чеснок',
      'Смешать фарш, отжатый батон, лук, чеснок, яйцо',
      'Посолить, поперчить, хорошо вымесить',
      'Сформировать котлеты, обвалять в сухарях',
      'Жарить на масле до золотистой корочки',
      'Подавать с картофельным пюре или гречкой'
    ],
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
    rating: 5,
    favoriteBy: ['son', 'dad', 'grandpa'],
    tags: ['ужин', 'сытный', 'классика']
  },
  {
    id: 'recipe-4',
    name: 'Салат Цезарь',
    category: 'dinner',
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: 'easy',
    ingredients: [
      'Салат Романо - 1 пучок',
      'Куриная грудка - 200г',
      'Помидоры черри - 150г',
      'Сыр Пармезан - 50г',
      'Белый хлеб - 2 ломтика',
      'Оливковое масло - 3 ст.л.',
      'Чеснок - 2 зубчика',
      'Лимонный сок - 1 ст.л.',
      'Соль, перец'
    ],
    instructions: [
      'Обжарить куриную грудку, нарезать кусочками',
      'Приготовить сухарики из хлеба с чесноком',
      'Нарезать салат и черри',
      'Натереть пармезан',
      'Смешать все ингредиенты',
      'Заправить маслом и лимонным соком',
      'Подавать сразу после приготовления'
    ],
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800',
    rating: 5,
    favoriteBy: ['mom', 'daughter'],
    tags: ['легкий', 'свежий', 'быстро']
  },
  {
    id: 'recipe-5',
    name: 'Пельмени домашние',
    category: 'dinner',
    prepTime: 60,
    cookTime: 15,
    servings: 6,
    difficulty: 'hard',
    ingredients: [
      'Для теста: мука - 500г, яйца - 2 шт, вода - 200мл, соль',
      'Для фарша: говядина - 300г, свинина - 300г, лук - 2 шт',
      'Соль, перец по вкусу'
    ],
    instructions: [
      'Замесить тесто из муки, яиц, воды и соли',
      'Дать тесту отдохнуть 30 минут',
      'Приготовить фарш из мяса и лука',
      'Раскатать тесто тонко, вырезать кружочки',
      'Положить фарш, слепить пельмени',
      'Варить в кипящей подсоленной воде 7-10 минут',
      'Подавать со сметаной и зеленью'
    ],
    image: 'https://images.unsplash.com/photo-1625219611018-6c2e5e4b8c0c?w=800',
    rating: 5,
    favoriteBy: ['grandpa', 'dad', 'son'],
    tags: ['семейный', 'традиция', 'сытный']
  },
  {
    id: 'recipe-6',
    name: 'Суп с фрикадельками',
    category: 'lunch',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    difficulty: 'easy',
    ingredients: [
      'Фарш - 300г',
      'Картофель - 3 шт',
      'Морковь - 1 шт',
      'Лук - 1 шт',
      'Вермишель - 50г',
      'Яйцо - 1 шт',
      'Зелень',
      'Соль, перец'
    ],
    instructions: [
      'Сформировать из фарша маленькие фрикадельки',
      'Вскипятить воду, опустить фрикадельки',
      'Добавить нарезанный картофель',
      'Обжарить морковь и лук, добавить в суп',
      'За 5 минут до готовности добавить вермишель',
      'Посолить, поперчить, добавить зелень'
    ],
    image: 'https://images.unsplash.com/photo-1588566565463-180a5b2090d2?w=800',
    rating: 5,
    favoriteBy: ['son', 'daughter', 'grandma'],
    tags: ['суп', 'детский', 'легкий']
  }
];

export const DEMO_MEAL_VOTES: MealVote[] = [
  {
    id: 'vote-1',
    date: '2025-11-24',
    mealType: 'dinner',
    status: 'active',
    options: [
      {
        recipeId: 'recipe-3',
        recipeName: 'Котлеты домашние',
        votes: ['dad', 'son']
      },
      {
        recipeId: 'recipe-5',
        recipeName: 'Пельмени домашние',
        votes: ['grandpa', 'grandma']
      },
      {
        recipeId: 'recipe-4',
        recipeName: 'Салат Цезарь',
        votes: ['mom', 'daughter']
      }
    ]
  },
  {
    id: 'vote-2',
    date: '2025-11-23',
    mealType: 'lunch',
    status: 'closed',
    winnerId: 'recipe-1',
    options: [
      {
        recipeId: 'recipe-1',
        recipeName: 'Борщ классический',
        votes: ['dad', 'grandpa', 'grandma', 'son']
      },
      {
        recipeId: 'recipe-6',
        recipeName: 'Суп с фрикадельками',
        votes: ['mom', 'daughter']
      }
    ]
  }
];