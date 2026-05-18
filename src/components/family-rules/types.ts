export interface FamilyRule {
  id: string;
  title: string;
  description: string;
  author: string;
  createdDate: string;
  status: 'approved' | 'voting' | 'rejected';
  votes?: {
    for: string[];
    against: string[];
    required: number;
  };
  category: string;
}

export const RULE_CATEGORIES = ['Общие', 'Традиции', 'Технологии', 'Финансы', 'Распорядок', 'Учёба', 'Домашние дела'];

export const FAMILY_MEMBERS = [
  { id: '1', name: 'Пользователь', role: 'Владелец', canApproveAlone: true }
];
