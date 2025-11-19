export interface HealthRecord {
  id: string;
  memberId: string;
  memberName: string;
  type: 'checkup' | 'illness' | 'vaccination' | 'appointment' | 'medication';
  title: string;
  description: string;
  date: string;
  doctor?: string;
  hospital?: string;
  nextVisit?: string;
}

export interface Medication {
  id: string;
  memberId: string;
  memberName: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export const DEMO_HEALTH_RECORDS: HealthRecord[] = [
  {
    id: 'health-1',
    memberId: 'grandma',
    memberName: 'Мария',
    type: 'checkup',
    title: 'Профилактический осмотр',
    description: 'Общий осмотр, анализы в норме. Рекомендовано продолжить прием лекарств',
    date: '2025-11-01',
    doctor: 'Терапевт Петрова А.С.',
    hospital: 'Городская поликлиника №5',
    nextVisit: '2026-02-01'
  },
  {
    id: 'health-2',
    memberId: 'grandpa',
    memberName: 'Николай',
    type: 'checkup',
    title: 'Прием у кардиолога',
    description: 'ЭКГ в норме, давление стабильное. Продолжить прием препаратов',
    date: '2025-10-25',
    doctor: 'Кардиолог Сидоров В.П.',
    hospital: 'Кардиологический центр',
    nextVisit: '2025-12-10'
  },
  {
    id: 'health-3',
    memberId: 'son',
    memberName: 'Максим',
    type: 'vaccination',
    title: 'Прививка от гриппа',
    description: 'Вакцинация прошла успешно, реакции нет',
    date: '2025-10-15',
    doctor: 'Педиатр Иванова М.А.',
    hospital: 'Детская поликлиника №12'
  },
  {
    id: 'health-4',
    memberId: 'daughter',
    memberName: 'София',
    type: 'checkup',
    title: 'Стоматологический осмотр',
    description: 'Профилактический осмотр, кариеса нет. Рекомендована профессиональная чистка',
    date: '2025-11-10',
    doctor: 'Стоматолог Смирнова О.И.',
    hospital: 'Стоматологическая клиника "Улыбка"',
    nextVisit: '2026-05-10'
  },
  {
    id: 'health-5',
    memberId: 'mom',
    memberName: 'Елена',
    type: 'checkup',
    title: 'Ежегодный медосмотр',
    description: 'Все показатели в норме, рекомендовано больше физической активности',
    date: '2025-09-20',
    doctor: 'Терапевт Козлова Е.А.',
    hospital: 'Медицинский центр "Здоровье"',
    nextVisit: '2026-09-20'
  },
  {
    id: 'health-6',
    memberId: 'son',
    memberName: 'Максим',
    type: 'appointment',
    title: 'Прием у стоматолога',
    description: 'Назначен профилактический осмотр',
    date: '2025-12-01',
    doctor: 'Детский стоматолог Волкова Н.С.',
    hospital: 'Детская стоматология',
  },
  {
    id: 'health-7',
    memberId: 'dad',
    memberName: 'Александр',
    type: 'checkup',
    title: 'Профосмотр на работе',
    description: 'Обязательный ежегодный медосмотр. Все показатели в норме',
    date: '2025-11-05',
    doctor: 'Терапевт Николаев А.В.',
    hospital: 'Медкомиссия предприятия',
    nextVisit: '2026-11-05'
  }
];

export const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    memberId: 'grandma',
    memberName: 'Мария',
    name: 'Энап',
    dosage: '10 мг',
    frequency: 'Ежедневно утром',
    startDate: '2025-01-15',
    notes: 'Для контроля артериального давления'
  },
  {
    id: 'med-2',
    memberId: 'grandma',
    memberName: 'Мария',
    name: 'Метформин',
    dosage: '500 мг',
    frequency: 'Дважды в день',
    startDate: '2024-06-10',
    notes: 'При диабете 2 типа, принимать во время еды'
  },
  {
    id: 'med-3',
    memberId: 'grandpa',
    memberName: 'Николай',
    name: 'Кардиомагнил',
    dosage: '75 мг',
    frequency: 'Ежедневно вечером',
    startDate: '2024-03-20',
    notes: 'Для профилактики тромбоза'
  },
  {
    id: 'med-4',
    memberId: 'grandpa',
    memberName: 'Николай',
    name: 'Аторвастатин',
    dosage: '20 мг',
    frequency: 'Ежедневно вечером',
    startDate: '2024-08-10',
    notes: 'Для снижения холестерина'
  },
  {
    id: 'med-5',
    memberId: 'daughter',
    memberName: 'София',
    name: 'Витамин D3',
    dosage: '1000 МЕ',
    frequency: 'Ежедневно',
    startDate: '2025-09-01',
    endDate: '2026-03-31',
    notes: 'Профилактика дефицита витамина D в осенне-зимний период'
  }
];
