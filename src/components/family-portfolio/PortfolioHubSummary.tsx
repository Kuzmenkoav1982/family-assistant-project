import { pluralRu } from '@/lib/portfolio/portfolioHubHelpers';

interface Summary {
  total: number;
  withPortfolio: number;
  thin: number;
  empty: number;
}

interface PortfolioHubSummaryProps {
  summary: Summary;
}

export default function PortfolioHubSummary({ summary }: PortfolioHubSummaryProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
        {summary.total} {pluralRu(summary.total, 'участник', 'участника', 'участников')}
      </span>
      {summary.withPortfolio > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
          с активным портфолио: {summary.withPortfolio}
        </span>
      )}
      {summary.thin > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          мало данных: {summary.thin}
        </span>
      )}
      {summary.empty > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          без портфолио: {summary.empty}
        </span>
      )}
    </div>
  );
}
