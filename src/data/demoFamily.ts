export interface FamilyMember {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member' | 'child';
  age: number;
  avatar: string;
  gender: 'male' | 'female';
  preferences: {
    favoriteFood: string[];
    allergies: string[];
    restrictions: string[];
  };
  permissions: {
    calendar: boolean;
    tasks: boolean;
    shopping: boolean;
    finances: boolean;
    health: boolean;
    recipes: boolean;
    documents: boolean;
    contacts: boolean;
  };
}

export interface DemoFamily {
  id: string;
  name: string;
  religion: string;
  members: FamilyMember[];
  createdAt: string;
}

export const DEMO_FAMILY: DemoFamily = {
  id: 'demo-family-1',
  name: 'Счастливая',
  religion: 'Христианство',
  createdAt: '2024-01-15',
  members: [
    {
      id: 'dad',
      name: 'Александр',
      role: 'owner',
      age: 40,
      avatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b14ddbaa-0011-4ded-b9e9-c9018aed82ce.jpg',
      gender: 'male',
      preferences: {
        favoriteFood: ['Стейк', 'Борщ', 'Картофель по-деревенски'],
        allergies: [],
        restrictions: []
      },
      permissions: {
        calendar: true,
        tasks: true,
        shopping: true,
        finances: true,
        health: true,
        recipes: true,
        documents: true,
        contacts: true
      }
    },
    {
      id: 'mom',
      name: 'Елена',
      role: 'admin',
      age: 35,
      avatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/9cf25007-fa40-4280-965c-7df0e43eabee.jpg',
      gender: 'female',
      preferences: {
        favoriteFood: ['Салат Цезарь', 'Суши', 'Фруктовый смузи'],
        allergies: [],
        restrictions: ['Вегетарианство']
      },
      permissions: {
        calendar: true,
        tasks: true,
        shopping: true,
        finances: true,
        health: true,
        recipes: true,
        documents: true,
        contacts: true
      }
    },
    {
      id: '3',
      name: 'Максим',
      role: 'child',
      age: 11,
      avatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/5efe0383-b1ed-4eec-8273-2e53a51f1b78.jpg',
      gender: 'male',
      preferences: {
        favoriteFood: ['Котлеты', 'Макароны', 'Йогурт'],
        allergies: [],
        restrictions: []
      },
      permissions: {
        calendar: true,
        tasks: true,
        shopping: false,
        finances: false,
        health: true,
        recipes: false,
        documents: false,
        contacts: true
      }
    },
    {
      id: '4',
      name: 'София',
      role: 'child',
      age: 8,
      avatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/cd14b640-0690-45f8-bde9-bb8773f309f0.jpg',
      gender: 'female',
      preferences: {
        favoriteFood: ['Пицца', 'Блины', 'Мороженое'],
        allergies: ['Орехи'],
        restrictions: []
      },
      permissions: {
        calendar: true,
        tasks: true,
        shopping: false,
        finances: false,
        health: true,
        recipes: true,
        documents: false,
        contacts: true
      }
    },
    {
      id: 'grandma',
      name: 'Мария',
      role: 'member',
      age: 65,
      avatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/15cc7156-7228-4da0-9d75-d971bbd11a6e.jpg',
      gender: 'female',
      preferences: {
        favoriteFood: ['Каша', 'Домашний суп', 'Пирожки'],
        allergies: [],
        restrictions: ['Диабет - низкий сахар']
      },
      permissions: {
        calendar: true,
        tasks: true,
        shopping: true,
        finances: false,
        health: true,
        recipes: true,
        documents: false,
        contacts: true
      }
    },
    {
      id: 'grandpa',
      name: 'Николай',
      role: 'member',
      age: 70,
      avatar: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b645bc57-5245-4c0a-87e6-234d82e81815.jpg',
      gender: 'male',
      preferences: {
        favoriteFood: ['Щи', 'Пельмени', 'Селедка'],
        allergies: [],
        restrictions: ['Низкий холестерин']
      },
      permissions: {
        calendar: true,
        tasks: true,
        shopping: true,
        finances: false,
        health: true,
        recipes: true,
        documents: false,
        contacts: true
      }
    }
  ]
};

export const getCurrentMember = (): FamilyMember | null => {
  const currentId = localStorage.getItem('currentMemberId');
  if (!currentId) return DEMO_FAMILY.members[0];
  return DEMO_FAMILY.members.find(m => m.id === currentId) || DEMO_FAMILY.members[0];
};

export const setCurrentMember = (memberId: string): void => {
  localStorage.setItem('currentMemberId', memberId);
};