import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  workload: number;
  avatar: string;
  points: number;
  level: number;
  achievements: string[];
  foodPreferences?: {
    favorites: string[];
    dislikes: string[];
  };
  responsibilities?: string[];
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
  category: string;
  points: number;
  reminderTime?: string;
  shoppingList?: string[];
}

interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  time: string;
  notified: boolean;
}

interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: string;
  daysLeft: number;
}

interface FamilyValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  tradition: string;
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  excerpt: string;
  likes: number;
  comments: number;
}

interface Tradition {
  id: string;
  title: string;
  description: string;
  frequency: string;
  icon: string;
  participants: string[];
}

interface MealOption {
  id: string;
  name: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  icon: string;
  cookingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  votes: { [memberId: string]: boolean };
}

interface MealVoting {
  id: string;
  title: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  options: MealOption[];
  status: 'active' | 'completed';
}

interface ChildProfile {
  childId: string;
  childName: string;
  age: number;
  interests: string[];
  strengths: string[];
  goals: string[];
  personality: string;
}

interface Activity {
  id: string;
  name: string;
  category: string;
  dayOfWeek: string;
  time: string;
  duration: string;
  location: string;
  instructor: string;
  color: string;
}

interface SkillRecommendation {
  id: string;
  skillName: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
  suggestedActivities: string[];
  progress: number;
}

