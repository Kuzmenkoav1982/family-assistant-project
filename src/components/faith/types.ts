export interface Holiday {
  id?: number;
  title: string;
  description: string;
  event_date: string;
  event_type: string;
  is_fasting: boolean;
  fasting_rules?: string;
  is_custom?: boolean;
}

export interface FastingPeriod {
  title: string;
  start_date: string;
  end_date: string;
  rules: string;
  is_active?: boolean;
}

export interface Prayer {
  id?: number;
  title: string;
  text: string;
  category: string;
  time_of_day?: string;
}

export interface NameDay {
  id?: number;
  name: string;
  saint_name: string;
  day: number;
  month: number;
  description?: string;
}

export interface BasicArticle {
  title: string;
  text: string;
}

export interface SacredBook {
  title: string;
  author: string;
  description: string;
  category: string;
}

export interface TempleData {
  name: string;
  address: string;
  schedule: string;
  contacts: string;
}

export type SaintEntry = {
  name: string;
  title: string;
  period: string;
  description: string;
  source: string;
  sourceUrl: string;
  image: string;
};

export type SacredTextEntry = {
  category: string;
  title: string;
  excerpt: string;
  fullText: string;
  source: string;
  sourceUrl: string;
};

export type IconEntry = {
  name: string;
  description: string;
  feast: string;
  prayer: string;
  source: string;
  sourceUrl: string;
  image: string;
};
