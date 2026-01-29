import { 
  HealthProfile, 
  HealthRecord, 
  Vaccination, 
  Medication, 
  VitalRecord,
  Doctor,
  InsurancePolicy,
  TelemedicineSession 
} from '@/types/health';

export const DEMO_HEALTH_PROFILES: HealthProfile[] = [
  {
    id: 'health-profile-1',
    userId: '1',
    userName: 'Анастасия',
    userAge: 35,
    bloodType: 'A',
    rhFactor: '+',
    allergies: ['Пыльца березы', 'Амоксициллин'],
    chronicDiseases: [],
    emergencyContacts: [
      {
        id: 'ec-1',
        name: 'Алексей (супруг)',
        relation: 'Супруг',
        phone: '+7 (999) 123-45-67',
        isPrimary: true
      }
    ],
    privacy: 'private',
    sharedWith: [],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z'
  },
  {
    id: 'health-profile-2',
    userId: '2',
    userName: 'Алексей',
    userAge: 37,
    bloodType: 'O',
    rhFactor: '+',
    allergies: [],
    chronicDiseases: ['Гипертония 1 степени'],
    emergencyContacts: [
      {
        id: 'ec-2',
        name: 'Анастасия (супруга)',
        relation: 'Супруга',
        phone: '+7 (999) 765-43-21',
        isPrimary: true
      }
    ],
    privacy: 'private',
    sharedWith: [],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z'
  },
  {
    id: 'health-profile-3',
    userId: '3',
    userName: 'Матвей',
    userAge: 10,
    bloodType: 'A',
    rhFactor: '+',
    allergies: ['Лактоза'],
    chronicDiseases: [],
    emergencyContacts: [
      {
        id: 'ec-3',
        name: 'Анастасия (мама)',
        relation: 'Мама',
        phone: '+7 (999) 765-43-21',
        isPrimary: true
      },
      {
        id: 'ec-4',
        name: 'Алексей (папа)',
        relation: 'Папа',
        phone: '+7 (999) 123-45-67',
        isPrimary: false
      }
    ],
    privacy: 'parents',
    sharedWith: ['1', '2'],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z'
  },
  {
    id: 'health-profile-4',
    userId: '4',
    userName: 'Даша',
    userAge: 7,
    bloodType: 'O',
    rhFactor: '+',
    allergies: [],
    chronicDiseases: [],
    emergencyContacts: [
      {
        id: 'ec-5',
        name: 'Анастасия (мама)',
        relation: 'Мама',
        phone: '+7 (999) 765-43-21',
        isPrimary: true
      }
    ],
    privacy: 'parents',
    sharedWith: ['1', '2'],
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2026-01-29T12:00:00Z'
  }
];

export const DEMO_HEALTH_RECORDS_NEW: HealthRecord[] = [
  {
    id: 'record-1',
    profileId: 'health-profile-2',
    type: 'visit',
    date: '2026-01-15',
    title: 'Плановая диспансеризация',
    description: 'Ежегодная диспансеризация, осмотр терапевта',
    doctor: 'Иванова Анна Сергеевна',
    doctorId: 'doctor-1',
    clinic: 'Городская поликлиника №5',
    diagnosis: 'Здоров',
    recommendations: 'Контроль артериального давления, умеренная физическая активность',
    attachments: [],
    createdAt: '2026-01-15T14:30:00Z'
  },
  {
    id: 'record-2',
    profileId: 'health-profile-2',
    type: 'analysis',
    date: '2026-01-10',
    title: 'Общий анализ крови',
    description: 'Плановый анализ крови перед диспансеризацией',
    clinic: 'Лаборатория "Гемотест"',
    attachments: [
      {
        id: 'attach-1',
        fileName: 'analiz_krovi_10_01_2026.pdf',
        fileUrl: 'https://cdn.poehali.dev/demo/health/blood_test.pdf',
        fileType: 'pdf',
        uploadedAt: '2026-01-10T16:00:00Z'
      }
    ],
    aiAnalysis: {
      status: 'completed',
      extractedText: 'Гемоглобин: 145 г/л (норма 130-160), Эритроциты: 4.8×10¹² (норма 4.0-5.5)',
      interpretation: 'Все показатели в пределах нормы. Гемоглобин в норме, признаков анемии нет.',
      warnings: [],
      processedAt: '2026-01-10T16:05:00Z'
    },
    createdAt: '2026-01-10T16:00:00Z'
  },
  {
    id: 'record-3',
    profileId: 'health-profile-3',
    type: 'visit',
    date: '2025-12-20',
    title: 'Осмотр педиатра',
    description: 'Плановый осмотр перед школой',
    doctor: 'Петрова Елена Викторовна',
    doctorId: 'doctor-3',
    clinic: 'Детская поликлиника №12',
    diagnosis: 'Здоров',
    recommendations: 'Продолжить занятия спортом, витамин D в зимний период',
    attachments: [],
    createdAt: '2025-12-20T11:00:00Z'
  },
  {
    id: 'record-4',
    profileId: 'health-profile-1',
    type: 'visit',
    date: '2025-11-25',
    title: 'Консультация аллерголога',
    description: 'Сезонная аллергия на пыльцу',
    doctor: 'Смирнов Игорь Павлович',
    doctorId: 'doctor-2',
    clinic: 'Аллергологический центр',
    diagnosis: 'Поллиноз (аллергия на пыльцу березы)',
    recommendations: 'Антигистаминные препараты в период цветения (апрель-май)',
    attachments: [],
    createdAt: '2025-11-25T15:30:00Z'
  }
];

