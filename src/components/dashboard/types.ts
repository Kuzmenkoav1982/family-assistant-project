export interface Step {
  id: number;
  section_id: number;
  slug: string;
  title: string;
  position: number;
  completed: boolean;
}

export interface Section {
  id: number;
  hub_id: number;
  slug: string;
  title: string;
  icon: string;
  route: string;
  position: number;
  steps: Step[];
  progress: number;
  completed_steps: number;
  total_steps: number;
  mode?: 'auto' | 'manual';
  auto_supported?: boolean;
  auto_table?: string;
  auto_count?: number;
  auto_target?: number;
}

export interface Hub {
  id: number;
  slug: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  position: number;
  sections: Section[];
  progress: number;
  total_sections: number;
  completed_sections: number;
}

export interface DashboardStats {
  overall_progress: number;
  active_hubs: number;
  total_hubs: number;
  completed_sections: number;
  total_sections: number;
}

export interface DashboardData {
  hubs: Hub[];
  stats: DashboardStats;
}