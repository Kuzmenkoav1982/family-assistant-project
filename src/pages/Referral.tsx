import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/lib/auth-context';
import ReferralWidget from '@/components/dashboard/ReferralWidget';
import { SectionHelp } from '@/components/children/SectionHelp';

export default function Referral() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-3 pb-32">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow flex items-center justify-center hover:scale-105 transition-all"
            aria-label="Назад"
          >
            <Icon name="ChevronLeft" size={20} className="text-slate-700" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent">
            Реферальная программа
          </h1>
          <div className="w-11" />
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-5 text-white shadow-lg mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💎</span>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-90">Приглашай друзей</div>
              <div className="text-lg font-extrabold leading-tight">Зарабатывай на семейный кошелёк</div>
            </div>
          </div>
          <p className="mt-3 text-sm opacity-95">
            Делись кодом или ссылкой с друзьями. За каждого, кто зарегистрируется и активно начнёт пользоваться приложением, ты получаешь бонус.
          </p>
        </div>

        <div className="mb-4">
          <SectionHelp
            emoji="💎"
            title="Как работает реферальная программа"
            description="Приглашай знакомых — получай реальные деньги на семейный кошелёк за каждого друга. Чем активнее друг пользуется — тем больше ты зарабатываешь."
            tips={[
              "Скопируй свой персональный код или ссылку и отправь другу любым удобным способом",
              "Друг регистрируется по твоей ссылке — ты получаешь первое вознаграждение, а он — приветственный бонус",
              "Когда семья друга активирует аккаунт (наберёт минимум членов и прогресс) — ты получаешь второе, более крупное вознаграждение",
              "Все приглашения и статусы видно в списке ниже — следи, кто зарегистрировался, кто активировался",
              "Деньги начисляются на семейный кошелёк автоматически — без заявок и ожидания",
            ]}
          />
        </div>

        <ReferralWidget userId={String(userId)} />
      </div>
    </div>
  );
}