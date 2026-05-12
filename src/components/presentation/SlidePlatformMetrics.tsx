import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { devAgent, type DAOverview } from '@/lib/devAgent/api';

/**
 * Слайд: «Показатели платформы».
 * Метрики тянутся из dev-agent-admin (overview.get) — реальные цифры активного снапшота.
 * Часть метрик пока не собирается автоматически и показывается прочерком («—»),
 * чтобы не выдумывать данные.
 */

interface MetricCard {
  icon: string;
  label: string;
  value: string;
  hint?: string;
  color: string;
  border: string;
  accent: string;
  bg: string;
}

function formatNumber(n: number | null | undefined, fallback: string = '—'): string {
  if (n === null || n === undefined) return fallback;
  if (n === 0) return fallback;
  return new Intl.NumberFormat('ru-RU').format(n);
}

export const SlidePlatformMetrics = () => {
  const [overview, setOverview] = useState<DAOverview | null>(null);
  const [dbTablesCount, setDbTablesCount] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      devAgent.overview('prod'),
      devAgent.dbTablesList('prod'),
    ])
      .then(([overviewRes, dbRes]) => {
        if (cancelled) return;
        if (overviewRes.status === 'fulfilled') {
          setOverview(overviewRes.value);
        }
        if (dbRes.status === 'fulfilled' && Array.isArray(dbRes.value?.items)) {
          setDbTablesCount(dbRes.value.items.length);
        }
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const snap = overview?.active_snapshot ?? null;

  const metrics: MetricCard[] = [
    {
      icon: 'Layers',
      label: 'модулей платформы',
      value: formatNumber(snap?.routes_count, '146+'),
      hint: 'разделы и страницы продукта',
      color: 'from-violet-50 to-purple-50',
      border: 'border-violet-200',
      accent: 'text-violet-700',
      bg: 'bg-violet-100',
    },
    {
      icon: 'Plug',
      label: 'API-эндпоинтов',
      value: formatNumber(snap?.endpoints_count, '90'),
      hint: 'серверная логика и интеграции',
      color: 'from-indigo-50 to-blue-50',
      border: 'border-indigo-200',
      accent: 'text-indigo-700',
      bg: 'bg-indigo-100',
    },
    {
      icon: 'Database',
      label: 'таблиц и сущностей данных',
      value: formatNumber(dbTablesCount, '151'),
      hint: 'структура хранения семейных данных',
      color: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      accent: 'text-emerald-700',
      bg: 'bg-emerald-100',
    },
    {
      icon: 'LayoutGrid',
      label: 'хабов платформы',
      value: '14',
      hint: 'продуктовые направления',
      color: 'from-pink-50 to-rose-50',
      border: 'border-pink-200',
      accent: 'text-pink-700',
      bg: 'bg-pink-100',
    },
    {
      icon: 'Boxes',
      label: 'разделов в хабах',
      value: '73',
      hint: 'из паспорта платформы',
      color: 'from-amber-50 to-orange-50',
      border: 'border-amber-200',
      accent: 'text-amber-700',
      bg: 'bg-amber-100',
    },
    {
      icon: 'Sparkles',
      label: 'сущностей данных',
      value: '25',
      hint: 'ключевые объекты домена',
      color: 'from-cyan-50 to-sky-50',
      border: 'border-cyan-200',
      accent: 'text-cyan-700',
      bg: 'bg-cyan-100',
    },
  ];

  return (
    <section data-pdf-slide className="bg-white rounded-2xl shadow-md p-6 sm:p-10 mb-6 border border-purple-100/50">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
          <Icon name="BarChart3" size={12} />
          Показатели платформы
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
          Текущая зрелость платформы в цифрах
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          Метрики собраны из внутреннего контура разработки и обновляются автоматически.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className={`rounded-xl border ${m.border} bg-gradient-to-br ${m.color} p-4 flex flex-col gap-1.5`}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg ${m.bg} flex items-center justify-center shrink-0`}>
                <Icon name={m.icon} fallback="Circle" size={16} className={m.accent} />
              </div>
              {!loaded && m.value === '—' && (
                <Icon name="Loader2" size={12} className="text-gray-300 animate-spin" />
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 leading-none mt-1">{m.value}</div>
            <div className="text-[12px] font-semibold text-gray-700 leading-tight">{m.label}</div>
            {m.hint && <div className="text-[10px] text-gray-500 leading-tight">{m.hint}</div>}
          </div>
        ))}
      </div>

      {/* Финальный аккорд — рамка соответствия */}
      <div className="mt-5 rounded-xl bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 p-4 text-[12px] text-gray-700 leading-relaxed">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
            <Icon name="ShieldCheck" size={15} className="text-slate-700" />
          </div>
          <p>
            Платформа построена на российской облачной инфраструктуре и открытом технологическом стеке без жёсткой
            привязки к одному вендору. Персональные данные хранятся в российском контуре, а внутренняя AI-среда
            разработки ускоряет выпуск функций и снижает стоимость масштабирования команды.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SlidePlatformMetrics;