import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import PreflightChecklist from '@/components/strategy-hub/PreflightChecklist';

/** Добавляет ops=1 к любому относительному href (сохраняя query и hash). */
function withOps(href: string): string {
  const [pathAndQuery, hash] = href.split('#');
  const [path, query] = pathAndQuery.split('?');
  const params = new URLSearchParams(query || '');
  params.set('ops', '1');
  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ''}${hash ? `#${hash}` : ''}`;
}

interface RouteCard {
  group: string;
  title: string;
  description: string;
  href: string;
  extra?: { label: string; href: string }[];
  tone: 'primary' | 'secondary' | 'reserve' | 'archive';
}

const cards: RouteCard[] = [
  {
    group: 'Открывать первым',
    title: 'Стратегическая логика',
    description:
      'Основная браузерная презентация v2.2 — 13 экранов, центральный тезис «Семейный ID», три формата.',
    href: '/strategy',
    extra: [{ label: 'Режим встречи', href: '/strategy?mode=meeting' }],
    tone: 'primary',
  },
  {
    group: 'Если просят показать, что уже собрано',
    title: 'Доказательная логика',
    description:
      'Продуктовый контур и подтверждение собранности — 9 экранов: карта, маршруты, Домовой, готовность, данные, актив, формат.',
    href: '/strategy/proof',
    tone: 'secondary',
  },
  {
    group: 'Если ушли в детали',
    title: 'Внутренний резерв',
    description:
      'Архитектура, данные, безопасность, форматы, актив, команда, пилот, метрики — 8 секций. Не для отправки в открытом виде.',
    href: '/strategy/appendix',
    tone: 'reserve',
  },
  {
    group: 'Архив',
    title: 'Legacy',
    description:
      'Старый образный контур: матрёшка 809 ценностей, госрамка, военный фокус. Только если нужен исторический материал.',
    href: '/strategy-legacy',
    tone: 'archive',
  },
];

const toneStyles: Record<RouteCard['tone'], { border: string; chip: string; button: string }> = {
  primary: {
    border: 'border-slate-300',
    chip: 'bg-slate-900 text-white',
    button: 'bg-slate-900 hover:bg-slate-800 text-white',
  },
  secondary: {
    border: 'border-slate-200',
    chip: 'bg-emerald-700 text-white',
    button: 'bg-slate-800 hover:bg-slate-700 text-white',
  },
  reserve: {
    border: 'border-slate-200',
    chip: 'bg-amber-700 text-white',
    button: 'bg-slate-800 hover:bg-slate-700 text-white',
  },
  archive: {
    border: 'border-slate-200',
    chip: 'bg-slate-500 text-white',
    button: 'bg-slate-700 hover:bg-slate-600 text-white',
  },
};

const meetingScript = [
  { step: 'Начать', target: '/strategy?mode=meeting' },
  { step: 'Если спросили «а что уже есть?»', target: '/strategy/proof' },
  { step: 'Если пошли в due diligence', target: '/strategy/appendix' },
  { step: 'Если нужен старый образ / матрёшка-архив', target: '/strategy-legacy' },
];

function useOrigin() {
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  return origin;
}

export default function StrategyHub() {
  const origin = useOrigin();
  const [searchParams] = useSearchParams();
  const fromUrl = searchParams.get('from');

  // Декодируем from-URL для отображения. Игнорируем подозрительные значения (только относительные пути).
  const fromSafe = useMemo(() => {
    if (!fromUrl) return null;
    try {
      const decoded = decodeURIComponent(fromUrl);
      if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded;
      return null;
    } catch {
      return null;
    }
  }, [fromUrl]);

  // noindex — служебная страница, не для публичной индексации
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const copyUrl = async (href: string) => {
    const url = `${origin}${href}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL скопирован', { description: url });
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-16 pb-12">
        <header className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-2">
            Служебная страница · не публичный материал
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
            Стратегический хаб
          </h1>

        </header>

        {fromSafe && (
          <section className="no-print mb-4">
            <a
              href={fromSafe}
              className="flex items-center justify-between gap-3 border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl px-4 py-3 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon name="ArrowLeft" size={16} className="text-indigo-700 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-wider text-indigo-700 font-semibold">
                    Вернуться к материалу
                  </div>
                  <div className="text-xs font-mono text-slate-600 truncate">
                    {fromSafe}
                  </div>
                </div>
              </div>
              <Icon name="ArrowRight" size={14} className="text-indigo-700 shrink-0" />
            </a>
          </section>
        )}

        <PreflightChecklist />

        {/* Короткий сценарий встречи */}
        <section className="mb-6 border border-slate-200 rounded-xl bg-white p-5">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-3">
            Короткий сценарий встречи
          </div>
          <ol className="space-y-2">
            {meetingScript.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm border-l-2 border-slate-200 pl-3"
              >
                <span className="text-slate-400 tabular-nums w-5 shrink-0">
                  {i + 1}.
                </span>
                <span className="text-slate-800 flex-1">{s.step}</span>
                <a
                  href={withOps(s.target)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-indigo-700 hover:underline shrink-0"
                >
                  {s.target}
                </a>
              </li>
            ))}
          </ol>
        </section>

        {/* Карточки маршрутов */}
        <div className="grid grid-cols-1 gap-3">
          {cards.map((c, i) => {
            const tone = toneStyles[c.tone];
            return (
              <article
                key={i}
                className={`bg-white border ${tone.border} rounded-xl p-5 sm:p-6`}
              >
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  {c.tone === 'primary' ? (
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${tone.chip}`}
                    >
                      {c.group}
                    </span>
                  ) : (
                    <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                      {c.group}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight mb-1.5">
                  {c.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-3xl">
                  {c.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <a
                    href={withOps(c.href)}
                    className={`inline-flex items-center gap-2 ${tone.button} font-medium px-3.5 py-2 rounded-lg text-sm transition`}
                  >
                    <Icon name="ArrowRight" size={14} />
                    Открыть
                  </a>
                  <a
                    href={withOps(c.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium px-3.5 py-2 rounded-lg text-sm transition"
                  >
                    <Icon name="ExternalLink" size={14} />
                    В новой вкладке
                  </a>
                  <button
                    type="button"
                    onClick={() => copyUrl(withOps(c.href))}
                    className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium px-3.5 py-2 rounded-lg text-sm transition"
                  >
                    <Icon name="Copy" size={14} />
                    Скопировать URL
                  </button>

                  {c.extra?.map((ex, j) => (
                    <a
                      key={j}
                      href={withOps(ex.href)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium px-3.5 py-2 rounded-lg text-sm transition"
                    >
                      <Icon name="Presentation" size={14} />
                      {ex.label}
                    </a>
                  ))}
                </div>

                <div className="text-xs text-slate-400 font-mono break-all">
                  {origin}
                  {c.href}
                </div>
              </article>
            );
          })}
        </div>

        <footer className="text-center text-xs text-slate-400 py-6 mt-4">
          «Наша Семья» · служебная страница · nasha-semiya.ru
        </footer>
      </div>
    </div>
  );
}