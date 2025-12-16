export interface FamilyMember {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  relationship?: string;
  avatar: string;
  avatar_type: string;
  photo_url?: string;
  photoUrl?: string;
  avatarType?: string;
  points: number;
  level: number;
  workload: number;
  age?: number;
  birth_date?: string;
  birth_time?: string;
  birthDate?: string;
  birthTime?: string;
  created_at: string;
  updated_at: string;
  dreams?: Dream[];
  piggyBank?: number;
  achievements?: string[];
  responsibilities?: string[];
  health?: ChildHealth;
  purchasePlans?: PurchasePlan[];
  gifts?: Gift[];
  development?: Development[];
  school?: School;
  diary?: DiaryEntry[];
  profile?: MemberProfile;
}

export interface MemberProfile {
  height?: number;
  weight?: number;
  lifestyle?: string;
  habits?: string[];
  goodHabits?: string[];
  badHabits?: string[];
  hobbies?: string[];
  triggers?: string[];
  loveLanguages?: LoveLanguage[];
  boundaries?: string[];
  energyType?: 'жаворонок' | 'сова' | 'голубь';
  personalityType?: 'интроверт' | 'экстраверт' | 'амбиверт';
  stressRelief?: string[];
  favoriteThings?: string[];
  dislikedThings?: string[];
  communicationStyle?: string;
  additionalInfo?: string;
}

export type LoveLanguage = 
  | 'words_of_affirmation'
  | 'quality_time' 
  | 'receiving_gifts'
  | 'acts_of_service'
  | 'physical_touch';

export interface Dream {
  id: string;
  title: string;
  description?: string;
  created_date: string;
  achieved?: boolean;
  achieved_date?: string;
}

export interface ChildHealth {
  vaccinations: Vaccination[];
  prescriptions: Prescription[];
  analyses: Analysis[];
  doctorVisits: DoctorVisit[];
  medications: Medication[];
}

export interface Vaccination {
  id: string;
  date: string;
  vaccine: string;
  notes?: string;
}

export interface Prescription {
  id: string;
  date: string;
  photoUrl: string;
  notes?: string;
}

export interface Analysis {
  id: string;
  date: string;
  type: string;
  photoUrl: string;
  notes?: string;
}

export interface DoctorVisit {
  id: string;
  date: string;
  doctor: string;
  specialty: string;
  status: 'planned' | 'completed';
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  frequency: string;
  dosage: string;
  instructions: string;
  schedule: MedicationSchedule[];
}

export interface MedicationSchedule {
  date: string;
  time: string;
  taken: boolean;
}

export interface PurchasePlan {
  id: string;
  season: 'winter' | 'spring' | 'summer' | 'autumn';
  category: string;
  items: PurchaseItem[];
}

export interface PurchaseItem {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  estimated_cost?: number;
  purchased: boolean;
  purchase_date?: string;
}

export interface Gift {
  id: string;
  event: string;
  date: string;
  gift: string;
  given: boolean;
  notes?: string;
}

export interface Development {
  id: string;
  area: 'sport' | 'education' | 'hobby' | 'social' | 'creative';
  current_level: number;
  target_level: number;
  activities: Activity[];
  tests: Test[];
}

export interface Activity {
  id: string;
  type: string;
  name: string;
  schedule: string;
  cost?: number;
  status: 'active' | 'planned' | 'completed';
}

export interface Test {
  id: string;
  name: string;
  description: string;
  assigned_by?: string;
  assigned_date?: string;
  completed_date?: string;
  score?: number;
  reward_points?: number;
  status: 'assigned' | 'completed' | 'available';
}

export interface School {
  id: string;
  mesh_integration: boolean;
  current_grade: string;
  grades: Grade[];
}

export interface Grade {
  subject: string;
  grade: number;
  date: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title?: string;
  content: string;
  mood?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
}

export type ThemeType = 'middle' | 'mono' | 'dark';

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