interface DevelopmentPlan {
  childId: string;
  childName: string;
  profile: ChildProfile;
  schedule: Activity[];
  skills: SkillRecommendation[];
  milestones: { title: string; completed: boolean; date: string }[];
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'document';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

interface FamilyAlbum {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadDate: string;
  type: 'image' | 'video';
}

interface FamilyNeed {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  assignedTo: string;
  assignedToName: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  dueDate?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  createdBy: string;
  createdByName: string;
  createdByAvatar: string;
  visibility: 'family' | 'private';
  category: string;
  color: string;
  attendees?: string[];
}

interface FamilyTreeMember {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate: string;
  deathDate?: string;
  age?: number;
  photo?: string;
  avatar: string;
  generation: number;
  parentIds: string[];
  spouseId?: string;
  placeOfBirth?: string;
  occupation?: string;
  bio?: string;
  achievements?: string[];
  gallery?: string[];
  documents?: {
    id: string;
    title: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  education?: string;
  hobbies?: string[];
  importantDates?: {
    date: string;
    event: string;
  }[];
}

export default function Index() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { 
      id: '1', 
      name: 'Александр', 
      role: 'Муж', 
      workload: 65, 
      avatar: '👨', 
      points: 450, 
      level: 5, 
      achievements: ['early_bird', 'helper', 'chef'],
      foodPreferences: {
        favorites: ['Стейк', 'Паста карбонара', 'Борщ', 'Блины'],
        dislikes: ['Баклажаны', 'Оливки', 'Грибы']
      },
      responsibilities: ['Покупки', 'Вынести мусор', 'Мелкий ремонт']
    },
    { 
      id: '2', 
      name: 'Елена', 
      role: 'Жена', 
      workload: 75, 
      avatar: '👩', 
      points: 680, 
      level: 7, 
      achievements: ['organizer', 'champion', 'master_chef'],
      foodPreferences: {
        favorites: ['Салаты', 'Рыба', 'Овощи на гриле', 'Суши'],
        dislikes: ['Жирное мясо', 'Майонез', 'Фастфуд']
      },
      responsibilities: ['Готовка', 'Стирка', 'Уборка']
    },
    { 
      id: '3', 
      name: 'Максим', 
      role: 'Сын', 
      workload: 30, 
      avatar: '👦', 
      points: 210, 
      level: 3, 
      achievements: ['student', 'helper'],
      foodPreferences: {
        favorites: ['Пицца', 'Бургеры', 'Пельмени', 'Мороженое'],
        dislikes: ['Брокколи', 'Рыба', 'Лук']
      },
      responsibilities: ['Уроки', 'Убрать комнату']
    },
    { 
      id: '4', 
      name: 'София', 
      role: 'Дочь', 
      workload: 25, 
      avatar: '👧', 
      points: 150, 
      level: 2, 
      achievements: ['beginner'],
      foodPreferences: {
        favorites: ['Макароны с сыром', 'Блинчики', 'Фрукты', 'Йогурт'],
        dislikes: ['Острое', 'Горькое', 'Печень']
      },
      responsibilities: ['Убрать игрушки', 'Полить цветы']
    },
    { 
      id: '5', 
      name: 'Анна', 
      role: 'Бабушка', 
      workload: 20, 
      avatar: '👵', 
      points: 320, 
      level: 4, 
      achievements: ['wise', 'cook'],
      foodPreferences: {
        favorites: ['Домашние пироги', 'Супы', 'Каши', 'Компот'],
        dislikes: ['Острые блюда', 'Экзотическая еда']
      },
      responsibilities: ['Выпечка', 'Присмотр за детьми']
    },
    { 
      id: '6', 
      name: 'Виктор', 
      role: 'Дедушка', 
      workload: 15, 
      avatar: '👴', 
      points: 280, 
      level: 3, 
      achievements: ['gardener', 'storyteller'],
      foodPreferences: {
        favorites: ['Холодец', 'Квашеная капуста', 'Мясные блюда'],
        dislikes: ['Слишком сладкое', 'Полуфабрикаты']
      },
      responsibilities: ['Садоводство', 'Помощь с ремонтом']
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Приготовить ужин', assignee: 'Елена', completed: false, category: 'Кухня', points: 30, reminderTime: '18:00' },
    { id: '2', title: 'Вынести мусор', assignee: 'Александр', completed: true, category: 'Дом', points: 10 },
    { id: '3', title: 'Сделать уроки', assignee: 'Максим', completed: false, category: 'Учеба', points: 25, reminderTime: '16:00' },
    { id: '4', title: 'Убрать комнату', assignee: 'София', completed: false, category: 'Дом', points: 20 },
    { id: '5', title: 'Купить продукты', assignee: 'Александр', completed: false, category: 'Покупки', points: 15, reminderTime: '17:30', shoppingList: ['Молоко', 'Хлеб', 'Яйца', 'Сыр', 'Яблоки', 'Картофель'] },
    { id: '6', title: 'Постирать белье', assignee: 'Елена', completed: false, category: 'Дом', points: 20 }
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Reminder | null>(null);

  const [childrenProfiles] = useState<ChildProfile[]>([
    {
      childId: '3',
      childName: 'Максим',
      age: 10,
      interests: ['Робототехника', 'Видеоигры', 'Математика', 'Конструкторы'],
      strengths: ['Логическое мышление', 'Усидчивость', 'Технический склад ума'],
      goals: ['Создать своего робота', 'Участвовать в олимпиаде по математике', 'Научиться программированию'],
      personality: 'Аналитический, любознательный, сосредоточенный'
    },
    {
      childId: '4',
      childName: 'София',
      age: 7,
      interests: ['Рисование', 'Танцы', 'Музыка', 'Чтение сказок'],
      strengths: ['Креативность', 'Эмпатия', 'Хорошая память'],
      goals: ['Выступить на концерте', 'Научиться рисовать портреты', 'Прочитать 20 книг за год'],
      personality: 'Эмоциональная, общительная, творческая'
    }
  ]);

  const [developmentPlans] = useState<DevelopmentPlan[]>([
    {
      childId: '3',
      childName: 'Максим',
      profile: {
        childId: '3',
        childName: 'Максим',
        age: 10,
        interests: ['Робототехника', 'Видеоигры', 'Математика'],
        strengths: ['Логика', 'Усидчивость'],
        goals: ['Создать робота', 'Олимпиада'],
        personality: 'Аналитический'
      },
      schedule: [
        {
          id: '1',
          name: 'Робототехника',
          category: 'STEM',
          dayOfWeek: 'Вторник',
          time: '16:00',
          duration: '1.5 часа',
          location: 'Центр технического творчества',
          instructor: 'Иванов И.П.',
          color: 'bg-blue-100 border-blue-500'
        },
        {
          id: '2',
          name: 'Программирование Scratch',
          category: 'IT',
          dayOfWeek: 'Четверг',
          time: '17:00',
          duration: '1 час',
          location: 'IT-школа "Код"',
          instructor: 'Петрова Е.А.',
          color: 'bg-purple-100 border-purple-500'
        },
        {
          id: '3',
          name: 'Математический кружок',
          category: 'Образование',
          dayOfWeek: 'Суббота',
          time: '10:00',
          duration: '2 часа',
          location: 'Лицей №9',
          instructor: 'Сидоров А.В.',
          color: 'bg-green-100 border-green-500'
        }
      ],
      skills: [
        {
          id: '1',
          skillName: 'Программирование',
          category: 'IT',
          importance: 'high',
          description: 'Основы кодирования, алгоритмическое мышление',
          suggestedActivities: ['Scratch', 'Python для детей', 'Робототехника'],
          progress: 65
        },
        {
          id: '2',
          skillName: 'Логика и математика',
          category: 'Образование',
          importance: 'high',
          description: 'Развитие аналитического мышления',
          suggestedActivities: ['Математические олимпиады', 'Шахматы', 'Головоломки'],
          progress: 75
        },
        {
          id: '3',
          skillName: 'Командная работа',
          category: 'Социальные навыки',
          importance: 'medium',
          description: 'Умение работать в группе',
          suggestedActivities: ['Командные проекты', 'Спортивные игры'],
          progress: 45
        },
        {
          id: '4',
          skillName: 'Креативное мышление',
          category: 'Творчество',
          importance: 'medium',
          description: 'Генерация новых идей и решений',
          suggestedActivities: ['Конструирование', 'Рисование', 'Лепка'],
          progress: 40
        }
      ],
      milestones: [
        { title: 'Создание первого робота', completed: true, date: 'Октябрь 2025' },
        { title: 'Участие в региональной олимпиаде', completed: false, date: 'Декабрь 2025' },
        { title: 'Завершение курса Scratch', completed: false, date: 'Январь 2026' }
      ]
    },
    {
      childId: '4',
      childName: 'София',
      profile: {
        childId: '4',
        childName: 'София',
        age: 7,
        interests: ['Рисование', 'Танцы', 'Музыка'],
        strengths: ['Креативность', 'Эмпатия'],
        goals: ['Выступить на концерте', 'Нарисовать портрет'],
        personality: 'Творческая'
      },
      schedule: [
        {
          id: '4',
          name: 'Художественная студия',
          category: 'Искусство',
          dayOfWeek: 'Среда',
          time: '15:30',
          duration: '1 час',
          location: 'Детская школа искусств',
          instructor: 'Кузнецова М.А.',
          color: 'bg-pink-100 border-pink-500'
        },
        {
          id: '5',
          name: 'Хореография',
          category: 'Танцы',
          dayOfWeek: 'Пятница',
          time: '16:30',
          duration: '1.5 часа',
          location: 'Танцевальная студия',
          instructor: 'Новикова Л.В.',
          color: 'bg-rose-100 border-rose-500'
        },
        {
          id: '6',
          name: 'Фортепиано',
          category: 'Музыка',
          dayOfWeek: 'Воскресенье',
          time: '11:00',
          duration: '45 мин',
          location: 'Музыкальная школа №3',
          instructor: 'Волкова О.И.',
          color: 'bg-amber-100 border-amber-500'
        }
      ],
      skills: [
        {
          id: '5',
          skillName: 'Художественное творчество',
          category: 'Искусство',
          importance: 'high',
          description: 'Развитие творческого видения и фантазии',
          suggestedActivities: ['Рисование', 'Лепка', 'Аппликация'],
          progress: 80
        },
        {
          id: '6',
          skillName: 'Музыкальный слух',
          category: 'Музыка',
          importance: 'high',
          description: 'Развитие чувства ритма и мелодии',
          suggestedActivities: ['Фортепиано', 'Хоровое пение', 'Сольфеджио'],
          progress: 60
        },
        {
          id: '7',
          skillName: 'Координация и пластика',
          category: 'Физическое развитие',
          importance: 'medium',
          description: 'Развитие двигательных навыков',
          suggestedActivities: ['Танцы', 'Гимнастика', 'Йога'],
          progress: 70
        },
        {
          id: '8',
          skillName: 'Эмоциональный интеллект',
          category: 'Социальные навыки',
          importance: 'medium',
          description: 'Понимание эмоций своих и других',
          suggestedActivities: ['Театральный кружок', 'Книжный клуб'],
          progress: 55
        }
      ],
      milestones: [
        { title: 'Первый сольный танец', completed: true, date: 'Сентябрь 2025' },
        { title: 'Выставка рисунков в школе', completed: true, date: 'Октябрь 2025' },
        { title: 'Участие в новогоднем концерте', completed: false, date: 'Декабрь 2025' }
      ]
    }
  ]);

  const [mealVotings, setMealVotings] = useState<MealVoting[]>([
    {
      id: '1',
      title: 'Что приготовить на ужин сегодня?',
      mealType: 'dinner',
      date: '9 ноября',
      status: 'active',
      options: [
        {
          id: '1',
          name: 'Паста карбонара',
          description: 'Классическая итальянская паста с беконом и сливочным соусом',
          mealType: 'dinner',
          icon: '🍝',
          cookingTime: '30 мин',
          difficulty: 'easy',
          votes: { '1': true, '2': true }
        },
        {
          id: '2',
          name: 'Куриные котлеты с пюре',
          description: 'Сочные котлеты из куриного филе с нежным картофельным пюре',
          mealType: 'dinner',
          icon: '🍗',
          cookingTime: '45 мин',
          difficulty: 'medium',
          votes: { '3': true, '4': true }
        },
        {
          id: '3',
          name: 'Запечённая рыба с овощами',
          description: 'Лёгкое и полезное блюдо с сезонными овощами',
          mealType: 'dinner',
          icon: '🐟',
          cookingTime: '40 мин',
          difficulty: 'easy',
          votes: {}
        }
      ]
    },
    {
      id: '2',
      title: 'Завтрак на выходные',
      mealType: 'breakfast',
      date: '10 ноября',
      status: 'active',
      options: [
        {
          id: '4',
          name: 'Блинчики с начинкой',
          description: 'Пышные блинчики с вареньем, сгущёнкой или творогом',
          mealType: 'breakfast',
          icon: '🥞',
          cookingTime: '25 мин',
          difficulty: 'easy',
          votes: { '1': true }
        },
        {
          id: '5',
          name: 'Омлет с овощами',
          description: 'Богатый белком завтрак с болгарским перцем и помидорами',
          mealType: 'breakfast',
          icon: '🍳',
          cookingTime: '15 мин',
          difficulty: 'easy',
          votes: { '2': true, '3': true }
        },
        {
          id: '6',
          name: 'Овсянка с фруктами',
          description: 'Полезная каша с бананами, ягодами и орехами',
          mealType: 'breakfast',
          icon: '🥣',
          cookingTime: '10 мин',
          difficulty: 'easy',
          votes: { '4': true }
        }
      ]
    }
  ]);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      tasks.forEach(task => {
        if (!task.completed && task.reminderTime === currentTime) {
          const existingReminder = reminders.find(r => r.taskId === task.id && r.notified);
          if (!existingReminder) {
            const newReminder: Reminder = {
              id: Date.now().toString(),
              taskId: task.id,
              taskTitle: task.title,
              time: currentTime,
              notified: false
            };
            setCurrentNotification(newReminder);
            setShowNotification(true);
            setReminders(prev => [...prev, { ...newReminder, notified: true }]);
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();

    return () => clearInterval(interval);
  }, [tasks, reminders]);

  const [importantDates] = useState<ImportantDate[]>([
    { id: '1', title: 'День рождения Елены', date: '15 ноября', type: 'birthday', daysLeft: 6 },
    { id: '2', title: 'Годовщина свадьбы', date: '20 ноября', type: 'anniversary', daysLeft: 11 },
    { id: '3', title: 'День рождения Максима', date: '03 декабря', type: 'birthday', daysLeft: 24 }
  ]);

  const [blogPosts] = useState<BlogPost[]>([
    {
      id: '1',
      title: 'Как справиться с детскими истериками: 5 проверенных методов',
      author: 'Психолог Мария Иванова',
      date: '7 ноября 2025',
      category: 'Воспитание',
      excerpt: 'Детские истерики — нормальная часть развития. Важно понимать причины и реагировать правильно...',
      likes: 234,
      comments: 45
    },
    {
      id: '2',
      title: 'Распределение обязанностей: найти баланс между супругами',
      author: 'Семейный терапевт Анна Петрова',
      date: '5 ноября 2025',
      category: 'Отношения',
      excerpt: 'Справедливое распределение домашних дел — основа гармонии в паре. Обсуждайте ожидания открыто...',
      likes: 189,
      comments: 32
    },
    {
      id: '3',
      title: 'Семейные традиции: зачем они нужны и как их создать',
      author: 'Психолог Дмитрий Соколов',
      date: '3 ноября 2025',
      category: 'Традиции',
      excerpt: 'Традиции создают чувство принадлежности и безопасности. Начните с малого — еженедельного ужина...',
      likes: 312,
      comments: 67
    },
    {
      id: '4',
      title: 'Личные границы в семье: как говорить "нет" без чувства вины',
      author: 'Коуч Елена Смирнова',
      date: '1 ноября 2025',
      category: 'Психология',
      excerpt: 'Здоровые границы — не эгоизм, а забота о себе и семье. Учитесь отказывать уважительно...',
      likes: 276,
      comments: 54
    },
    {
      id: '5',
      title: 'Как поддержать подростка в переходном возрасте',
      author: 'Психолог Ольга Кузнецова',
      date: '30 октября 2025',
      category: 'Подростки',
      excerpt: 'Переходный возраст — испытание для всей семьи. Сохраняйте связь через уважение и принятие...',
      likes: 198,
      comments: 41
    },
    {
      id: '6',
      title: 'Эмоциональное выгорание родителей: признаки и решения',
      author: 'Психотерапевт Игорь Волков',
      date: '28 октября 2025',
      category: 'Здоровье',
      excerpt: 'Выгорание родителей — реальная проблема. Не игнорируйте сигналы тела и просите помощь...',
      likes: 345,
      comments: 78
    }
  ]);

  const [traditions] = useState<Tradition[]>([
    {
      id: '1',
      title: 'Семейный ужин по воскресеньям',
      description: 'Каждое воскресенье вся семья собирается за большим столом, готовим вместе любимые блюда',
      frequency: 'Еженедельно',
      icon: '🍽️',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '2',
      title: 'Пятничный киновечер',
      description: 'По пятницам выбираем фильм всей семьей, готовим попкорн и проводим вечер вместе',
      frequency: 'Еженедельно',
      icon: '🎬',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '3',
      title: 'Утренние объятия',
      description: 'Начинаем каждый день с семейных объятий и пожеланий хорошего дня',
      frequency: 'Ежедневно',
      icon: '🤗',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '4',
      title: 'День рождения с сюрпризами',
      description: 'Украшаем дом шариками, готовим любимое блюдо именинника и дарим самодельные открытки',
      frequency: 'По случаю',
      icon: '🎂',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '5',
      title: 'Субботняя уборка с музыкой',
      description: 'Убираемся все вместе под любимые песни, превращая работу в веселье',
      frequency: 'Еженедельно',
      icon: '🎵',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    },
    {
      id: '6',
      title: 'Летние походы на природу',
      description: 'Каждое лето выбираемся на природу с палатками, костром и песнями под гитару',
      frequency: 'Сезонно',
      icon: '🏕️',
      participants: ['Александр', 'Елена', 'Максим', 'София']
    }
  ]);

  const [familyValues] = useState<FamilyValue[]>([
    {
      id: '1',
      title: 'Взаимоуважение',
      description: 'Мы цениим мнение каждого члена семьи и уважаем личные границы друг друга',
      icon: '🤝',
      tradition: 'Еженедельный семейный совет по воскресеньям'
    },
    {
      id: '2',
      title: 'Честность',
      description: 'Открытое общение — основа доверия в нашей семье',
      icon: '💬',
      tradition: 'Вечерние разговоры о прошедшем дне'
    },
    {
      id: '3',
      title: 'Поддержка',
      description: 'Мы всегда рядом друг с другом в радости и в трудные моменты',
      icon: '❤️',
      tradition: 'Семейные объятия перед сном'
    },
    {
      id: '4',
      title: 'Развитие',
      description: 'Каждый имеет право на личностный рост и увлечения',
      icon: '🌱',
      tradition: 'Месяц хобби — каждый делится своим увлечением'
    },
    {
      id: '5',
      title: 'Веселье',
      description: 'Совместные развлечения укрепляют семейные связи',
      icon: '🎉',
      tradition: 'Пятничные игровые вечера'
    },
    {
      id: '6',
      title: 'Традиции',
      description: 'Наши ритуалы создают особую атмосферу и воспоминания',
      icon: '🕯️',
      tradition: 'Семейный фотоальбом и совместное приготовление по субботам'
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: '2',
      senderName: 'Елена',
      senderAvatar: '👩',
      content: 'Не забудьте, сегодня вечером семейный ужин!',
      timestamp: '10:30',
      type: 'text'
    },
    {
      id: '2',
      senderId: '1',
      senderName: 'Александр',
      senderAvatar: '👨',
      content: 'Куплю продукты по дороге домой',
      timestamp: '11:15',
      type: 'text'
    },
    {
      id: '3',
      senderId: '3',
      senderName: 'Максим',
      senderAvatar: '👦',
      content: 'Смотрите, какого робота я собрал!',
      timestamp: '14:20',
      type: 'image',
      fileUrl: '/placeholder.jpg',
      fileName: 'robot.jpg'
    },
    {
      id: '4',
      senderId: '4',
      senderName: 'София',
      senderAvatar: '👧',
      content: 'Мой рисунок с кружка',
      timestamp: '15:45',
      type: 'image',
      fileUrl: '/placeholder.jpg',
      fileName: 'drawing.jpg'
    }
  ]);

  const [familyAlbum, setFamilyAlbum] = useState<FamilyAlbum[]>([
    {
      id: '1',
      fileName: 'robot.jpg',
      fileUrl: '/placeholder.jpg',
      uploadedBy: 'Максим',
      uploadDate: '2024-11-08',
      type: 'image'
    },
    {
      id: '2',
      fileName: 'drawing.jpg',
      fileUrl: '/placeholder.jpg',
      uploadedBy: 'София',
      uploadDate: '2024-11-08',
      type: 'image'
    }
  ]);

  const [familyNeeds, setFamilyNeeds] = useState<FamilyNeed[]>([
    {
      id: '1',
      title: 'Постирать школьную форму',
      description: 'Максиму нужна чистая форма к понедельнику',
      createdBy: '3',
      createdByName: 'Максим',
      assignedTo: '2',
      assignedToName: 'Елена',
      category: 'Стирка',
      priority: 'high',
      status: 'pending',
      createdAt: '2024-11-08 09:00',
      dueDate: '2024-11-10'
    },
    {
      id: '2',
      title: 'Заказать продукты на неделю',
      description: 'Молоко, хлеб, овощи, фрукты, курица',
      createdBy: '2',
      createdByName: 'Елена',
      assignedTo: '1',
      assignedToName: 'Александр',
      category: 'Покупки',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2024-11-08 10:30'
    },
    {
      id: '3',
      title: 'Помочь с математикой',
      description: 'Нужна помощь с домашним заданием по геометрии',
      createdBy: '3',
      createdByName: 'Максим',
      assignedTo: '1',
      assignedToName: 'Александр',
      category: 'Учёба',
      priority: 'medium',
      status: 'completed',
      createdAt: '2024-11-07 16:00'
    },
    {
      id: '4',
      title: 'Испечь пирог к выходным',
      description: 'Хотим яблочный пирог как у бабушки',
      createdBy: '4',
      createdByName: 'София',
      assignedTo: '5',
      assignedToName: 'Анна',
      category: 'Готовка',
      priority: 'low',
      status: 'pending',
      createdAt: '2024-11-08 12:00',
      dueDate: '2024-11-09'
    }
  ]);

  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      days.push({
        date: day.getDate(),
        month: day.getMonth() + 1,
        year: day.getFullYear(),
        dayName: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][day.getDay()],
        fullDate: day.toISOString().split('T')[0],
        isToday: day.toDateString() === today.toDateString()
      });
    }
    return days;
  };

