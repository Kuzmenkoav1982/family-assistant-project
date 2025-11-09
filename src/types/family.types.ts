export interface FamilyMember {
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

export interface Task {
  id: string;
  title: string;
  assignee: string;
  completed: boolean;
  category: string;
  points: number;
  reminderTime?: string;
  shoppingList?: string[];
}

export interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  time: string;
  notified: boolean;
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  type: string;
  daysLeft: number;
}

export interface FamilyValue {
  id: string;
  title: string;
  description: string;
  icon: string;
  tradition: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  excerpt: string;
  likes: number;
  comments: number;
}

export interface Tradition {
  id: string;
  title: string;
  description: string;
  frequency: string;
  icon: string;
  participants: string[];
}

export interface MealOption {
  id: string;
  name: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  icon: string;
  cookingTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  votes: { [memberId: string]: boolean };
}

export interface MealVoting {
  id: string;
  title: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  date: string;
  options: MealOption[];
  status: 'active' | 'completed';
}

export interface ChildProfile {
  childId: string;
  childName: string;
  age: number;
  interests: string[];
  strengths: string[];
  goals: string[];
  personality: string;
}

export interface Activity {
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

export interface SkillRecommendation {
  id: string;
  skillName: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
  suggestedActivities: string[];
  progress: number;
}

export interface DevelopmentPlan {
  childId: string;
  childName: string;
  profile: ChildProfile;
  schedule: Activity[];
  skills: SkillRecommendation[];
  milestones: { title: string; completed: boolean; date: string }[];
}

export interface ChatMessage {
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

export interface FamilyAlbum {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadDate: string;
  type: 'image' | 'video';
}

export interface FamilyNeed {
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

export interface CalendarEvent {
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

export interface FamilyTreeMember {
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
