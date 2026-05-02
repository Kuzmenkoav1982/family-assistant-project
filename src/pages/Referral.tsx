import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import ReferralWidget from '@/components/dashboard/ReferralWidget';

export default function Referral() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50/30 to-amber-50/20">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-3 pb-32">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-sm flex items-center justify-center hover:scale-105 transition-all"
            aria-label="Назад"
          >
            <Icon name="ChevronLeft" size={20} className="text-slate-600" />
          </button>
          <h1 className="text-base font-bold text-slate-700">Реферальная программа</h1>
          <div className="w-10" />
        </div>

        <ReferralWidget userId={String(userId)} />
      </div>
    </div>
  );
}