  const [familyTree, setFamilyTree] = useState<FamilyTreeMember[]>([
    {
      id: 'gt1',
      fullName: 'Иван Петрович Смирнов',
      firstName: 'Иван',
      lastName: 'Смирнов',
      middleName: 'Петрович',
      birthDate: '1935-03-15',
      deathDate: '2018-11-20',
      age: 83,
      avatar: '👴',
      generation: 1,
      parentIds: [],
      spouseId: 'gt2',
      placeOfBirth: 'Москва, СССР',
      occupation: 'Инженер-конструктор',
      bio: 'Работал на авиационном заводе, создавал чертежи самолётов. Ветеран труда.',
      achievements: ['Орден Трудового Красного Знамени', 'Заслуженный инженер РФ', '35 лет стажа'],
      gallery: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
      education: 'МВТУ им. Баумана, факультет авиастроения',
      hobbies: ['Шахматы', 'Рыбалка', 'Чтение технической литературы'],
      importantDates: [
        { date: '1958-06-20', event: 'Окончание института' },
        { date: '1960-09-12', event: 'Свадьба с Марией' },
        { date: '1985-05-01', event: 'Получение ордена' }
      ],
      documents: [
        { id: 'd1', title: 'Трудовая книжка', type: 'pdf', url: '/docs/labor-book.pdf', uploadDate: '2024-01-15' },
        { id: 'd2', title: 'Диплом МВТУ', type: 'pdf', url: '/docs/diploma.pdf', uploadDate: '2024-01-15' }
      ]
    },
    {
      id: 'gt2',
      fullName: 'Мария Александровна Смирнова',
      firstName: 'Мария',
      lastName: 'Смирнова',
      middleName: 'Александровна',
      birthDate: '1938-07-22',
      age: 86,
      avatar: '👵',
      generation: 1,
      parentIds: [],
      spouseId: 'gt1',
      placeOfBirth: 'Ленинград, СССР',
      occupation: 'Учитель начальных классов',
      bio: 'Преподавала в школе № 215 более 40 лет. Почётный работник образования.',
      achievements: ['Отличник народного просвещения', 'Ветеран труда', '42 года педагогического стажа'],
      gallery: ['/placeholder.jpg', '/placeholder.jpg'],
      education: 'Ленинградский педагогический институт',
      hobbies: ['Вязание', 'Садоводство', 'Пение в хоре'],
      importantDates: [
        { date: '1960-09-12', event: 'Свадьба с Иваном' },
        { date: '1962-04-10', event: 'Рождение дочери Ольги' }
      ]
    },
    {
      id: 'gp1',
      fullName: 'Ольга Ивановна Васильева',
      firstName: 'Ольга',
      lastName: 'Васильева',
      middleName: 'Ивановна',
      birthDate: '1962-04-10',
      age: 62,
      avatar: '👩',
      generation: 2,
      parentIds: ['gt1', 'gt2'],
      spouseId: 'gp2',
      placeOfBirth: 'Москва, СССР',
      occupation: 'Врач-педиатр',
      bio: 'Работает в детской поликлинике. Кандидат медицинских наук.',
      achievements: ['Кандидат медицинских наук', 'Врач высшей категории'],
      gallery: ['/placeholder.jpg'],
      education: 'Первый МГМУ им. Сеченова',
      hobbies: ['Йога', 'Чтение детективов', 'Путешествия']
    },
    {
      id: 'gp2',
      fullName: 'Сергей Николаевич Васильев',
      firstName: 'Сергей',
      lastName: 'Васильев',
      middleName: 'Николаевич',
      birthDate: '1960-12-05',
      age: 64,
      avatar: '👨',
      generation: 2,
      parentIds: [],
      spouseId: 'gp1',
      placeOfBirth: 'Тула, СССР',
      occupation: 'Предприниматель',
      bio: 'Владелец сети продуктовых магазинов.',
      education: 'Московский государственный университет, экономический факультет',
      hobbies: ['Гольф', 'Коллекционирование монет']
    },
    {
      id: '1',
      fullName: 'Александр Сергеевич Васильев',
      firstName: 'Александр',
      lastName: 'Васильев',
      middleName: 'Сергеевич',
      birthDate: '1985-09-18',
      age: 39,
      avatar: '👨',
      generation: 3,
      parentIds: ['gp1', 'gp2'],
      spouseId: '2',
      placeOfBirth: 'Москва, Россия',
      occupation: 'IT-менеджер',
      bio: 'Руководит командой разработчиков в крупной IT-компании.',
      education: 'МГТУ им. Баумана, программная инженерия',
      hobbies: ['Бег', 'Настольные игры', 'Фотография']
    },
    {
      id: '2',
      fullName: 'Елена Викторовна Васильева',
      firstName: 'Елена',
      lastName: 'Васильева',
      middleName: 'Викторовна',
      birthDate: '1988-03-25',
      age: 36,
      avatar: '👩',
      generation: 3,
      parentIds: [],
      spouseId: '1',
      placeOfBirth: 'Санкт-Петербург, Россия',
      occupation: 'Дизайнер интерьеров',
      bio: 'Работает в дизайн-студии, специализируется на квартирах и домах.',
      education: 'Строгановская академия, дизайн среды',
      hobbies: ['Рисование', 'Йога', 'Кулинария']
    },
    {
      id: '3',
      fullName: 'Максим Александрович Васильев',
      firstName: 'Максим',
      lastName: 'Васильев',
      middleName: 'Александрович',
      birthDate: '2013-06-12',
      age: 11,
      avatar: '👦',
      generation: 4,
      parentIds: ['1', '2'],
      placeOfBirth: 'Москва, Россия',
      occupation: 'Школьник',
      bio: 'Учится в 5 классе, увлекается робототехникой и программированием.',
      hobbies: ['Робототехника', 'Программирование', 'Футбол']
    },
    {
      id: '4',
      fullName: 'София Александровна Васильева',
      firstName: 'София',
      lastName: 'Васильева',
      middleName: 'Александровна',
      birthDate: '2016-11-08',
      age: 8,
      avatar: '👧',
      generation: 4,
      parentIds: ['1', '2'],
      placeOfBirth: 'Москва, Россия',
      occupation: 'Школьница',
      bio: 'Учится во 2 классе, любит танцевать и рисовать.',
      hobbies: ['Танцы', 'Рисование', 'Чтение сказок']
    }
  ]);

