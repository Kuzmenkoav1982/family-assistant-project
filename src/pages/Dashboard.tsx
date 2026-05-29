import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import DashboardWheel from '@/components/dashboard/DashboardWheel';
import HubDetailsCard from '@/components/dashboard/HubDetailsCard';
import AnimatedBackground from '@/components/dashboard/AnimatedBackground';
import DomovoyTip from '@/components/dashboard/DomovoyTip';
import Confetti from '@/components/dashboard/Confetti';
import FamilyRatingWidget from '@/components/dashboard/FamilyRatingWidget';
import RatingCampaignWidget from '@/components/dashboard/RatingCampaignWidget';
import PortfolioDashboardWidget from '@/components/dashboard/PortfolioDashboardWidget';
import { SectionHelp } from '@/components/children/SectionHelp';
import { useDashboard } from '@/components/dashboard/useDashboard';
import SectionPageFrame from '@/components/ui/SectionPageFrame';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    userId,
    data,
    loading,
    error,
    loadDashboard,
    activeHubId,
    setActiveHubId,
    confettiTrigger,
    activeHub,
    toggleStep,
    setSectionMode,
    setBulkMode,
  } = useDashboard();

  if (loading) {
    return (
      <SectionPageFrame
        title="Дашборд"
        backPath="/"
        variant="light"
        width="wide"
        hideTitle
        backgroundClass="bg-gradient-to-br from-slate-50 via-white to-slate-100"
      >
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Загружаем дашборд...</p>
          </div>
        </div>
      </SectionPageFrame>
    );
  }

  if (error || !data) {
    return (
      <SectionPageFrame
        title="Дашборд"
        backPath="/"
        variant="light"
        width="wide"
        hideTitle
        backgroundClass="bg-gradient-to-br from-slate-50 via-white to-slate-100"
      >
        <div className="flex items-center justify-center py-32">
          <div className="text-center max-w-sm px-6">
            <Icon name="CircleAlert" size={48} className="mx-auto text-red-400 mb-3" />
            <p className="text-slate-700 mb-4">{error || 'Не удалось загрузить'}</p>
            <button
              onClick={loadDashboard}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </SectionPageFrame>
    );
  }

  return (
    <SectionPageFrame
      title="Наша Семья"
      backPath="/"
      variant="light"
      width="wide"
      hideTitle
      backgroundClass="relative overflow-hidden"
    >
      <AnimatedBackground />
      <Confetti trigger={confettiTrigger} />

      {/* Domain header: glassmorphism + gradient — намеренно сохранён */}
      <div className="flex items-center justify-between -mt-2 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_4px_20px_-4px_rgba(251,146,60,0.2)] flex items-center justify-center hover:shadow-[0_6px_25px_-4px_rgba(251,146,60,0.3)] hover:scale-105 transition-all"
          aria-label="Назад"
        >
          <Icon name="ChevronLeft" size={20} className="text-slate-700" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
          Наша Семья
        </h1>
        <div className="w-11 h-11" />
      </div>

      <div className="mb-3">
        <SectionHelp
          emoji="🧭"
          title="Как пользоваться дашбордом"
          description="Дашборд — твой штаб семейной жизни. Здесь видно прогресс по каждой сфере (здоровье, финансы, питание, развитие и т.д.) и куда стоит направить силы прямо сейчас."
          tips={[
            "Колесо хабов — кликни на любой сектор, чтобы увидеть детали раздела и быстро перейти внутрь",
            "Шаги в разделах: отмечай выполненные — прогресс автоматически растёт по сферам",
            "Авто-режим: если не хочешь чек-листы, переключи раздел в авто и прогресс будет считаться сам",
            "Рейтинг семей внизу — соревнуйся с другими семьями и попадай в топ за призы",
            "Домовой подсказывает, на что обратить внимание именно сейчас",
          ]}
        />
      </div>

      <DomovoyTip hubs={data.hubs} overall={data.stats.overall_progress} />

      <div className="lg:grid lg:grid-cols-[1fr,360px] lg:gap-6 lg:items-start">
        <div className="-mx-3 sm:mx-0">
          <DashboardWheel
            hubs={data.hubs}
            stats={data.stats}
            activeHubId={activeHubId}
            onSelectHub={setActiveHubId}
          />
        </div>
        <div className="mt-4 lg:mt-12">
          {activeHub && (
            <HubDetailsCard
              hub={activeHub}
              onToggleStep={toggleStep}
              onSetMode={setSectionMode}
              onSetBulkMode={setBulkMode}
              onOpenSection={(route) => navigate(route)}
              onOpenHub={(route) => navigate(route)}
            />
          )}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <PortfolioDashboardWidget />
        <RatingCampaignWidget userId={String(userId)} />
        <FamilyRatingWidget userId={String(userId)} />
      </div>
    </SectionPageFrame>
  );
}