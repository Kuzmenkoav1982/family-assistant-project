export interface MoodStatus {
  emoji: string;
  label: string;
  message?: string;
  timestamp: string;
}

export interface Dream {
  id: string;
  title: string;
  description?: string;
  targetAmount?: number;
  savedAmount?: number;
  icon?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  workload: number;
  avatar: string;
  avatarType?: 'emoji' | 'photo';
  photoUrl?: string;
  points: number;
  level: number;
  achievements: string[];
  age?: number;
  foodPreferences?: {
    favorites: string[];
    dislikes: string[];
  };
  responsibilities?: string[];
  moodStatus?: MoodStatus;
  dreams?: Dream[];
  piggyBank?: number;
  permissions?: {
    tasks: boolean;
    calendar: boolean;
    traditions: boolean;
    blog: boolean;
    meals: boolean;
    education: boolean;
    tree: boolean;
    chat: boolean;
    album: boolean;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  assignee_id?: string;
  completed: boolean;
  category: string;
  points: number;
  deadline?: string;
  reminderTime?: string;
  shoppingList?: string[];
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    daysOfWeek?: number[];
    endDate?: string;
  };
  nextOccurrence?: string;
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
  tradition?: string;
  practices?: string[];
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
  id?: string;
  childId: string;
  childName: string;
  name?: string;
  age: number;
  avatar?: string;
  grade?: string;
  interests: string[];
  strengths: string[];
  goals: string[];
  personality: string;
  achievements?: string[];
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

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: 'logic' | 'math' | 'language' | 'memory' | 'attention' | 'creativity';
  difficulty: 'easy' | 'medium' | 'hard';
  ageRange: string;
  points: number;
}

export interface TestResult {
  id: string;
  childId: string;
  testType: string;
  date: string;
  scores: {
    logic: number;
    math: number;
    language: number;
    memory: number;
    attention: number;
    creativity: number;
  };
  totalScore: number;
  maxScore: number;
  timeSpent: number;
  answers: { questionId: string; userAnswer: number; correct: boolean }[];
}

export interface LearningMaterial {
  id: string;
  title: string;
  description: string;
  category: 'logic' | 'math' | 'language' | 'memory' | 'attention' | 'creativity';
  ageRange: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'video' | 'article' | 'exercise' | 'game';
  url?: string;
  content?: string;
  duration?: string;
  icon: string;
}

export interface AIRecommendationForChild {
  id: string;
  childId: string;
  category: string;
  weakArea: string;
  currentLevel: number;
  targetLevel: number;
  recommendations: string[];
  suggestedMaterials: string[];
  estimatedTimeToImprove: string;
  createdAt: string;
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

export interface ShoppingItem {
  id: string;
  name: string;
  category: 'products' | 'household' | 'clothes' | 'other';
  quantity?: string;
  priority: 'normal' | 'urgent';
  bought: boolean;
  addedBy: string;
  addedByName: string;
  addedAt: string;
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
  reminderEnabled?: boolean;
  reminderDays?: number;
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

export interface HealthCheckup {
  id: string;
  name: string;
  description: string;
  frequency: string;
  importance: 'critical' | 'high' | 'medium';
  nextDate?: string;
}

export interface NutritionRecommendation {
  category: string;
  items: string[];
  importance: 'high' | 'medium' | 'low';
  reason: string;
}

export interface DevelopmentMilestone {
  category: string;
  skills: string[];
  ageRange: string;
  achieved?: boolean;
}

export interface AIRecommendation {
  memberId: string;
  memberName: string;
  age: number;
  ageGroup: 'infant' | 'toddler' | 'preschool' | 'school' | 'teen' | 'adult' | 'senior';
  healthCheckups?: HealthCheckup[];
  vitamins?: {
    name: string;
    dosage: string;
    reason: string;
    season?: string;
  }[];
  nutrition?: NutritionRecommendation[];
  developmentMilestones?: DevelopmentMilestone[];
  physicalActivity?: {
    type: string;
    duration: string;
    frequency: string;
  }[];
  cognitiveSkills?: string[];
  socialSkills?: string[];
  warnings?: string[];
  tips?: string[];
}

export interface Feedback {
  id: string;
  type: 'review' | 'support' | 'suggestion';
  userName: string;
  userEmail?: string;
  title: string;
  description: string;
  rating?: number;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
  category?: string;
}

export interface PaymentInfo {
  userId: string;
  userName: string;
  subscriptionType: 'free' | 'annual';
  price: number;
  expiryDate?: string;
  isPaid: boolean;
  paymentDate?: string;
}

export interface GoalCheckpoint {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedDate?: string;
}

export interface GoalAISuggestion {
  id: string;
  type: 'tip' | 'warning' | 'recommendation';
  title: string;
  content: string;
  createdAt: string;
}

export interface FamilyGoal {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'health' | 'education' | 'travel' | 'home' | 'relationship' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'in_progress' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  targetDate: string;
  progress: number;
  assignedMembers: string[];
  checkpoints: GoalCheckpoint[];
  aiSuggestions: GoalAISuggestion[];
  budget?: number;
  currentSpending?: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  completedDate?: string;
  tags?: string[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

export interface Complaint {
  id: string;
  complainantId: string;
  complainantName: string;
  accusedId: string;
  accusedName: string;
  situation: string;
  feelings: string;
  consequences?: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'resolved';
  aiAnalysis?: {
    summary: string;
    recommendationsForComplainant: string[];
    messageForAccused: string;
    peaceSteps: string[];
    severity: 'low' | 'medium' | 'high';
  };
  resolution?: {
    resolvedAt: string;
    outcome: string;
    feedback?: string;
  };
}

export type ThemeType = 'young' | 'middle' | 'senior' | 'apple' | 'mono' | '1';

export interface ThemeConfig {
  name: string;
  description: string;
  ageRange: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontSize: {
    base: string;
    heading: string;
  };
  spacing: string;
  borderRadius: string;
}