  const [selectedTreeMember, setSelectedTreeMember] = useState<FamilyTreeMember | null>(null);

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Семейный ужин',
      description: 'Ужин вместе всей семьёй',
      date: getWeekDays()[1].fullDate,
      time: '19:00',
      createdBy: '2',
      createdByName: 'Елена',
      createdByAvatar: '👩',
      visibility: 'family',
      category: 'Семья',
      color: 'bg-orange-100 border-orange-300',
      attendees: ['1', '2', '3', '4', '5', '6']
    },
    {
      id: '2',
      title: 'Встреча с друзьями',
      description: 'Кофе с подругами',
      date: getWeekDays()[2].fullDate,
      time: '15:00',
      createdBy: '2',
      createdByName: 'Елена',
      createdByAvatar: '👩',
      visibility: 'private',
      category: 'Личное',
      color: 'bg-purple-100 border-purple-300'
    },
    {
      id: '3',
      title: 'Робототехника',
      description: 'Кружок Максима',
      date: getWeekDays()[1].fullDate,
      time: '16:00',
      createdBy: '3',
      createdByName: 'Максим',
      createdByAvatar: '👦',
      visibility: 'family',
      category: 'Кружки',
      color: 'bg-blue-100 border-blue-300',
      attendees: ['3']
    },
    {
      id: '4',
      title: 'Рабочее совещание',
      description: 'Важная встреча',
      date: getWeekDays()[3].fullDate,
      time: '10:00',
      createdBy: '1',
      createdByName: 'Александр',
      createdByAvatar: '👨',
      visibility: 'private',
      category: 'Работа',
      color: 'bg-gray-100 border-gray-300'
    },
    {
      id: '5',
      title: 'Танцы',
      description: 'Занятие Софии',
      date: getWeekDays()[4].fullDate,
      time: '17:30',
      createdBy: '4',
      createdByName: 'София',
      createdByAvatar: '👧',
      visibility: 'family',
      category: 'Кружки',
      color: 'bg-pink-100 border-pink-300',
      attendees: ['4']
    },
    {
      id: '6',
      title: 'Поход в кино',
      description: 'Смотрим новый мультфильм',
      date: getWeekDays()[5].fullDate,
      time: '18:00',
      createdBy: '1',
      createdByName: 'Александр',
      createdByAvatar: '👨',
      visibility: 'family',
      category: 'Развлечения',
      color: 'bg-green-100 border-green-300',
      attendees: ['1', '2', '3', '4']
    },
    {
      id: '7',
      title: 'Пирог с бабушкой',
      description: 'Учимся печь пирог',
      date: getWeekDays()[6].fullDate,
      time: '14:00',
      createdBy: '5',
      createdByName: 'Анна',
      createdByAvatar: '👵',
      visibility: 'family',
      category: 'Семья',
      color: 'bg-yellow-100 border-yellow-300',
      attendees: ['4', '5']
    }
  ]);

  const [selectedUserId] = useState('1');
  const [newMessage, setNewMessage] = useState('');

  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const wasCompleted = task.completed;
    const newCompletedState = !wasCompleted;

    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: newCompletedState } : t
    ));

    if (newCompletedState && !wasCompleted) {
      setFamilyMembers(members => members.map(member => {
        if (member.name === task.assignee) {
          const newPoints = member.points + task.points;
          const newLevel = Math.floor(newPoints / 100) + 1;
          return { ...member, points: newPoints, level: newLevel };
        }
        return member;
      }));
    } else if (!newCompletedState && wasCompleted) {
      setFamilyMembers(members => members.map(member => {
        if (member.name === task.assignee) {
          const newPoints = Math.max(0, member.points - task.points);
          const newLevel = Math.floor(newPoints / 100) + 1;
          return { ...member, points: newPoints, level: newLevel };
        }
        return member;
      }));
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload > 70) return 'text-red-500';
    if (workload > 50) return 'text-orange-500';
    return 'text-green-500';
  };

  const toggleVote = (votingId: string, optionId: string, memberId: string) => {
    setMealVotings(votings => 
      votings.map(voting => {
        if (voting.id === votingId) {
          return {
            ...voting,
            options: voting.options.map(option => {
              if (option.id === optionId) {
                const newVotes = { ...option.votes };
                if (newVotes[memberId]) {
                  delete newVotes[memberId];
                } else {
                  newVotes[memberId] = true;
                }
                return { ...option, votes: newVotes };
              }
              return option;
            })
          };
        }
        return voting;
      })
    );
  };

  const getVoteCount = (votes: { [key: string]: boolean }) => {
    return Object.keys(votes).length;
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Завтрак';
      case 'lunch': return 'Обед';
      case 'dinner': return 'Ужин';
      default: return type;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Средне';
      case 'hard': return 'Сложно';
      default: return difficulty;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: 'Александр',
      senderAvatar: '👨',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setChatMessages([...chatMessages, message]);
    setNewMessage('');
  };

  const handleFileUpload = (file: File, type: 'image' | 'video' | 'document') => {
    const fileUrl = URL.createObjectURL(file);
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: '1',
      senderName: 'Александр',
      senderAvatar: '👨',
      content: type === 'image' ? 'Отправил фото' : type === 'video' ? 'Отправил видео' : 'Отправил документ',
      timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      type: type,
      fileUrl: fileUrl,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    };
    
    setChatMessages([...chatMessages, message]);
    
    if (type === 'image' || type === 'video') {
      const albumItem: FamilyAlbum = {
        id: Date.now().toString(),
        fileName: file.name,
        fileUrl: fileUrl,
        uploadedBy: 'Александр',
        uploadDate: new Date().toISOString().split('T')[0],
        type: type
      };
      setFamilyAlbum([...familyAlbum, albumItem]);
    }
  };

  const updateNeedStatus = (needId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setFamilyNeeds(needs => needs.map(need => 
      need.id === needId ? { ...need, status } : need
    ));
  };

  const getAISuggestedMeals = () => {
    const allFavorites = familyMembers
      .flatMap(m => m.foodPreferences?.favorites || []);
    const allDislikes = familyMembers
      .flatMap(m => m.foodPreferences?.dislikes || []);
    
    const suggestedMeals = [
      {
        name: 'Паста карбонара с салатом',
        reason: 'Нравится Александру, Елена любит салаты',
        avoidIngredients: allDislikes.slice(0, 2)
      },
      {
        name: 'Рыба на гриле с овощами',
        reason: 'Елена любит рыбу и овощи на гриле',
        avoidIngredients: allDislikes.slice(2, 4)
      },
      {
        name: 'Домашняя пицца',
        reason: 'Любимое блюдо Максима, можно добавить разные топпинги для всех',
        avoidIngredients: ['Брокколи', 'Лук']
      }
    ];
    
    return suggestedMeals;
  };

  const getEventsForDay = (date: string) => {
    return calendarEvents.filter(event => {
      if (event.date !== date) return false;
      if (event.visibility === 'family') return true;
      if (event.visibility === 'private' && event.createdBy === selectedUserId) return true;
      return false;
    });
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const completionRate = Math.round((completedTasksCount / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 to-pink-50">
      {showNotification && currentNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <Card className="border-orange-500 border-2 shadow-2xl bg-gradient-to-br from-orange-100 to-yellow-100 min-w-[320px]">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon name="Bell" className="text-orange-600 animate-bounce" size={24} />
                  <CardTitle className="text-lg">Напоминание!</CardTitle>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNotification(false)}
                  className="h-6 w-6 p-0"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{currentNotification.taskTitle}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Icon name="Clock" size={14} />
                Время: {currentNotification.time}
              </div>
              {tasks.find(t => t.id === currentNotification.taskId)?.shoppingList && (
                <div className="bg-white rounded-lg p-3 border border-orange-300">
                  <p className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Icon name="ShoppingCart" size={14} />
                    Список покупок:
                  </p>
                  <ul className="space-y-1">
                    {tasks.find(t => t.id === currentNotification.taskId)?.shoppingList?.map((item, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2">
                        <Icon name="Check" size={12} className="text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button 
                className="w-full mt-3 bg-gradient-to-r from-orange-500 to-yellow-500"
                onClick={() => setShowNotification(false)}
              >
                Понятно
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🏠</div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Семейный Помощник
                </h1>
                <p className="text-muted-foreground mt-1">Гармония начинается с порядка</p>
              </div>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                  <Icon name="Settings" className="mr-2" size={20} />
                  Настройки семьи
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Настройки семьи</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Добавить члена семьи</label>
                    <Input placeholder="Имя" className="mt-2" />
                  </div>
                  <Button className="w-full">Добавить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="animate-scale-in border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="TrendingUp" className="text-orange-500" size={22} />
                Общий прогресс
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {completionRate}%
                </div>
                <p className="text-sm text-muted-foreground mb-4">Выполнено задач сегодня</p>
                <Progress value={completionRate} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-purple-200 shadow-lg hover:shadow-xl transition-shadow" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Users" className="text-purple-500" size={22} />
                Активность семьи
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  {familyMembers.length}
                </div>
                <p className="text-sm text-muted-foreground mb-4">Членов семьи</p>
                <div className="flex justify-center gap-2">
                  {familyMembers.map(member => (
                    <div key={member.id} className="text-3xl">{member.avatar}</div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-scale-in border-pink-200 shadow-lg hover:shadow-xl transition-shadow" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Calendar" className="text-pink-500" size={22} />
                Ближайшее событие
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl mb-2">🎂</div>
                <p className="font-semibold text-foreground">{importantDates[0].title}</p>
                <p className="text-sm text-muted-foreground mt-1">{importantDates[0].date}</p>
                <Badge className="mt-3 bg-pink-500">Через {importantDates[0].daysLeft} дней</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="animate-fade-in border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Icon name="Calendar" className="text-indigo-600" size={28} />
                Календарь недели
              </CardTitle>
              <Button className="bg-gradient-to-r from-indigo-500 to-blue-500">
                <Icon name="Plus" className="mr-2" size={16} />
                Добавить событие
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {getWeekDays().map((day, idx) => {
                const dayEvents = getEventsForDay(day.fullDate);
                return (
                  <div 
                    key={idx}
                    className={`animate-fade-in ${
                      day.isToday 
                        ? 'bg-gradient-to-br from-indigo-100 to-blue-100 border-2 border-indigo-500' 
                        : 'bg-white border border-gray-200'
                    } rounded-lg p-3 hover:shadow-md transition-all`}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="text-center mb-2">
                      <div className="text-xs font-semibold text-muted-foreground">{day.dayName}</div>
                      <div className={`text-2xl font-bold ${
                        day.isToday ? 'text-indigo-600' : 'text-foreground'
                      }`}>
                        {day.date}
                      </div>
                      {day.isToday && (
                        <Badge className="mt-1 bg-indigo-500 text-white text-xs">Сегодня</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 min-h-[200px]">
                      {dayEvents.length > 0 ? (
                        dayEvents.map((event, eventIdx) => (
                          <div 
                            key={event.id}
                            className={`${event.color} border-2 rounded-lg p-2 hover:scale-105 transition-all cursor-pointer animate-fade-in`}
                            style={{ animationDelay: `${(idx * 0.05) + (eventIdx * 0.02)}s` }}
                          >
                            <div className="flex items-start gap-1 mb-1">
                              <Icon name="Clock" size={10} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-xs font-semibold">{event.time}</span>
                            </div>
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{event.title}</h4>
                            <div className="flex items-center justify-between gap-1">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {event.category}
                              </Badge>
                              {event.visibility === 'family' ? (
                                <Icon name="Users" size={12} className="text-muted-foreground" title="Видят все" />
                              ) : (
                                <Icon name="Lock" size={12} className="text-muted-foreground" title="Личное" />
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-0.5">
                              <span className="text-xs">{event.createdByAvatar}</span>
                              <span className="text-xs text-muted-foreground truncate">{event.createdByName}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <Icon name="CalendarOff" size={24} className="text-muted-foreground mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Нет событий</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Icon name="Users" size={16} className="text-indigo-600" />
                  <span className="text-muted-foreground">Семейные события</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Lock" size={16} className="text-purple-600" />
                  <span className="text-muted-foreground">Личные события</span>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Всего событий на неделе: <strong>{calendarEvents.filter(e => {
                  const weekDates = getWeekDays().map(d => d.fullDate);
                  return weekDates.includes(e.date) && (e.visibility === 'family' || e.createdBy === selectedUserId);
                }).length}</strong>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-indigo-100 to-blue-100 border-2 border-indigo-300 mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icon name="Info" className="text-indigo-600" size={20} />
                  Как это работает?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">1</div>
                    <p><strong>Семейные события</strong> (иконка 👥) видят все члены семьи</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">2</div>
                    <p><strong>Личные события</strong> (иконка 🔒) видит только тот, кто их создал</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold text-xs">3</div>
                    <p>Нажмите на событие, чтобы увидеть детали и список участников</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-12 h-auto lg:h-14">
            <TabsTrigger value="members" className="text-sm lg:text-base py-3">
              <Icon name="Users" className="mr-1 lg:mr-2" size={16} />
              Семья
            </TabsTrigger>
            <TabsTrigger value="tree" className="text-sm lg:text-base py-3">
              <Icon name="Network" className="mr-1 lg:mr-2" size={16} />
              Древо
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-sm lg:text-base py-3">
              <Icon name="CheckSquare" className="mr-1 lg:mr-2" size={16} />
              Задачи
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-sm lg:text-base py-3">
              <Icon name="MessageCircle" className="mr-1 lg:mr-2" size={16} />
              Чат
            </TabsTrigger>
            <TabsTrigger value="album" className="text-sm lg:text-base py-3">
              <Icon name="Image" className="mr-1 lg:mr-2" size={16} />
              Альбом
            </TabsTrigger>
            <TabsTrigger value="needs" className="text-sm lg:text-base py-3">
              <Icon name="ListTodo" className="mr-1 lg:mr-2" size={16} />
              Потребности
            </TabsTrigger>
            <TabsTrigger value="rating" className="text-sm lg:text-base py-3">
              <Icon name="Trophy" className="mr-1 lg:mr-2" size={16} />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="traditions" className="text-sm lg:text-base py-3">
              <Icon name="Calendar" className="mr-1 lg:mr-2" size={16} />
              Традиции
            </TabsTrigger>
            <TabsTrigger value="values" className="text-sm lg:text-base py-3">
              <Icon name="Sparkles" className="mr-1 lg:mr-2" size={16} />
              Ценности
            </TabsTrigger>
            <TabsTrigger value="meals" className="text-sm lg:text-base py-3">
              <Icon name="ChefHat" className="mr-1 lg:mr-2" size={16} />
              Меню
            </TabsTrigger>
            <TabsTrigger value="development" className="text-sm lg:text-base py-3">
              <Icon name="GraduationCap" className="mr-1 lg:mr-2" size={16} />
              Развитие
            </TabsTrigger>
            <TabsTrigger value="community" className="text-sm lg:text-base py-3">
              <Icon name="BookOpen" className="mr-1 lg:mr-2" size={16} />
              Блог
            </TabsTrigger>
            <TabsTrigger value="dates" className="text-sm lg:text-base py-3">
              <Icon name="Heart" className="mr-1 lg:mr-2" size={16} />
              Даты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {familyMembers.map((member, index) => (
                <Card 
                  key={member.id} 
                  className="animate-fade-in border-l-4 hover:shadow-lg transition-all hover:scale-[1.02]"
                  style={{ 
                    borderLeftColor: index % 2 === 0 ? '#f97316' : '#d946ef',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-5xl">{member.avatar}</div>
                        <div>
                          <CardTitle className="text-xl">{member.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          ⭐ Уровень {member.level}
                        </Badge>
                        <Badge variant="outline" className={getWorkloadColor(member.workload)}>
                          Загрузка: {member.workload}%
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-yellow-900">Баллы</span>
                          <span className="text-lg font-bold text-orange-600">{member.points}</span>
                        </div>
                        <Progress value={(member.points % 100)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          {100 - (member.points % 100)} до следующего уровня
                        </p>
                      </div>
                      
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Уровень вовлеченности</span>
                        <span className={`font-semibold ${getWorkloadColor(member.workload)}`}>
                          {member.workload > 70 ? 'Высокая' : member.workload > 50 ? 'Средняя' : 'Низкая'}
                        </span>
                      </div>
                      <Progress value={member.workload} className="h-2" />
                      
                      <div className="flex gap-1 flex-wrap mt-3">
                        {member.achievements.slice(0, 3).map((achievement, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {achievement === 'early_bird' && '🌅 Ранняя пташка'}
                            {achievement === 'helper' && '🤝 Помощник'}
                            {achievement === 'chef' && '👨‍🍳 Повар'}
                            {achievement === 'organizer' && '📋 Организатор'}
                            {achievement === 'champion' && '🏆 Чемпион'}
                            {achievement === 'master_chef' && '⭐ Мастер-повар'}
                            {achievement === 'student' && '📚 Ученик'}
                            {achievement === 'beginner' && '🌟 Новичок'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tree" className="space-y-6">
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <Icon name="Network" className="text-emerald-600" size={32} />
                    Семейное древо
                  </CardTitle>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить члена семьи
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">
                  История вашей семьи в 4 поколениях
                </p>
              </CardHeader>
              <CardContent>
                {[1, 2, 3, 4].map(generation => {
                  const members = familyTree.filter(m => m.generation === generation);
                  if (members.length === 0) return null;
                  
                  return (
                    <div key={generation} className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-lg px-4 py-2">
                          {generation === 1 && '👴👵 Прабабушки и прадедушки'}
                          {generation === 2 && '👨‍👩‍👧‍👦 Бабушки и дедушки'}
                          {generation === 3 && '👫 Родители'}
                          {generation === 4 && '👶 Дети'}
                        </Badge>
                        <div className="h-px flex-1 bg-gradient-to-r from-emerald-300 to-transparent"></div>
                      </div>
                      
                      <div className={`grid gap-4 ${
                        generation === 1 ? 'grid-cols-1 md:grid-cols-2' :
                        generation === 2 ? 'grid-cols-1 md:grid-cols-2' :
                        generation === 3 ? 'grid-cols-1 md:grid-cols-2' :
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                      }`}>
                        {members.map((member, idx) => {
                          const calculateAge = (birthDate: string, deathDate?: string) => {
                            const birth = new Date(birthDate);
                            const end = deathDate ? new Date(deathDate) : new Date();
                            return Math.floor((end.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
                          };

                          const years = member.deathDate 
                            ? `${birthDate.split('-')[0]} - ${member.deathDate.split('-')[0]}`
                            : `${member.birthDate.split('-')[0]} - н.в.`;

                          const age = member.age || calculateAge(member.birthDate, member.deathDate);
                          const ageText = member.deathDate 
                            ? `${age} лет` 
                            : `${age} ${age % 10 === 1 && age !== 11 ? 'год' : age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20) ? 'года' : 'лет'}`;

                          return (
                            <Card 
                              key={member.id}
                              className="animate-fade-in hover:shadow-xl transition-all cursor-pointer border-2 border-emerald-200 hover:border-emerald-400 overflow-hidden group"
                              style={{ animationDelay: `${idx * 0.1}s` }}
                              onClick={() => setSelectedTreeMember(member)}
                            >
                              <div className="relative">
                                <div className="h-32 bg-gradient-to-br from-emerald-200 via-teal-200 to-cyan-200 flex items-center justify-center">
                                  {member.photo ? (
                                    <img src={member.photo} alt={member.fullName} className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg" />
                                  ) : (
                                    <div className="text-7xl group-hover:scale-110 transition-transform">{member.avatar}</div>
                                  )}
                                </div>
                                {member.deathDate && (
                                  <Badge className="absolute top-2 right-2 bg-gray-600 text-white">
                                    <Icon name="Cross" size={12} className="mr-1" />
                                    Память
                                  </Badge>
                                )}
                              </div>
                              
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg leading-tight">{member.fullName}</CardTitle>
                                <p className="text-sm text-muted-foreground">{years} ({ageText})</p>
                              </CardHeader>
                              
                              <CardContent className="pt-2">
                                <div className="space-y-2 text-sm">
                                  {member.occupation && (
                                    <div className="flex items-center gap-2">
                                      <Icon name="Briefcase" size={14} className="text-emerald-600 flex-shrink-0" />
                                      <span className="line-clamp-1">{member.occupation}</span>
                                    </div>
                                  )}
                                  
                                  {member.placeOfBirth && (
                                    <div className="flex items-center gap-2">
                                      <Icon name="MapPin" size={14} className="text-emerald-600 flex-shrink-0" />
                                      <span className="line-clamp-1">{member.placeOfBirth}</span>
                                    </div>
                                  )}
                                  
                                  {member.bio && (
                                    <p className="text-muted-foreground line-clamp-2 text-xs mt-2">
                                      {member.bio}
                                    </p>
                                  )}
                                  
                                  {member.achievements && member.achievements.length > 0 && (
                                    <div className="flex items-center gap-1 mt-2">
                                      <Icon name="Award" size={14} className="text-amber-500 flex-shrink-0" />
                                      <Badge variant="outline" className="text-xs">{member.achievements.length} достижений</Badge>
                                    </div>
                                  )}
                                </div>
                                
                                <Button 
                                  className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:from-emerald-600 group-hover:to-teal-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTreeMember(member);
                                  }}
                                >
                                  <Icon name="Eye" className="mr-2" size={16} />
                                  Открыть профиль
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                <Card className="bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Info" className="text-emerald-600" size={20} />
                      О семейном древе
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>• <strong>Всего членов семьи:</strong> {familyTree.length} человек в 4 поколениях</p>
                    <p>• Нажмите на карточку, чтобы увидеть полную биографию, фотографии и документы</p>
                    <p>• Добавляйте новых членов семьи и храните историю вашего рода</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card className="border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Список обязанностей</CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить задачу
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div 
                      key={task.id} 
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <Checkbox 
                        checked={task.completed} 
                        onCheckedChange={() => toggleTask(task.id)}
                        className="h-5 w-5"
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                          <span className="text-xs text-muted-foreground">• {task.assignee}</span>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">+{task.points} ⭐</Badge>
                          {task.reminderTime && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs flex items-center gap-1">
                              <Icon name="Bell" size={10} />
                              {task.reminderTime}
                            </Badge>
                          )}
                          {task.shoppingList && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs flex items-center gap-1 cursor-pointer hover:bg-blue-200">
                                  <Icon name="ShoppingCart" size={10} />
                                  Список ({task.shoppingList.length})
                                </Badge>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Icon name="ShoppingCart" size={20} />
                                    Список покупок
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-2 mt-4">
                                  {task.shoppingList.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                      <Checkbox className="h-4 w-4" />
                                      <span className="text-sm">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Icon name="ArrowLeftRight" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rating" className="space-y-4">
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Trophy" className="text-yellow-600" size={28} />
                  Семейный рейтинг
                </CardTitle>
                <p className="text-sm text-muted-foreground">Топ участников этой недели</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...familyMembers]
                    .sort((a, b) => b.points - a.points)
                    .map((member, index) => {
                      const medals = ['🥇', '🥈', '🥉', '🎖️'];
                      const medal = medals[index] || '🎖️';
                      
                      return (
                        <div 
                          key={member.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-white border-2 hover:shadow-md transition-all"
                          style={{
                            borderColor: index === 0 ? '#fbbf24' : index === 1 ? '#d1d5db' : index === 2 ? '#cd7f32' : '#e5e7eb'
                          }}
                        >
                          <div className="text-4xl">{medal}</div>
                          <div className="text-4xl">{member.avatar}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-lg">{member.name}</h3>
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                Ур. {member.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {member.achievements.map((achievement, i) => (
                                <span key={i} className="text-xs">
                                  {achievement === 'early_bird' && '🌅'}
                                  {achievement === 'helper' && '🤝'}
                                  {achievement === 'chef' && '👨‍🍳'}
                                  {achievement === 'organizer' && '📋'}
                                  {achievement === 'champion' && '🏆'}
                                  {achievement === 'master_chef' && '⭐'}
                                  {achievement === 'student' && '📚'}
                                  {achievement === 'beginner' && '🌟'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                              {member.points}
                            </div>
                            <p className="text-xs text-muted-foreground">баллов</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Award" className="text-purple-600" size={20} />
                    Достижения
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-3xl mb-1">🌅</div>
                      <p className="text-xs font-medium">Ранняя пташка</p>
                      <p className="text-xs text-muted-foreground">10 задач до 9:00</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-3xl mb-1">📋</div>
                      <p className="text-xs font-medium">Организатор</p>
                      <p className="text-xs text-muted-foreground">Создать 20 задач</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-3xl mb-1">🏆</div>
                      <p className="text-xs font-medium">Чемпион</p>
                      <p className="text-xs text-muted-foreground">500 баллов</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-3xl mb-1">⭐</div>
                      <p className="text-xs font-medium">Мастер</p>
                      <p className="text-xs text-muted-foreground">Достичь 10 уровня</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traditions" className="space-y-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="Calendar" className="text-blue-600" size={28} />
                      Наши семейные традиции
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Ритуалы, которые объединяют нашу семью</p>
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить традицию
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {traditions.map((tradition, index) => (
                    <Card 
                      key={tradition.id}
                      className="animate-fade-in bg-white hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-blue-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <CardHeader>
                        <div className="text-center">
                          <div className="text-6xl mb-3">{tradition.icon}</div>
                          <CardTitle className="text-lg">{tradition.title}</CardTitle>
                          <Badge className="mt-2 bg-blue-100 text-blue-800 border-blue-300">
                            {tradition.frequency}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-center text-muted-foreground leading-relaxed">
                          {tradition.description}
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-blue-900 mb-2">Участники:</p>
                          <div className="flex gap-1 flex-wrap">
                            {tradition.participants.map((participant, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-blue-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Lightbulb" className="text-blue-600" size={22} />
                    Почему традиции важны?
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-3">
                      <Icon name="Heart" className="text-red-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Укрепляют связи</p>
                        <p className="text-xs text-muted-foreground">Регулярные ритуалы создают чувство единства</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Icon name="Shield" className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Дают стабильность</p>
                        <p className="text-xs text-muted-foreground">Предсказуемость создаёт ощущение безопасности</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Icon name="Star" className="text-yellow-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Создают воспоминания</p>
                        <p className="text-xs text-muted-foreground">Особые моменты остаются в памяти навсегда</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Icon name="Users" className="text-green-500 flex-shrink-0 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-sm">Передают ценности</p>
                        <p className="text-xs text-muted-foreground">Традиции учат детей важным жизненным принципам</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="values" className="space-y-4">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="Sparkles" className="text-purple-600" size={28} />
                  Семейные ценности
                </CardTitle>
                <p className="text-sm text-muted-foreground">Принципы, которые объединяют нашу семью</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyValues.map((value, index) => (
                    <Card 
                      key={value.id}
                      className="animate-fade-in bg-white hover:shadow-xl transition-all hover:scale-[1.02] border-2"
                      style={{ 
                        animationDelay: `${index * 0.1}s`,
                        borderColor: index % 3 === 0 ? '#f97316' : index % 3 === 1 ? '#a855f7' : '#ec4899'
                      }}
                    >
                      <CardHeader>
                        <div className="text-center">
                          <div className="text-6xl mb-3">{value.icon}</div>
                          <CardTitle className="text-lg">{value.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-center text-muted-foreground leading-relaxed">
                          {value.description}
                        </p>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                          <p className="text-xs font-semibold text-purple-900 mb-1 flex items-center gap-1">
                            <Icon name="Calendar" size={14} className="text-purple-600" />
                            Наша традиция:
                          </p>
                          <p className="text-xs text-purple-800">{value.tradition}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-purple-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Lightbulb" className="text-purple-600" size={22} />
                    Психологические советы по границам
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Уважайте личное пространство</p>
                          <p className="text-xs text-muted-foreground">У каждого должно быть своё время и место для уединения</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Говорите о чувствах открыто</p>
                          <p className="text-xs text-muted-foreground">Используйте "Я-сообщения": "Я чувствую...", "Мне важно..."</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Учитесь говорить "нет"</p>
                          <p className="text-xs text-muted-foreground">Отказ — это нормально, если он сказан с уважением</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Разделяйте обязанности справедливо</p>
                          <p className="text-xs text-muted-foreground">Учитывайте возможности и загруженность каждого</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Выделяйте время для себя</p>
                          <p className="text-xs text-muted-foreground">Здоровые границы помогают избежать эмоционального выгорания</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Icon name="CheckCircle2" className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-medium text-sm">Празднуйте успехи вместе</p>
                          <p className="text-xs text-muted-foreground">Признание достижений укрепляет семейные связи</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="community" className="space-y-4">
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="BookOpen" className="text-orange-600" size={28} />
                      Сообщество и блог
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Советы экспертов по семейным вопросам</p>
                  </div>
                  <Button variant="outline" className="border-orange-300">
                    <Icon name="Rss" className="mr-2" size={16} />
                    Подписаться
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex gap-2 flex-wrap">
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 cursor-pointer">Все</Badge>
                  <Badge variant="outline" className="cursor-pointer">Воспитание</Badge>
                  <Badge variant="outline" className="cursor-pointer">Отношения</Badge>
                  <Badge variant="outline" className="cursor-pointer">Психология</Badge>
                  <Badge variant="outline" className="cursor-pointer">Традиции</Badge>
                  <Badge variant="outline" className="cursor-pointer">Здоровье</Badge>
                </div>

                <div className="space-y-4">
                  {blogPosts.map((post, index) => (
                    <Card 
                      key={post.id}
                      className="animate-fade-in bg-white hover:shadow-lg transition-all cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                              <span className="text-xs text-muted-foreground">{post.date}</span>
                            </div>
                            <CardTitle className="text-lg hover:text-orange-600 transition-colors">
                              {post.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-2">{post.excerpt}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Icon name="User" size={14} />
                                {post.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="ThumbsUp" size={14} className="text-orange-500" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icon name="MessageCircle" size={14} className="text-blue-500" />
                                {post.comments}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-orange-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Users" className="text-orange-600" size={22} />
                    Присоединяйтесь к сообществу
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">12,450</div>
                      <p className="text-sm text-muted-foreground">Активных семей</p>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="text-3xl font-bold text-pink-600">340</div>
                      <p className="text-sm text-muted-foreground">Статей экспертов</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">8,920</div>
                      <p className="text-sm text-muted-foreground">Обсуждений</p>
                    </div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground mb-4">
                    Делитесь опытом, задавайте вопросы и получайте поддержку от других семей
                  </p>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500">
                    <Icon name="MessageSquare" className="mr-2" size={16} />
                    Начать обсуждение
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meals" className="space-y-4">
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="ChefHat" className="text-green-600" size={28} />
                      Семейное меню
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Голосуйте за любимые блюда всей семьёй</p>
                  </div>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Предложить блюдо
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon name="Sparkles" className="text-green-600" size={20} />
                      ИИ рекомендации на основе предпочтений семьи
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getAISuggestedMeals().map((meal, idx) => (
                        <Card key={idx} className="bg-white border border-green-200 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-green-800">{meal.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">{meal.reason}</p>
                              </div>
                              <Button variant="outline" size="sm" className="ml-2">
                                <Icon name="Plus" className="mr-1" size={14} />
                                Добавить
                              </Button>
                            </div>
                            {meal.avoidIngredients.length > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <Icon name="AlertCircle" size={14} className="text-orange-500" />
                                <span className="text-xs text-muted-foreground">
                                  Избегать: {meal.avoidIngredients.join(', ')}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg">
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <Icon name="Info" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <span>ИИ анализирует любимые и нелюбимые продукты всех членов семьи и предлагает блюда, которые понравятся всем</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Icon name="Heart" className="text-red-500" size={20} />
                    Пищевые предпочтения семьи
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {familyMembers.map(member => (
                      <Card key={member.id} className="border-green-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{member.avatar}</span>
                            <div>
                              <CardTitle className="text-base">{member.name}</CardTitle>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="text-xs font-semibold mb-1 flex items-center gap-1">
                                <Icon name="ThumbsUp" size={12} className="text-green-600" />
                                Любит:
                              </h4>
                              <div className="flex gap-1 flex-wrap">
                                {member.foodPreferences?.favorites.map((food, idx) => (
                                  <Badge key={idx} className="bg-green-100 text-green-800 border-green-300 text-xs">
                                    {food}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold mb-1 flex items-center gap-1">
                                <Icon name="ThumbsDown" size={12} className="text-red-600" />
                                Не любит:
                              </h4>
                              <div className="flex gap-1 flex-wrap">
                                {member.foodPreferences?.dislikes.map((food, idx) => (
                                  <Badge key={idx} className="bg-red-100 text-red-800 border-red-300 text-xs">
                                    {food}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {mealVotings.map((voting, vIndex) => (
                    <Card key={voting.id} className="animate-fade-in bg-white border-2 border-green-200" style={{ animationDelay: `${vIndex * 0.1}s` }}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{voting.title}</CardTitle>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                {getMealTypeLabel(voting.mealType)}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                {voting.date}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {voting.status === 'active' ? 'Активно' : 'Завершено'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {voting.options.map((option, oIndex) => {
                            const voteCount = getVoteCount(option.votes);
                            const isLeader = voteCount > 0 && voting.options.every(o => getVoteCount(o.votes) <= voteCount);
                            
                            return (
                              <Card 
                                key={option.id}
                                className={`animate-fade-in hover:shadow-lg transition-all ${isLeader && voteCount > 0 ? 'border-2 border-green-500 bg-green-50' : 'border border-gray-200'}`}
                                style={{ animationDelay: `${(vIndex * 0.1) + (oIndex * 0.05)}s` }}
                              >
                                <CardHeader>
                                  <div className="text-center">
                                    <div className="text-5xl mb-2">{option.icon}</div>
                                    <CardTitle className="text-lg">{option.name}</CardTitle>
                                    {isLeader && voteCount > 0 && (
                                      <Badge className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                        🏆 Лидер
                                      </Badge>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <p className="text-sm text-center text-muted-foreground min-h-[40px]">
                                    {option.description}
                                  </p>
                                  
                                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Icon name="Clock" size={12} />
                                      {option.cookingTime}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Icon name="Gauge" size={12} />
                                      {getDifficultyLabel(option.difficulty)}
                                    </div>
                                  </div>

                                  <div className="bg-white border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-semibold">Голоса:</span>
                                      <Badge className="bg-green-100 text-green-800 border-green-300">
                                        {voteCount} из {familyMembers.length}
                                      </Badge>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                      {familyMembers.map(member => {
                                        const hasVoted = option.votes[member.id];
                                        return (
                                          <button
                                            key={member.id}
                                            onClick={() => toggleVote(voting.id, option.id, member.id)}
                                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                                              hasVoted 
                                                ? 'bg-green-100 border-2 border-green-500 scale-110' 
                                                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                            title={member.name}
                                          >
                                            <div className="text-2xl">{member.avatar}</div>
                                            {hasVoted && <Icon name="Check" size={14} className="text-green-600" />}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <Button 
                                    className={`w-full ${voteCount > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}`}
                                    variant={voteCount > 0 ? 'default' : 'outline'}
                                  >
                                    <Icon name="ThumbsUp" className="mr-2" size={16} />
                                    {voteCount > 0 ? `${voteCount} голос${voteCount > 1 ? 'а' : ''}` : 'Голосовать'}
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon name="Info" size={18} className="text-green-600" />
                              <span className="text-sm font-medium">Совет:</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Icon name="MessageCircle" className="mr-2" size={14} />
                              Обсудить в чате
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Нажмите на аватар члена семьи, чтобы проголосовать за блюдо от его имени
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-white rounded-lg border-2 border-green-300">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Icon name="Lightbulb" className="text-green-600" size={22} />
                    Популярные идеи для меню
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🍕</div>
                      <span className="text-xs">Пицца</span>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🍜</div>
                      <span className="text-xs">Супы</span>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🥗</div>
                      <span className="text-xs">Салаты</span>
                    </Button>
                    <Button variant="outline" className="justify-start h-auto py-3 flex-col items-start">
                      <div className="text-2xl mb-1">🍰</div>
                      <span className="text-xs">Десерты</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {importantDates.map((date, index) => (
                <Card 
                  key={date.id} 
                  className="animate-fade-in border-pink-200 hover:shadow-xl transition-all hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="text-center">
                      <div className="text-6xl mb-3">
                        {date.type === 'birthday' ? '🎂' : date.type === 'anniversary' ? '💍' : '🎉'}
                      </div>
                      <CardTitle className="text-lg">{date.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{date.date}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-1">
                          Через {date.daysLeft} дней
                        </Badge>
                      </div>
                      {date.daysLeft <= 7 && (
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 space-y-2">
                          <p className="text-sm font-medium text-pink-900 flex items-center gap-2">
                            <Icon name="Sparkles" size={16} className="text-pink-500" />
                            Предложения:
                          </p>
                          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                            <Icon name="Gift" className="mr-2" size={14} />
                            Заказать букет цветов
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                            <Icon name="Heart" className="mr-2" size={14} />
                            Написать поздравление
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="development" className="space-y-4">
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="GraduationCap" className="text-indigo-600" size={28} />
                      Развитие детей
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Персональные планы развития на основе интересов и способностей</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={developmentPlans[0]?.childId} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    {developmentPlans.map(plan => (
                      <TabsTrigger key={plan.childId} value={plan.childId} className="flex items-center gap-2">
                        <span className="text-2xl">{familyMembers.find(m => m.id === plan.childId)?.avatar}</span>
                        {plan.childName}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {developmentPlans.map(plan => (
                    <TabsContent key={plan.childId} value={plan.childId} className="space-y-4">
                      <Card className="bg-white border-2 border-indigo-200">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <Icon name="User" className="text-indigo-600" size={22} />
                              Профиль ребёнка
                            </CardTitle>
                            <Button variant="outline" size="sm">
                              <Icon name="Edit" className="mr-2" size={14} />
                              Редактировать анкету
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Icon name="Heart" size={16} className="text-red-500" />
                                  Интересы
                                </h4>
                                <div className="flex gap-2 flex-wrap">
                                  {plan.profile.interests.map((interest, idx) => (
                                    <Badge key={idx} variant="secondary">{interest}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Icon name="Star" size={16} className="text-yellow-500" />
                                  Сильные стороны
                                </h4>
                                <div className="flex gap-2 flex-wrap">
                                  {plan.profile.strengths.map((strength, idx) => (
                                    <Badge key={idx} className="bg-yellow-100 text-yellow-800 border-yellow-300">{strength}</Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Icon name="Target" size={16} className="text-green-500" />
                                  Цели
                                </h4>
                                <ul className="space-y-2">
                                  {plan.profile.goals.map((goal, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm">
                                      <Icon name="Check" size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                                      {goal}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Icon name="Sparkles" size={16} className="text-purple-500" />
                                  Тип личности
                                </h4>
                                <p className="text-sm text-muted-foreground">{plan.profile.personality}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white border-2 border-indigo-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Icon name="Calendar" className="text-indigo-600" size={22} />
                            Расписание кружков
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {plan.schedule.map((activity, idx) => (
                              <Card key={activity.id} className={`${activity.color} border-2 animate-fade-in`} style={{ animationDelay: `${idx * 0.05}s` }}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold">{activity.name}</h4>
                                        <Badge variant="outline" className="text-xs">{activity.category}</Badge>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                          <Icon name="Calendar" size={12} />
                                          {activity.dayOfWeek}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Icon name="Clock" size={12} />
                                          {activity.time}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Icon name="Timer" size={12} />
                                          {activity.duration}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Icon name="MapPin" size={12} />
                                          {activity.location}
                                        </div>
                                      </div>
                                      <div className="mt-2 text-xs text-muted-foreground">
                                        Преподаватель: {activity.instructor}
                                      </div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      <Icon name="MoreVertical" size={16} />
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                            <Icon name="Plus" className="mr-2" size={16} />
                            Добавить кружок
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="bg-white border-2 border-indigo-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Icon name="TrendingUp" className="text-indigo-600" size={22} />
                            Развиваемые навыки
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {plan.skills.map((skill, idx) => (
                              <Card 
                                key={skill.id} 
                                className={`animate-fade-in ${
                                  skill.importance === 'high' ? 'border-l-4 border-l-red-500' :
                                  skill.importance === 'medium' ? 'border-l-4 border-l-yellow-500' :
                                  'border-l-4 border-l-green-500'
                                }`}
                                style={{ animationDelay: `${idx * 0.05}s` }}
                              >
                                <CardContent className="p-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-semibold">{skill.skillName}</h4>
                                          <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                                          {skill.importance === 'high' && (
                                            <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">Приоритет</Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-medium">Прогресс</span>
                                        <span className="text-xs font-bold text-indigo-600">{skill.progress}%</span>
                                      </div>
                                      <Progress value={skill.progress} className="h-2" />
                                    </div>

                                    <div>
                                      <p className="text-xs font-semibold mb-2">Рекомендуемые активности:</p>
                                      <div className="flex gap-2 flex-wrap">
                                        {skill.suggestedActivities.map((activity, aIdx) => (
                                          <Badge key={aIdx} variant="secondary" className="text-xs">{activity}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white border-2 border-indigo-200">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Icon name="Award" className="text-indigo-600" size={22} />
                            Достижения и вехи
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {plan.milestones.map((milestone, idx) => (
                              <div 
                                key={idx}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                  milestone.completed 
                                    ? 'bg-green-50 border-green-300' 
                                    : 'bg-gray-50 border-gray-300'
                                }`}
                              >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                                }`}>
                                  {milestone.completed ? (
                                    <Icon name="Check" size={18} className="text-white" />
                                  ) : (
                                    <Icon name="Clock" size={18} className="text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-medium text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                    {milestone.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{milestone.date}</p>
                                </div>
                                {milestone.completed && (
                                  <div className="text-2xl">🎉</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-300">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Icon name="Lightbulb" className="text-indigo-600" size={20} />
                            Рекомендации экспертов
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="bg-white rounded-lg p-4 border border-indigo-200">
                              <div className="flex items-start gap-3">
                                <Icon name="MessageCircle" className="text-indigo-600 flex-shrink-0 mt-1" size={18} />
                                <div>
                                  <p className="text-sm font-medium mb-1">На основе профиля {plan.childName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {plan.childId === '3' 
                                      ? 'Рекомендуем добавить шахматы для развития стратегического мышления и участие в командных проектах для улучшения социальных навыков.'
                                      : 'Отличный баланс творческих активностей! Рекомендуем добавить театральный кружок для развития уверенности в себе и публичных выступлений.'
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" className="w-full">
                              <Icon name="FileText" className="mr-2" size={16} />
                              Показать полный отчёт
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="MessageCircle" className="text-blue-600" size={28} />
                  Семейный чат
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Общайтесь, делитесь фото и видео с семьёй</p>
              </CardHeader>
              <CardContent>
                <div className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
                  <div className="h-[500px] overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((message, idx) => (
                      <div 
                        key={message.id}
                        className={`flex items-start gap-3 animate-fade-in ${
                          message.senderId === '1' ? 'flex-row-reverse' : ''
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <div className="text-3xl flex-shrink-0">{message.senderAvatar}</div>
                        <div className={`flex-1 max-w-[70%] ${message.senderId === '1' ? 'items-end' : ''}`}>
                          <p className="text-xs text-muted-foreground mb-1">
                            {message.senderName} • {message.timestamp}
                          </p>
                          <div className={`rounded-lg p-3 ${
                            message.senderId === '1' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {message.type === 'text' && (
                              <p className="text-sm">{message.content}</p>
                            )}
                            {message.type === 'image' && (
                              <div className="space-y-2">
                                <p className="text-sm">{message.content}</p>
                                <div className="bg-white rounded p-2 flex items-center gap-2">
                                  <Icon name="Image" size={16} className="text-blue-600" />
                                  <span className="text-xs text-gray-600">{message.fileName}</span>
                                </div>
                              </div>
                            )}
                            {message.type === 'video' && (
                              <div className="space-y-2">
                                <p className="text-sm">{message.content}</p>
                                <div className="bg-white rounded p-2 flex items-center gap-2">
                                  <Icon name="Video" size={16} className="text-blue-600" />
                                  <span className="text-xs text-gray-600">{message.fileName}</span>
                                </div>
                              </div>
                            )}
                            {message.type === 'document' && (
                              <div className="space-y-2">
                                <p className="text-sm">{message.content}</p>
                                <div className="bg-white rounded p-2 flex items-center gap-2">
                                  <Icon name="FileText" size={16} className="text-blue-600" />
                                  <span className="text-xs text-gray-600">{message.fileName}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t-2 border-blue-200 p-4 bg-blue-50">
                    <div className="flex gap-2 mb-3">
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
                        />
                        <Button variant="outline" size="sm" type="button">
                          <Icon name="Image" className="mr-2" size={16} />
                          Фото
                        </Button>
                      </label>
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          accept="video/*" 
                          className="hidden" 
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video')}
                        />
                        <Button variant="outline" size="sm" type="button">
                          <Icon name="Video" className="mr-2" size={16} />
                          Видео
                        </Button>
                      </label>
                      <label className="cursor-pointer">
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx,.txt" 
                          className="hidden" 
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'document')}
                        />
                        <Button variant="outline" size="sm" type="button">
                          <Icon name="FileText" className="mr-2" size={16} />
                          Документ
                        </Button>
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Напишите сообщение..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} className="bg-gradient-to-r from-blue-500 to-cyan-500">
                        <Icon name="Send" size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="album" className="space-y-4">
            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="Image" className="text-purple-600" size={28} />
                      Семейный альбом
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Все фото и видео из чата автоматически сохраняются здесь</p>
                  </div>
                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      multiple
                      className="hidden" 
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const type = file.type.startsWith('image/') ? 'image' : 'video';
                          handleFileUpload(file, type);
                        });
                      }}
                    />
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                      <Icon name="Upload" className="mr-2" size={16} />
                      Загрузить
                    </Button>
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {familyAlbum.map((item, idx) => (
                    <Card 
                      key={item.id}
                      className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] animate-fade-in"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative">
                        {item.type === 'image' ? (
                          <Icon name="Image" size={48} className="text-purple-400" />
                        ) : (
                          <Icon name="Video" size={48} className="text-pink-400" />
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white text-purple-600 border border-purple-300">
                            {item.type === 'image' ? '📷' : '🎥'}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-xs font-medium truncate">{item.fileName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">{item.uploadedBy}</p>
                          <p className="text-xs text-muted-foreground">{item.uploadDate}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {familyAlbum.length === 0 && (
                  <div className="text-center py-12">
                    <Icon name="ImageOff" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Пока нет фото и видео</p>
                    <p className="text-sm text-muted-foreground mt-1">Отправьте фото или видео в чате, и они появятся здесь</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="needs" className="space-y-4">
            <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="ListTodo" className="text-teal-600" size={28} />
                      Потребности семьи
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Создавайте задачи и назначайте ответственных автоматически</p>
                  </div>
                  <Button className="bg-gradient-to-r from-teal-500 to-cyan-500">
                    <Icon name="Plus" className="mr-2" size={16} />
                    Добавить потребность
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Все</TabsTrigger>
                    <TabsTrigger value="pending">Ожидают</TabsTrigger>
                    <TabsTrigger value="in_progress">В работе</TabsTrigger>
                    <TabsTrigger value="completed">Выполнено</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-3">
                    {familyNeeds.map((need, idx) => (
                      <Card 
                        key={need.id}
                        className={`animate-fade-in border-l-4 ${
                          need.priority === 'high' ? 'border-l-red-500' :
                          need.priority === 'medium' ? 'border-l-yellow-500' :
                          'border-l-green-500'
                        }`}
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">{need.title}</h4>
                                <Badge variant="outline" className="text-xs">{need.category}</Badge>
                                {need.priority === 'high' && (
                                  <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                                    Срочно
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{need.description}</p>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                  <Icon name="User" size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Создал:</span>
                                  <span className="font-medium">{need.createdByName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Icon name="UserCheck" size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Ответственный:</span>
                                  <span className="font-medium">{need.assignedToName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                                  <span className="text-muted-foreground">Создано:</span>
                                  <span className="text-xs">{need.createdAt}</span>
                                </div>
                                {need.dueDate && (
                                  <div className="flex items-center gap-2">
                                    <Icon name="Calendar" size={14} className="text-muted-foreground" />
                                    <span className="text-muted-foreground">Срок:</span>
                                    <span className="text-xs">{need.dueDate}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                              <Badge 
                                className={
                                  need.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                                  need.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                  'bg-gray-100 text-gray-800 border-gray-300'
                                }
                              >
                                {need.status === 'completed' && '✓ Выполнено'}
                                {need.status === 'in_progress' && '⏳ В работе'}
                                {need.status === 'pending' && '⏸ Ожидает'}
                              </Badge>
                              
                              {need.status !== 'completed' && (
                                <div className="flex flex-col gap-1">
                                  {need.status === 'pending' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => updateNeedStatus(need.id, 'in_progress')}
                                    >
                                      Начать
                                    </Button>
                                  )}
                                  {need.status === 'in_progress' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => updateNeedStatus(need.id, 'completed')}
                                    >
                                      Завершить
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-3">
                    {familyNeeds.filter(n => n.status === 'pending').map((need, idx) => (
                      <Card 
                        key={need.id}
                        className="animate-fade-in border-l-4 border-l-gray-500"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{need.title}</h4>
                          <p className="text-sm text-muted-foreground">{need.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm">Ответственный: <strong>{need.assignedToName}</strong></span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateNeedStatus(need.id, 'in_progress')}
                            >
                              Начать
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="in_progress" className="space-y-3">
                    {familyNeeds.filter(n => n.status === 'in_progress').map((need, idx) => (
                      <Card 
                        key={need.id}
                        className="animate-fade-in border-l-4 border-l-blue-500"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{need.title}</h4>
                          <p className="text-sm text-muted-foreground">{need.description}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-sm">Ответственный: <strong>{need.assignedToName}</strong></span>
                            <Button 
                              size="sm"
                              onClick={() => updateNeedStatus(need.id, 'completed')}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              Завершить
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="completed" className="space-y-3">
                    {familyNeeds.filter(n => n.status === 'completed').map((need, idx) => (
                      <Card 
                        key={need.id}
                        className="animate-fade-in border-l-4 border-l-green-500 opacity-70"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon name="CheckCircle2" className="text-green-600" size={20} />
                            <h4 className="font-semibold line-through">{need.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{need.description}</p>
                          <div className="mt-3 text-sm">
                            Выполнил: <strong>{need.assignedToName}</strong>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>

                <Card className="bg-gradient-to-br from-teal-100 to-cyan-100 border-2 border-teal-300 mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon name="Lightbulb" className="text-teal-600" size={20} />
                      Как это работает?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">1</div>
                        <p>Любой член семьи создаёт потребность (постирать, купить продукты, помочь с уроками)</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">2</div>
                        <p>Система автоматически назначает задачу тому, в чьи обязанности это входит</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 font-semibold">3</div>
                        <p>Ответственный видит задачу, начинает работу и отмечает выполнение</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={selectedTreeMember !== null} onOpenChange={() => setSelectedTreeMember(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTreeMember && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {selectedTreeMember.photo ? (
                        <img 
                          src={selectedTreeMember.photo} 
                          alt={selectedTreeMember.fullName} 
                          className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-200 to-teal-200 flex items-center justify-center border-4 border-emerald-500 shadow-lg">
                          <span className="text-6xl">{selectedTreeMember.avatar}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-3xl mb-2">{selectedTreeMember.fullName}</DialogTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p className="text-lg">
                          {selectedTreeMember.birthDate.split('-').reverse().join('.')} 
                          {selectedTreeMember.deathDate && ` - ${selectedTreeMember.deathDate.split('-').reverse().join('.')}`}
                          {' '}({selectedTreeMember.age} 
                          {selectedTreeMember.age && (selectedTreeMember.age % 10 === 1 && selectedTreeMember.age !== 11 ? ' год' : 
                            selectedTreeMember.age % 10 >= 2 && selectedTreeMember.age % 10 <= 4 && (selectedTreeMember.age < 10 || selectedTreeMember.age > 20) ? ' года' : ' лет')})
                        </p>
                        {selectedTreeMember.placeOfBirth && (
                          <div className="flex items-center gap-2">
                            <Icon name="MapPin" size={16} className="text-emerald-600" />
                            <span>Место рождения: {selectedTreeMember.placeOfBirth}</span>
                          </div>
                        )}
                        {selectedTreeMember.occupation && (
                          <div className="flex items-center gap-2">
                            <Icon name="Briefcase" size={16} className="text-emerald-600" />
                            <span>{selectedTreeMember.occupation}</span>
                          </div>
                        )}
                      </div>
                      {selectedTreeMember.deathDate && (
                        <Badge className="mt-2 bg-gray-600 text-white">
                          <Icon name="Cross" size={12} className="mr-1" />
                          Светлая память
                        </Badge>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  {selectedTreeMember.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon name="User" className="text-emerald-600" size={20} />
                          Биография
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{selectedTreeMember.bio}</p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedTreeMember.education && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon name="GraduationCap" className="text-emerald-600" size={20} />
                          Образование
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{selectedTreeMember.education}</p>
                      </CardContent>
                    </Card>
                  )}

                  {selectedTreeMember.achievements && selectedTreeMember.achievements.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon name="Award" className="text-amber-600" size={20} />
                          Достижения и награды
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedTreeMember.achievements.map((achievement, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                              <Icon name="Star" size={16} className="text-amber-600 flex-shrink-0" />
                              <span className="text-sm">{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedTreeMember.hobbies && selectedTreeMember.hobbies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon name="Heart" className="text-rose-600" size={20} />
                          Увлечения
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedTreeMember.hobbies.map((hobby, idx) => (
                            <Badge key={idx} variant="outline" className="text-sm">{hobby}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedTreeMember.importantDates && selectedTreeMember.importantDates.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon name="Calendar" className="text-blue-600" size={20} />
                          Важные даты
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedTreeMember.importantDates.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                              <Icon name="CalendarCheck" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-sm">{item.event}</p>
                                <p className="text-xs text-muted-foreground">{item.date.split('-').reverse().join('.')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedTreeMember.gallery && selectedTreeMember.gallery.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon name="Image" className="text-purple-600" size={20} />
                          Фотогалерея
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {selectedTreeMember.gallery.map((photo, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-emerald-500 transition-colors cursor-pointer">
                              <img src={photo} alt={`Фото ${idx + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform" />
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-4 bg-purple-500 hover:bg-purple-600">
                          <Icon name="Upload" className="mr-2" size={16} />
                          Загрузить фото
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {selectedTreeMember.documents && selectedTreeMember.documents.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Icon name="FileText" className="text-indigo-600" size={20} />
                          Документы
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedTreeMember.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <Icon name="File" size={20} className="text-indigo-600" />
                                <div>
                                  <p className="font-semibold text-sm">{doc.title}</p>
                                  <p className="text-xs text-muted-foreground">Загружено: {doc.uploadDate}</p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Icon name="Download" className="mr-2" size={14} />
                                Скачать
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600">
                          <Icon name="Upload" className="mr-2" size={16} />
                          Загрузить документ
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-emerald-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon name="Users" className="text-emerald-600" size={20} />
                        Связи
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      {selectedTreeMember.parentIds.length > 0 && (
                        <p>
                          <strong>Родители:</strong>{' '}
                          {selectedTreeMember.parentIds.map(id => {
                            const parent = familyTree.find(m => m.id === id);
                            return parent?.fullName;
                          }).filter(Boolean).join(', ')}
                        </p>
                      )}
                      {selectedTreeMember.spouseId && (
                        <p>
                          <strong>Супруг(а):</strong>{' '}
                          {familyTree.find(m => m.id === selectedTreeMember.spouseId)?.fullName}
                        </p>
                      )}
                      {familyTree.filter(m => m.parentIds.includes(selectedTreeMember.id)).length > 0 && (
                        <p>
                          <strong>Дети:</strong>{' '}
                          {familyTree.filter(m => m.parentIds.includes(selectedTreeMember.id)).map(m => m.fullName).join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}