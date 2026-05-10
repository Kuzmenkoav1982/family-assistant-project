export interface PrizeForm {
  place_from: number;
  place_to: number;
  amount_rub: number;
  prize_type: string;
  description: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  banner_text?: string | null;
  period_type?: string;
  starts_at: string;
  ends_at: string;
  status: string;
  weight_progress?: number;
  weight_activity?: number;
  weight_engagement?: number;
  weight_referrals?: number;
  min_members?: number;
  min_progress?: number;
  is_payout_done?: boolean;
  prizes?: PrizeForm[];
}

export interface CampaignFormState {
  id?: string;
  slug: string;
  title: string;
  description: string;
  banner_text: string;
  period_type: string;
  starts_at: string;
  ends_at: string;
  status: string;
  weight_progress: number;
  weight_activity: number;
  weight_engagement: number;
  weight_referrals: number;
  min_members: number;
  min_progress: number;
  prizes: PrizeForm[];
}

export const API = 'https://functions.poehali.dev/e6ccd99c-a165-48c7-83cf-946941114931';

export const initialForm: CampaignFormState = {
  slug: '',
  title: '',
  description: '',
  banner_text: '',
  period_type: 'monthly',
  starts_at: '',
  ends_at: '',
  status: 'draft',
  weight_progress: 1.0,
  weight_activity: 0.5,
  weight_engagement: 0.3,
  weight_referrals: 0.2,
  min_members: 2,
  min_progress: 0,
  prizes: [],
};

export function toLocalInput(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export function statusBadge(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-700',
    active: 'bg-green-100 text-green-700',
    finished: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-700';
}