export const DEMO_VACCINATIONS: Vaccination[] = [
  {
    id: 'vacc-1',
    profileId: 'health-profile-3',
    name: 'Корь-краснуха-паротит (ревакцинация)',
    date: '2025-09-15',
    nextDate: '2031-09-15',
    clinic: 'Детская поликлиника №12',
    doctor: 'Петрова Елена Викторовна',
    batchNumber: 'KKP-2025-0915',
    sideEffects: 'Не выявлено',
    attachments: []
  },
  {
    id: 'vacc-2',
    profileId: 'health-profile-4',
    name: 'АКДС (коклюш-дифтерия-столбняк)',
    date: '2024-03-10',
    nextDate: '2026-03-10',
    clinic: 'Детская поликлиника №12',
    doctor: 'Петрова Елена Викторовна',
    batchNumber: 'AKDS-2024-0310',
    attachments: []
  },
  {
    id: 'vacc-3',
    profileId: 'health-profile-1',
    name: 'Грипп (сезонная вакцинация)',
    date: '2025-10-01',
    nextDate: '2026-10-01',
    clinic: 'Городская поликлиника №5',
    batchNumber: 'FLU-2025-1001',
    attachments: []
  }
];

export const DEMO_MEDICATIONS_NEW: Medication[] = [
  {
    id: 'med-1',
    profileId: 'health-profile-2',
    name: 'Лизиноприл',
    dosage: '10 мг',
    frequency: 'Один раз в день утром',
    startDate: '2025-06-01',
    doctor: 'Иванова Анна Сергеевна',
    purpose: 'Контроль артериального давления',
    reminders: [
      {
        id: 'rem-1',
        time: '08:00',
        enabled: true
      }
    ],
    active: true
  },
  {
    id: 'med-2',
    profileId: 'health-profile-1',
    name: 'Цетиризин',
    dosage: '10 мг',
    frequency: 'По необходимости при аллергии',
    startDate: '2025-04-01',
    endDate: '2025-06-01',
    doctor: 'Смирнов Игорь Павлович',
    purpose: 'Сезонная аллергия',
    reminders: [],
    active: false
  },
  {
    id: 'med-3',
    profileId: 'health-profile-3',
    name: 'Витамин D3',
    dosage: '1000 МЕ',
    frequency: 'Один раз в день',
    startDate: '2025-11-01',
    endDate: '2026-03-31',
    doctor: 'Петрова Елена Викторовна',
    purpose: 'Профилактика дефицита витамина D',
    reminders: [
      {
        id: 'rem-2',
        time: '20:00',
        enabled: true
      }
    ],
    active: true
  }
];

export const DEMO_VITAL_RECORDS: VitalRecord[] = [
  { id: 'vital-1', profileId: 'health-profile-2', type: 'pressure', value: 135, unit: 'мм рт.ст.', date: '2026-01-29', time: '08:00', notes: 'Систолическое' },
  { id: 'vital-2', profileId: 'health-profile-2', type: 'pressure', value: 85, unit: 'мм рт.ст.', date: '2026-01-29', time: '08:00', notes: 'Диастолическое' },
  { id: 'vital-3', profileId: 'health-profile-2', type: 'pressure', value: 130, unit: 'мм рт.ст.', date: '2026-01-28', time: '08:00' },
  { id: 'vital-4', profileId: 'health-profile-2', type: 'pressure', value: 82, unit: 'мм рт.ст.', date: '2026-01-28', time: '08:00' },
  { id: 'vital-5', profileId: 'health-profile-2', type: 'pressure', value: 132, unit: 'мм рт.ст.', date: '2026-01-27', time: '08:00' },
  { id: 'vital-6', profileId: 'health-profile-2', type: 'pressure', value: 84, unit: 'мм рт.ст.', date: '2026-01-27', time: '08:00' },
  { id: 'vital-7', profileId: 'health-profile-2', type: 'pulse', value: 72, unit: 'уд/мин', date: '2026-01-29', time: '08:00' },
  { id: 'vital-8', profileId: 'health-profile-2', type: 'pulse', value: 70, unit: 'уд/мин', date: '2026-01-28', time: '08:00' },
  { id: 'vital-9', profileId: 'health-profile-1', type: 'weight', value: 62, unit: 'кг', date: '2026-01-29', time: '07:00' },
  { id: 'vital-10', profileId: 'health-profile-1', type: 'weight', value: 62.5, unit: 'кг', date: '2026-01-22', time: '07:00' },
  { id: 'vital-11', profileId: 'health-profile-1', type: 'weight', value: 63, unit: 'кг', date: '2026-01-15', time: '07:00' },
  { id: 'vital-12', profileId: 'health-profile-3', type: 'height', value: 140, unit: 'см', date: '2025-12-20', time: '10:00' },
  { id: 'vital-13', profileId: 'health-profile-3', type: 'weight', value: 35, unit: 'кг', date: '2025-12-20', time: '10:00' },
  { id: 'vital-14', profileId: 'health-profile-3', type: 'height', value: 138, unit: 'см', date: '2025-09-01', time: '10:00' },
  { id: 'vital-15', profileId: 'health-profile-3', type: 'weight', value: 33, unit: 'кг', date: '2025-09-01', time: '10:00' }
];

