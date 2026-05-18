import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { getMemberCardState } from '@/lib/portfolio/portfolioHubHelpers';
import { useFamilyPortfolio } from '@/components/family-portfolio/useFamilyPortfolio';
import PortfolioHubSkeleton from '@/components/family-portfolio/PortfolioHubSkeleton';
import PortfolioMemberCard from '@/components/family-portfolio/PortfolioMemberCard';
import PortfolioHubSummary from '@/components/family-portfolio/PortfolioHubSummary';

export default function FamilyPortfolio() {
  const navigate = useNavigate();
  const { familyId, items, loading, error, load, sorted, summary, showCompare } = useFamilyPortfolio();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <SEOHead title="Портфолио семьи" description="Паспорта развития всех членов семьи" />
      <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-4 sm:py-6 space-y-4">

        {/* Hero */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-8 px-2 text-gray-600">
              <Icon name="ArrowLeft" size={14} className="mr-1" />
              Назад
            </Button>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shrink-0">
              <Icon name="LineChart" size={20} />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Портфолио семьи</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Где я сейчас. Паспорт развития каждого — без рейтингов и сравнений между людьми.
              </p>
            </div>
          </div>

          {!loading && !error && items.length > 0 && <PortfolioHubSummary summary={summary} />}

          {showCompare && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/portfolio/compare')} className="h-8">
                <Icon name="LayoutGrid" size={13} className="mr-1.5" />
                Семейный обзор
              </Button>
            </div>
          )}
        </div>

        {/* Body */}
        <div aria-live="polite" aria-busy={loading} className="min-h-[160px]">
          {!loading && !familyId && (
            <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-white/70 p-6 text-center">
              <Icon name="Users" size={32} className="mx-auto text-purple-400 mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">Сначала создайте семью</div>
              <p className="text-xs text-gray-500 mb-3">Без семьи нечего складывать в портфолио.</p>
              <Button size="sm" onClick={() => navigate('/family-management')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                Создать семью
              </Button>
            </div>
          )}

          {familyId && loading && <PortfolioHubSkeleton />}

          {familyId && !loading && error && (
            <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-2.5">
              <Icon name="AlertCircle" size={16} className="text-rose-600 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-rose-800 mb-0.5">Не удалось загрузить портфолио</div>
                <div className="text-xs text-rose-700 mb-2 break-words">{error}</div>
                <Button size="sm" variant="outline" onClick={load} className="h-7 text-xs border-rose-300 text-rose-700 hover:bg-rose-100">
                  <Icon name="RefreshCw" size={12} className="mr-1" />
                  Повторить
                </Button>
              </div>
            </div>
          )}

          {familyId && !loading && !error && items.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-white/70 p-6 text-center">
              <Icon name="Users" size={32} className="mx-auto text-purple-400 mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">В семье пока нет участников с портфолио</div>
              <p className="text-xs text-gray-500">Добавьте члена семьи в управлении — карточка появится здесь автоматически.</p>
            </div>
          )}

          {familyId && !loading && !error && sorted.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sorted.map((m) => (
                <PortfolioMemberCard
                  key={m.id}
                  item={m}
                  state={getMemberCardState(m)}
                  onOpen={() => navigate(`/portfolio/${m.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
