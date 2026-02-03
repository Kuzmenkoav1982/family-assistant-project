export type HealthPrivacy = 'private' | 'parents' | 'family' | 'selected';

export type RecordType = 
  | 'visit'          // визит к врачу
  | 'analysis'       // анализы
  | 'vaccination'    // прививка
  | 'symptom'        // симптом
  | 'prescription'   // рецепт
  | 'insurance';     // страховка

export type VitalType = 'weight' | 'height' | 'pressure' | 'pulse' | 'temperature' | 'glucose';

export interface HealthProfile {
  id: string;
  userId: string;
  userName: string;
  userAge: number;
  photoUrl?: string;
  bloodType?: string;
  rhFactor?: '+' | '-';
  allergies: string[];
  chronicDiseases: string[];
  emergencyContacts: EmergencyContact[];
  privacy: HealthPrivacy;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface HealthRecord {
  id: string;
  profileId: string;
  type: RecordType;
  date: string;
  title: string;
  description: string;
  doctor?: string;
  doctorId?: string;
  clinic?: string;
  diagnosis?: string;
  recommendations?: string;
  attachments: HealthAttachment[];
  aiAnalysis?: AIAnalysisResult;
  createdAt: string;
}

export interface HealthAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'document';
  uploadedAt: string;
}

export interface AIAnalysisResult {
  status: 'processing' | 'completed' | 'error';
  extractedText?: string;
  interpretation?: string;
  warnings?: string[];
  processedAt?: string;
}

export interface Vaccination {
  id: string;
  profileId: string;
  name: string;
  date: string;
  nextDate?: string;
  clinic: string;
  doctor?: string;
  batchNumber?: string;
  sideEffects?: string;
  attachments: HealthAttachment[];
}

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  doctor?: string;
  purpose?: string;
  reminders: MedicationReminder[];
  active: boolean;
}

export interface MedicationReminder {
  id: string;
  time: string;
  enabled: boolean;
  notificationSent?: boolean;
}

export interface VitalRecord {
  id: string;
  profileId: string;
  type: VitalType;
  value: number;
  unit: string;
  date: string;
  time: string;
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  clinic: string;
  phone: string;
  email?: string;
  address?: string;
  rating?: number;
  notes?: string;
  isFavorite: boolean;
  lastVisit?: string;
}

export interface InsurancePolicy {
  id: string;
  profileId: string;
  type: 'oms' | 'dms' | 'travel' | 'life';
  policyNumber: string;
  provider: string;
  startDate: string;
  endDate: string;
  coverage: string[];
  premium?: number;
  attachments: HealthAttachment[];
  remindBeforeDays: number;
  status: 'active' | 'expiring' | 'expired';
}

export interface TelemedicineSession {
  id: string;
  profileId: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  roomUrl?: string;
  notes?: string;
  recordingUrl?: string;
  prescription?: string;
}

export interface HealthStats {
  profileId: string;
  totalVisits: number;
  lastVisit?: string;
  activeМedications: number;
  upcomingVaccinations: number;
  vitalsTrend: {
    type: VitalType;
    trend: 'up' | 'down' | 'stable';
    change: number;
  }[];
}