export const DEMO_DOCTORS: Doctor[] = [
  {
    id: 'doctor-1',
    name: 'Иванова Анна Сергеевна',
    specialization: 'Терапевт',
    clinic: 'Городская поликлиника №5',
    phone: '+7 (495) 123-45-67',
    email: 'ivanova@clinic5.ru',
    address: 'ул. Ленина, д. 15',
    rating: 4.8,
    notes: 'Внимательный врач, всегда назначает только необходимые обследования',
    isFavorite: true,
    lastVisit: '2026-01-15'
  },
  {
    id: 'doctor-2',
    name: 'Смирнов Игорь Павлович',
    specialization: 'Аллерголог-иммунолог',
    clinic: 'Аллергологический центр',
    phone: '+7 (495) 234-56-78',
    email: 'smirnov@allergo-center.ru',
    address: 'пр. Мира, д. 25',
    rating: 4.9,
    notes: 'Лучший аллерголог, который мне встречался',
    isFavorite: true,
    lastVisit: '2025-11-25'
  },
  {
    id: 'doctor-3',
    name: 'Петрова Елена Викторовна',
    specialization: 'Педиатр',
    clinic: 'Детская поликлиника №12',
    phone: '+7 (495) 345-67-89',
    address: 'ул. Садовая, д. 8',
    rating: 4.7,
    notes: 'Наш педиатр с рождения Матвея',
    isFavorite: true,
    lastVisit: '2025-12-20'
  },
  {
    id: 'doctor-4',
    name: 'Ковалев Дмитрий Александрович',
    specialization: 'Кардиолог',
    clinic: 'Кардиологический центр',
    phone: '+7 (495) 456-78-90',
    email: 'kovalev@cardio.ru',
    address: 'ул. Чехова, д. 42',
    rating: 4.6,
    isFavorite: false
  }
];

export const DEMO_INSURANCE_POLICIES: InsurancePolicy[] = [
  {
    id: 'ins-1',
    profileId: 'health-profile-2',
    type: 'oms',
    policyNumber: '1234567890123456',
    provider: 'СОГАЗ-Мед',
    startDate: '2020-01-01',
    endDate: '2099-12-31',
    coverage: ['Базовое медицинское обслуживание', 'Экстренная помощь', 'Диспансеризация'],
    attachments: [],
    remindBeforeDays: 30,
    status: 'active'
  },
  {
    id: 'ins-2',
    profileId: 'health-profile-2',
    type: 'dms',
    policyNumber: 'DMS-2025-789456',
    provider: 'АльфаСтрахование',
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    coverage: ['Консультации специалистов', 'Стоматология', 'Диагностика', 'Стационарное лечение'],
    premium: 45000,
    attachments: [],
    remindBeforeDays: 60,
    status: 'active'
  },
  {
    id: 'ins-3',
    profileId: 'health-profile-1',
    type: 'oms',
    policyNumber: '9876543210987654',
    provider: 'РЕСО-Мед',
    startDate: '2019-01-01',
    endDate: '2099-12-31',
    coverage: ['Базовое медицинское обслуживание', 'Экстренная помощь'],
    attachments: [],
    remindBeforeDays: 30,
    status: 'active'
  },
  {
    id: 'ins-4',
    profileId: 'health-profile-3',
    type: 'oms',
    policyNumber: '5555666677778888',
    provider: 'СОГАЗ-Мед',
    startDate: '2016-03-12',
    endDate: '2099-12-31',
    coverage: ['Базовое медицинское обслуживание детям'],
    attachments: [],
    remindBeforeDays: 30,
    status: 'active'
  }
];

export const DEMO_TELEMEDICINE_SESSIONS: TelemedicineSession[] = [
  {
    id: 'tele-1',
    profileId: 'health-profile-2',
    doctorId: 'doctor-1',
    doctorName: 'Иванова Анна Сергеевна',
    specialization: 'Терапевт',
    scheduledAt: '2026-02-05T10:00:00Z',
    duration: 30,
    status: 'scheduled',
    notes: 'Консультация по результатам анализов'
  },
  {
    id: 'tele-2',
    profileId: 'health-profile-1',
    doctorId: 'doctor-2',
    doctorName: 'Смирнов Игорь Павлович',
    specialization: 'Аллерголог-иммунолог',
    scheduledAt: '2025-12-01T14:00:00Z',
    duration: 30,
    status: 'completed',
    notes: 'Консультация перед сезоном аллергии',
    prescription: 'Цетиризин 10мг при необходимости'
  }
];
