export type SphereKey =
  | 'intellect'
  | 'emotions'
  | 'body'
  | 'creativity'
  | 'social'
  | 'finance'
  | 'values'
  | 'life_skills';

export const SPHERE_ORDER: SphereKey[] = [
  'intellect',
  'emotions',
  'body',
  'creativity',
  'social',
  'finance',
  'values',
  'life_skills',
];

export interface PortfolioMember {
  id: string;
  name: string;
  role: string;
  age: number | null;
  photo_url: string | null;
  avatar: string | null;
  birth_date: string | null;
}

export interface SphereDetail {
  score: number;
  confidence: number;
  metric_count: number;
  sources: string[];
}

export interface StrengthGrowthItem {
  sphere: SphereKey;
  score: number;
  label: string;
  icon: string;
}

export interface NextAction {
  sphere: SphereKey;
  sphere_label: string;
  icon: string;
  action: string;
  source: 'plan' | 'rule_low_data' | 'rule_low_score';
}

export interface Achievement {
  id: string;
  badge_key: string;
  title: string;
  description: string | null;
  icon: string;
  sphere_key: SphereKey | null;
  category: string;
  earned_at: string;
}

export interface DevelopmentPlan {
  id: string;
  sphere_key: SphereKey;
  title: string;
  description: string | null;
  milestone: string | null;
  target_date: string | null;
  status: string;
  progress: number;
  next_step: string | null;
}

export interface PortfolioMetric {
  sphere_key: SphereKey;
  metric_key: string;
  metric_value: number | null;
  metric_unit: string | null;
  source_type: string;
  source_id: string | null;
  measured_at: string;
  raw_value: string | null;
}

export interface Insight {
  sphere: SphereKey | null;
  sphere_label: string;
  severity: 'success' | 'info' | 'warning';
  rule_key: string;
  title: string;
  text: string;
  suggestion: string | null;
}

export interface PortfolioData {
  member: PortfolioMember;
  age_group: string;
  scores: Record<SphereKey, number>;
  confidence: Record<SphereKey, number>;
  deltas: Record<SphereKey, number>;
  previous_scores: Record<SphereKey, number> | null;
  previous_snapshot_date: string | null;
  strengths: StrengthGrowthItem[];
  growth_zones: StrengthGrowthItem[];
  next_actions: NextAction[];
  completeness: number;
  achievements: Achievement[];
  plans: DevelopmentPlan[];
  recent_metrics: PortfolioMetric[];
  sphere_labels_adult: Record<SphereKey, string>;
  sphere_labels_child: Record<SphereKey, string>;
  sphere_icons: Record<SphereKey, string>;
  last_aggregated_at: string;
  needs_refresh?: boolean;
}

export interface FamilyPortfolioListItem {
  id: string;
  name: string;
  role: string;
  age: number | null;
  photo_url: string | null;
  avatar: string | null;
  birth_date: string | null;
  has_portfolio: boolean;
  scores: Partial<Record<SphereKey, number>>;
  confidence: Partial<Record<SphereKey, number>>;
  completeness: number;
  strengths: StrengthGrowthItem[];
  growth_zones: StrengthGrowthItem[];
  last_aggregated_at: string | null;
}