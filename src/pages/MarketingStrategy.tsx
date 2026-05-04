import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

type SlideBlock = { label: string; value: string };
type TableRow = string[];
type BarRow = { label: string; value: number; max: number; color: string };

interface BaseSlide {
  title: string;
  subtitle: string;
  bg: string;
  accent: string;
  tag: string;
}
interface BlocksSlide extends BaseSlide { type?: 'blocks'; blocks: SlideBlock[]; }
interface TableSlide extends BaseSlide { type: 'table'; headers: string[]; rows: TableRow[]; note?: string; }
interface BarSlide extends BaseSlide { type: 'bar'; bars: BarRow[]; note?: string; }
interface FunnelSlide extends BaseSlide { type: 'funnel'; steps: { label: string; value: string; pct: string }[]; note?: string; }

type AnySlide = BlocksSlide | TableSlide | BarSlide | FunnelSlide;

const STRATEGY_SLIDES: AnySlide[] = [
  {
    title: 'Маркетинговая стратегия',
    subtitle: '"Наша Семья" — цифровая платформа для семей',
    bg: '1D4ED8', accent: 'BFDBFE',
    tag: 'Версия 1.1 · Май 2026 · Конфиденциально',
    blocks: [
      { label: 'Цель', value: '10 000 активных платящих семей за 12 месяцев' },
      { label: 'Модель монетизации', value: 'Семейный кошелёк pay-per-use — платят только за AI-функции' },
      { label: 'Средний ARPU', value: '~280 руб./мес (200₽ кошелёк + 80₽ партнёры)' },
      { label: 'Рынок (SAM)', value: '15 млн семей с детьми в России' },
      { label: 'Статус', value: 'Продукт работает в production · 51 активная семья' },
      { label: 'MRR цель', value: '~2,8 млн руб./мес к марту 2027' },
    ]
  },
  {
    title: 'Семейный ID — ключевая концепция',
    subtitle: 'Уникальный актив, которого нет ни у одного банка или маркетплейса',
    bg: '312E81', accent: 'C7D2FE',
    tag: 'Конкурентное преимущество',
    blocks: [
      { label: 'Семейный ID', value: 'Единый цифровой профиль семьи для банков, маркетплейсов, сервисов' },
      { label: 'Общие расходы', value: 'Совместный семейный бюджет, трекинг трат, общие накопления' },
      { label: 'Бонусные программы', value: 'Единый кошелёк лояльности — баллы от всех платформ в одном месте' },
      { label: 'Единый опыт', value: 'Магазин, банк, здоровье, дети — одна точка входа для всей семьи' },
      { label: 'B2B монетизация', value: 'Банки и маркетплейсы платят за доступ к API Семейного ID' },
    ]
  },
  {
    title: 'Целевая аудитория',
    subtitle: 'TAM 50 млн · SAM 15 млн · SOM 1,5 млн семей',
    bg: 'BE185D', accent: 'FBCFE8',
    tag: 'Сегментация рынка',
    blocks: [
      { label: 'Мама-организатор (55%)', value: 'Возраст 28–42 года · CAC 400–600 руб. · LTV 10 080 руб. (3 года) · Главный сегмент' },
      { label: 'Папа-партнёр (25%)', value: 'Возраст 30–45 лет · Вовлекается через финансовый модуль и геолокацию' },
      { label: 'B2B сегмент (15%)', value: 'Педиатры, психологи, детские клиники · CAC 200–350 руб.' },
      { label: 'Корпоративный (10%)', value: 'HR-льготы для сотрудников с семьями · Пилот с 2–3 компаниями в Q3' },
    ]
  },
  {
    title: 'Маркетинговые каналы',
    subtitle: 'Мультиканальная стратегия · CAC 150–900 руб.',
    bg: '6D28D9', accent: 'DDD6FE',
    tag: 'Привлечение',
    blocks: [
      { label: '1. ВКонтакте + MAX', value: '30 000 руб./мес · CAC 400–600 руб. · Основной канал для мам (российский мессенджер MAX)' },
      { label: '2. Партнёрства B2B2C', value: '10 000 руб./мес · CAC 200–350 руб. · Клиники, HR, страховые' },
      { label: '3. SEO + Контент', value: '15 000 руб./мес · CAC 300–500 руб. · 4 статьи в месяц' },
      { label: '4. Яндекс.Директ', value: '20 000 руб./мес · CAC 600–900 руб. · Поиск + РСЯ' },
      { label: '5. Маркетплейсы (Ozon, WB)', value: '5 000 руб./мес · Нативная интеграция подписки' },
      { label: '6. Банк ПСБ (стратег)', value: '0 руб. · CAC 150–250 руб. · 2+ млн семей военных' },
    ]
  },
  {
    title: 'Маркетинговая воронка',
    subtitle: 'Цель: 10 000 активных платящих семей',
    bg: '0E7490', accent: 'A5F3FC',
    tag: 'Конверсия',
    blocks: [
      { label: 'Охват (показы)', value: '2 400 000 показов/мес — ВКонтакте, Яндекс, партнёры' },
      { label: 'Переходы на сайт', value: '120 000 визитов (CTR 5%) — лендинг + блог + маркетплейсы' },
      { label: 'Регистрации', value: '36 000 аккаунтов (CR 30%) — регистрация бесплатна, без подписки' },
      { label: 'Активация', value: '18 000 активных (50%) — добавили семью, заполнили профиль' },
      { label: 'Retention D30', value: '12 600 семей (70%) — привычка использования сформирована' },
      { label: 'Активные платящие', value: '10 000 семей (28%) — пополнили кошелёк и используют AI · MRR ~2,8 млн ₽' },
    ]
  },
  {
    title: 'Бюджет на 12 месяцев',
    subtitle: '921 600 руб./год · 76 800 руб./мес',
    bg: '065F46', accent: 'A7F3D0',
    tag: 'Финансы',
    blocks: [
      { label: 'Таргетированная реклама (39%)', value: '360 000 руб./год — ВКонтакте, Instagram, TikTok' },
      { label: 'Яндекс.Директ (26%)', value: '240 000 руб./год — поисковая и контекстная реклама' },
      { label: 'Контент-маркетинг / SEO (20%)', value: '180 000 руб./год — блог, YouTube, Telegram-канал' },
      { label: 'Партнёрства B2B2C (13%)', value: '120 000 руб./год — клиники, HR, школы' },
      { label: 'Маркетплейсы (7%)', value: '60 000 руб./год — Ozon, WB, Яндекс Маркет' },
      { label: 'Ожидаемый ROMI', value: '>300% к концу года · CAC окупается за 2–3 месяца' },
    ]
  },
  {
    title: 'KPI — ключевые показатели',
    subtitle: 'Ежеквартальные цели март 2026 — март 2027',
    bg: 'B45309', accent: 'FDE68A',
    tag: 'Метрики',
    blocks: [
      { label: 'Q1 2026 · Март–Май', value: '300 активных платящих семей · MRR ~84 000 руб. · NPS > 50 · CAC < 600 руб.' },
      { label: 'Q2 2026 · Июнь–Август', value: '2 000 семей · MRR ~560 000 руб. · CAC < 400 руб. · LTV/CAC > 3' },
      { label: 'Q3 2026 · Сентябрь–Ноябрь', value: '5 000 семей · MRR ~1,4 млн руб. · Churn < 5% · Breakeven' },
      { label: 'Q4 2026 · Декабрь–Март 2027', value: '10 000 семей · MRR ~2,8 млн руб. · ARR ~33,6 млн руб.' },
      { label: 'North Star Metric', value: 'Активных платящих семей (с пополненным кошельком) — целевое значение 10 000 к марту 2027' },
    ]
  },
  {
    title: 'SWOT-анализ',
    subtitle: 'Сильные стороны, слабые, возможности, угрозы',
    bg: '1E293B', accent: '94A3B8',
    tag: 'Анализ',
    blocks: [
      { label: 'Сильные стороны', value: 'Нет прямых конкурентов · Готовый продукт в production · Гос. поддержка · ИС n\'RIS · 86 API, 151 таблица БД, 385+ компонентов' },
      { label: 'Слабые стороны', value: 'Соло-основатель · Низкий traction (51 семья) · Нет мобильных приложений iOS/Android' },
      { label: 'Возможности', value: 'Программа "Десятилетие семьи" до 2035 · Господдержка · B2B с банками · Выход в СНГ' },
      { label: 'Угрозы', value: 'Копирование идеи Сбером / VK · Высокий CAC · Регуляторные риски (персданные детей)' },
    ]
  },
  {
    title: 'Роадмап 2026–2027',
    subtitle: 'От 51 семьи к 10 000 платящих',
    bg: '0F172A', accent: '7DD3FC',
    tag: 'Дорожная карта',
    blocks: [
      { label: 'Q1 2026 · Март–Май', value: 'Запуск рекламных каналов · Партнёрства с 3–5 клиниками · Реферальная программа · 300 семей' },
      { label: 'Q2 2026 · Июнь–Август', value: 'iOS-приложение · Масштаб ВКонтакте до 40K/мес · Переговоры с ПСБ · 2 000 семей' },
      { label: 'Q3 2026 · Сентябрь–Ноябрь', value: 'Android-приложение · Корпоративный тариф · Пилот с ПСБ 50K семей · 5 000 семей' },
      { label: 'Q4 2026 · Декабрь–Март 2027', value: 'Series A или стратегическая продажа · Выход в Казахстан, Беларусь · 10 000 семей' },
      { label: 'Интеграции', value: 'Яндекс.Алиса (готово) · Ozon/WB · Банк ПСБ · Госуслуги · ДМС страховые' },
    ]
  },
  {
    type: 'table' as const,
    title: 'Конкурентный анализ',
    subtitle: 'Наша Семья против ключевых игроков рынка',
    bg: '1A1A2E', accent: '818CF8',
    tag: 'Конкуренты',
    headers: ['Продукт', 'Семейный ID', 'Здоровье/ИИ', 'Дети/развитие', 'Бюджет семьи', 'Геолокация', 'Цена/мес'],
    rows: [
      ['Наша Семья', '✓ Да', '✓ ИИ-анализ', '✓ Полный', '✓ Да', '✓ Да', 'Бесплатно + AI pay-per-use'],
      ['Сбер Семья', '— Нет', '— Нет', '— Нет', '✓ Частично', '— Нет', 'Бесплатно'],
      ['VK Kids', '— Нет', '— Нет', '✓ Частично', '— Нет', '— Нет', 'Бесплатно'],
      ['Яндекс.Алиса', '— Нет', '— Нет', '— Нет', '— Нет', '— Нет', 'Бесплатно'],
      ['Life360', '— Нет', '— Нет', '— Нет', '— Нет', '✓ Да', '600 руб.'],
      ['Google Family', '— Нет', '— Нет', '✓ Частично', '— Нет', '✓ Да', 'Бесплатно'],
    ],
    note: 'Наша Семья — единственная платформа с полным набором семейных функций и Семейным ID в России',
  },
  {
    type: 'funnel' as const,
    title: 'Воронка привлечения — визуализация',
    subtitle: 'Путь от показа до платящего пользователя',
    bg: '0E4F6E', accent: '7EE7FA',
    tag: 'Конверсия · Детали',
    steps: [
      { label: 'Показы рекламы', value: '2 400 000', pct: '100%' },
      { label: 'Клики на сайт', value: '120 000', pct: '5%' },
      { label: 'Регистрации', value: '36 000', pct: '30%' },
      { label: 'Активация (добавили семью)', value: '18 000', pct: '50%' },
      { label: 'Retention 30 дней', value: '12 600', pct: '70%' },
      { label: 'Активные платящие (кошелёк)', value: '10 000', pct: '79%' },
    ],
    note: 'CAC средний: ~500 руб./активная семья · LTV (3 года): 10 080 руб. · LTV/CAC ≈ 14×',
  },
  {
    type: 'bar' as const,
    title: 'Рост MRR по кварталам',
    subtitle: 'Ежемесячная выручка в тыс. руб. — план на 12 месяцев',
    bg: '134E4A', accent: '6EE7B7',
    tag: 'Финансовая модель',
    bars: [
      { label: 'Q1: Март–Май 2026', value: 84, max: 2800, color: '6EE7B7' },
      { label: 'Q2: Июнь–Август 2026', value: 560, max: 2800, color: '34D399' },
      { label: 'Q3: Сент–Ноябрь 2026', value: 1400, max: 2800, color: '10B981' },
      { label: 'Q4: Дек 2026 – Март 2027', value: 2800, max: 2800, color: '059669' },
    ],
    note: 'ARR к марту 2027: ~33 600 000 руб. · Breakeven в Q3 2026 · ROI маркетинга: >300%',
  },
];

type Section = 'overview' | 'audience' | 'channels' | 'funnel' | 'content' | 'budget' | 'kpi' | 'roadmap';

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Обзор', icon: 'LayoutDashboard' },
  { id: 'audience', label: 'Аудитория', icon: 'Users' },
  { id: 'channels', label: 'Каналы', icon: 'Megaphone' },
  { id: 'funnel', label: 'Воронка', icon: 'Filter' },
  { id: 'content', label: 'Контент', icon: 'FileText' },
  { id: 'budget', label: 'Бюджет', icon: 'Wallet' },
  { id: 'kpi', label: 'KPI', icon: 'BarChart2' },
  { id: 'roadmap', label: 'Роадмап', icon: 'Map' },
];

const SECTIONS: Section[] = ['overview','audience','channels','funnel','content','budget','kpi','roadmap'];

export default function MarketingStrategy() {
  const [active, setActive] = useState<Section>('overview');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfMsg, setPdfMsg] = useState('');
  const [pptxBusy, setPptxBusy] = useState(false);
  const [pptxMsg, setPptxMsg] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const captureSection = async (section: Section, onProgress: (m: string) => void): Promise<HTMLCanvasElement | null> => {
    setActive(section);
    await new Promise(r => setTimeout(r, 350));
    const el = contentRef.current;
    if (!el) return null;
    onProgress(`Захват: ${NAV.find(n=>n.id===section)?.label}...`);
    return html2canvas(el, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f8fafc',
      windowWidth: 1200,
      imageTimeout: 0,
      ignoreElements: (el) => el.classList.contains('export-ignore'),
    });
  };

  const captureAll = async (onProgress: (m: string) => void): Promise<HTMLCanvasElement[]> => {
    const prevActive = active;
    const canvases: HTMLCanvasElement[] = [];
    for (const section of SECTIONS) {
      const c = await captureSection(section, onProgress);
      if (c) canvases.push(c);
    }
    setActive(prevActive);
    return canvases;
  };

  const addCanvasToPdf = (pdf: jsPDF, canvas: HTMLCanvasElement, i: number, total: number) => {
    const W=297; const H=210; const m=0;
    if (i > 0) pdf.addPage();
    pdf.setFillColor(248,250,252); pdf.rect(0,0,W,H,'F');
    const ar = canvas.width / canvas.height;
    let iw = W - m*2; let ih = iw / ar;
    if (ih > H - m*2) { ih = H - m*2; iw = ih * ar; }
    const ix = m + (W - m*2 - iw) / 2;
    const iy = m + (H - m*2 - ih) / 2;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', ix, iy, iw, ih, `s${i}`, 'FAST');
    pdf.setFontSize(7); pdf.setTextColor(150,150,150);
    pdf.text(`${i+1} / ${total}`, W/2, H-2, {align:'center'});
  };

  const downloadPDF = async () => {
    setPdfBusy(true);
    try {
      const canvases = await captureAll(setPdfMsg);
      if (!canvases.length) return;
      const pdf = new jsPDF('l','mm','a4');
      canvases.forEach((c,i) => addCanvasToPdf(pdf, c, i, canvases.length));
      pdf.save('Маркетинговая-стратегия-НашаСемья.pdf');
    } finally { setPdfBusy(false); setPdfMsg(''); }
  };

  const downloadPPTX = async () => {
    setPptxBusy(true);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const canvases = await captureAll(setPptxMsg);
      if (!canvases.length) return;
      setPptxMsg('Формирую файл...');
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.title = 'Маркетинговая стратегия — Наша Семья';
      pptx.company = 'Наша Семья';
      const total = canvases.length;
      const sw=10; const sh=5.625;
      canvases.forEach((c,i) => {
        const ar = c.width / c.height;
        const slideAr = sw / sh;
        let w = sw; let h = w / ar;
        if (ar < slideAr) { h = sh; w = h * ar; }
        const slide = pptx.addSlide();
        slide.background = { fill: 'F8FAFC' };
        slide.addImage({ data: c.toDataURL('image/png'), x: (sw-w)/2, y: (sh-h)/2, w, h });
        slide.addText(`${i+1} / ${total}`, { x:0, y:sh-0.22, w:sw, h:0.2, fontSize:7, color:'B0B8C4', fontFace:'Calibri', align:'center' });
      });
      await pptx.writeFile({ fileName: 'Маркетинговая-стратегия-НашаСемья.pptx' });
    } finally { setPptxBusy(false); setPptxMsg(''); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Конфиденциально</div>
            <h1 className="text-xl font-bold text-slate-900">Маркетинговая стратегия «Наша Семья»</h1>
            <p className="text-sm text-slate-500">По состоянию на 04.05.2026 · Версия 1.1</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" onClick={downloadPPTX} disabled={pptxBusy} className="gap-1.5">
              <Icon name={pptxBusy ? 'Loader2' : 'Presentation'} size={14} className={pptxBusy ? 'animate-spin' : ''} />
              {pptxBusy ? pptxMsg || 'PPTX...' : 'PowerPoint'}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadPDF} disabled={pdfBusy} className="gap-1.5">
              <Icon name={pdfBusy ? 'Loader2' : 'Download'} size={14} className={pdfBusy ? 'animate-spin' : ''} />
              {pdfBusy ? pdfMsg || 'PDF...' : 'Скачать PDF'}
            </Button>
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-green-700">Продукт в production · 51 семья</span>
            </div>
          </div>
        </div>
        {/* Nav */}
        <div className="max-w-6xl mx-auto px-6 pb-3 flex gap-1 overflow-x-auto scrollbar-hide">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                active === n.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon name={n.icon} size={14} />
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ══════════════════════════════════════════════
            ОБЗОР
        ══════════════════════════════════════════════ */}
        {active === 'overview' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-10">
              <div className="text-xs font-semibold tracking-widest text-blue-200 uppercase mb-3">Маркетинговая стратегия</div>
              <h2 className="text-4xl font-black mb-4">«Наша Семья» — цифровая платформа благополучия семейной жизни</h2>
              <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
                Единственная в России комплексная платформа для управления всеми аспектами семейной жизни. 
                Стратегия рассчитана на период <strong className="text-white">март 2026 — март 2027</strong>, 
                целевой показатель — <strong className="text-white">10 000 платящих семей</strong> за 12 месяцев.
              </p>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Текущих семей', value: '51', icon: '👨‍👩‍👧‍👦' },
                  { label: 'Целевых семей (12 мес)', value: '10 000', icon: '🎯' },
                  { label: 'Рынок (SAM)', value: '15 млн', icon: '🌍' },
                  { label: 'Средний ARPU', value: '~280 ₽/мес', icon: '💳' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-black">{s.value}</div>
                    <div className="text-sm text-blue-200">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Семейный ID — ключевая концепция */}
            <div className="rounded-2xl bg-gradient-to-r from-indigo-900 to-blue-900 text-white p-8">
              <div className="text-xs font-semibold tracking-widest text-indigo-300 uppercase mb-3">Ключевая концепция</div>
              <h3 className="text-3xl font-black mb-3">Семья как единый клиент — Семейный ID</h3>
              <p className="text-indigo-100 leading-relaxed mb-6 max-w-3xl">
                Единый цифровой профиль семьи открывает новое качество клиентского опыта: общие расходы, совместные счета, 
                единый ID для банков и маркетплейсов. Платформа создаёт <strong className="text-white">Семейный ID</strong> — 
                цифровую идентичность семьи, которой нет ни у одного банка или маркетплейса сегодня.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: '🪪', title: 'Семейный ID', desc: 'Единый профиль для всех членов семьи — банки, маркетплейсы, сервисы' },
                  { icon: '💳', title: 'Общие расходы и счета', desc: 'Совместный семейный бюджет, трекинг трат, общие накопления' },
                  { icon: '🎁', title: 'Бонусные программы семьи', desc: 'Единый кошелёк лояльности — баллы от всех платформ в одном месте' },
                  { icon: '🔗', title: 'Единый клиентский опыт', desc: 'Магазин, банк, здоровье, дети — одна точка входа для всей семьи' },
                ].map((c, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl mb-2">{c.icon}</div>
                    <div className="font-bold text-sm mb-1">{c.title}</div>
                    <div className="text-xs text-indigo-200 leading-relaxed">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Миссия и позиционирование */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Миссия</div>
                <h3 className="text-xl font-black text-slate-900 mb-4">Объединить семью в единое целое</h3>
                <p className="text-slate-600 leading-relaxed">
                  Помогать каждой российской семье жить организованнее, здоровее и счастливее — 
                  предоставляя единое цифровое пространство для планирования, заботы, общения и роста.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Уникальное предложение (UVP)</div>
                <h3 className="text-xl font-black text-slate-900 mb-4">Всё для семьи — в одном месте</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  {[
                    '🪪 Семейный ID — единый цифровой профиль семьи',
                    '💳 Общие расходы и бонусные программы семьи',
                    '🏥 ИИ-расшифровка анализов и рецептов',
                    '🥗 Автоматическое меню + список покупок',
                    '👶 Полный профиль развития каждого ребёнка',
                    '📍 Семейный маячок (геолокация)',
                  ].map((u, i) => <li key={i}>{u}</li>)}
                </ul>
              </div>
            </div>

            {/* SWOT */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Анализ</div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">SWOT-анализ</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Сильные стороны', color: 'bg-green-50 border-green-200', text: 'text-green-800', icon: '💪',
                    items: ['Нет прямых конкурентов в нише', 'Готовый production-ready продукт', 'Гос. поддержка «Десятилетие семьи»', '86 API, 151 таблица, 90+ экранов', 'ИС защищена — n\'RIS №518-830-027', 'Уникальный модуль здоровья с ИИ']
                  },
                  {
                    label: 'Слабые стороны', color: 'bg-red-50 border-red-200', text: 'text-red-800', icon: '⚠️',
                    items: ['Соло-основатель — нет команды', 'Низкий traction (51 семья)', 'Нет бренда и узнаваемости', 'Нет мобильных приложений iOS/Android', 'Бюджет на маркетинг ограничен', 'Сложный продукт — долгий онбординг']
                  },
                  {
                    label: 'Возможности', color: 'bg-blue-50 border-blue-200', text: 'text-blue-800', icon: '🚀',
                    items: ['Программа «Десятилетие семьи» до 2035 г.', 'Господдержка: гранты, субсидии', 'B2B: психологи, педиатры, страховые', 'Стратегическая продажа банку (ПСБ)', 'Выход в Казахстан, Беларусь', 'Интеграция с экосистемой Яндекса']
                  },
                  {
                    label: 'Угрозы', color: 'bg-orange-50 border-orange-200', text: 'text-orange-800', icon: '🔥',
                    items: ['Копирование идеи крупным игроком (Сбер, VK)', 'Низкая платёжеспособность аудитории', 'Высокий CAC в digital-каналах', 'Отток при слабом retention', 'Регуляторные риски (персданные детей)', 'Конкуренция со стороны Яндекс.Алисы']
                  },
                ].map((q, i) => (
                  <div key={i} className={`rounded-xl border p-5 ${q.color}`}>
                    <div className={`font-bold text-sm mb-3 ${q.text}`}>{q.icon} {q.label}</div>
                    <ul className="space-y-1">
                      {q.items.map((it, j) => (
                        <li key={j} className={`text-xs ${q.text} opacity-80`}>· {it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            АУДИТОРИЯ
        ══════════════════════════════════════════════ */}
        {active === 'audience' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Целевая аудитория</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Портреты покупателей</h2>
              <p className="text-slate-500">TAM — 50 млн семей · SAM — 15 млн городских семей с детьми · SOM — 1,5 млн за 3 года</p>
            </div>

            {/* Сегменты */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  name: 'Мама-организатор', emoji: '👩‍👧‍👦', age: '28–42 года', share: '55%', priority: 'Главный сегмент',
                  color: 'border-pink-300 bg-pink-50',
                  badge: 'bg-pink-500',
                  pain: ['Хаос в расписании семьи', 'Забываю о прививках и врачах', 'Трачу время на списки покупок', 'Дети не слышат про правила'],
                  motivation: ['Контроль и порядок', 'Забота о здоровье детей', 'Экономия времени', 'Семья как команда'],
                  channels: 'Instagram, Pinterest, ВКонтакте, Telegram (мамские чаты)',
                  ltv: '₽10 080',
                  cac: '₽400–600',
                },
                {
                  name: 'Папа-партнёр', emoji: '👨‍👩‍👦', age: '30–45 лет', share: '25%', priority: 'Вторичный сегмент',
                  color: 'border-blue-300 bg-blue-50',
                  badge: 'bg-blue-500',
                  pain: ['Не знаю расписание школы', 'Жена всем управляет — я в стороне', 'Нет совместных планов', 'Деньги тратятся бесконтрольно'],
                  motivation: ['Участие в жизни семьи', 'Прозрачность расходов', 'Совместные цели', 'Путешествия и досуг'],
                  channels: 'YouTube, Telegram-каналы, ВКонтакте',
                  ltv: '₽10 080',
                  cac: '₽600–900',
                },
                {
                  name: 'Семья военнослужащего', emoji: '🎖️', age: '25–40 лет', share: '20%', priority: 'Стратегический сегмент',
                  color: 'border-green-300 bg-green-50',
                  badge: 'bg-green-600',
                  pain: ['Папа в командировке — нет связи', 'Сложно отслеживать льготы', 'Дети без контроля родителя', 'Разлучённость семьи'],
                  motivation: ['Маячок — знать где дети', 'Льготы и господдержка', 'Связь с семьёй', 'Документы в одном месте'],
                  channels: 'ПСБ (партнёр), Госуслуги, ВКонтакте',
                  ltv: '₽10 080',
                  cac: '₽200–400 (партнёрский)',
                },
              ].map((seg, i) => (
                <div key={i} className={`rounded-2xl border-2 p-6 ${seg.color}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-3xl mb-1">{seg.emoji}</div>
                      <h3 className="font-black text-slate-900 text-lg">{seg.name}</h3>
                      <div className="text-sm text-slate-500">{seg.age}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-white text-xs font-bold px-2 py-1 rounded-lg ${seg.badge} mb-1`}>{seg.share}</div>
                      <div className="text-xs text-slate-500">{seg.priority}</div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Боли</div>
                    <ul className="space-y-1">{seg.pain.map((p, j) => <li key={j} className="text-xs text-slate-700">— {p}</li>)}</ul>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Мотивация</div>
                    <ul className="space-y-1">{seg.motivation.map((m, j) => <li key={j} className="text-xs text-slate-700">✓ {m}</li>)}</ul>
                  </div>
                  <div className="border-t border-white/60 pt-3 mt-3 grid grid-cols-2 gap-2">
                    <div><div className="text-xs text-slate-500">LTV</div><div className="font-bold text-slate-800 text-sm">{seg.ltv}</div></div>
                    <div><div className="text-xs text-slate-500">CAC</div><div className="font-bold text-slate-800 text-sm">{seg.cac}</div></div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500"><span className="font-semibold">Каналы:</span> {seg.channels}</div>
                </div>
              ))}
            </div>

            {/* Размер рынка */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Расчёт адресного рынка</h3>
              <div className="grid grid-cols-3 gap-6 mb-6">
                {[
                  { label: 'TAM', sub: 'Общий рынок', value: '50 млн семей', desc: 'Все семьи в России', color: 'bg-slate-100', textColor: 'text-slate-800' },
                  { label: 'SAM', sub: 'Доступный рынок', value: '15 млн семей', desc: 'Городские семьи с детьми, интернет 80%+', color: 'bg-blue-50', textColor: 'text-blue-800' },
                  { label: 'SOM', sub: 'Реально достижимый', value: '1,5 млн семей', desc: 'Целевая аудитория за 3 года', color: 'bg-green-50', textColor: 'text-green-800' },
                ].map((m, i) => (
                  <div key={i} className={`rounded-xl p-5 ${m.color}`}>
                    <div className={`text-2xl font-black mb-1 ${m.textColor}`}>{m.label}</div>
                    <div className="text-xs text-slate-500 uppercase mb-2">{m.sub}</div>
                    <div className={`text-3xl font-black mb-2 ${m.textColor}`}>{m.value}</div>
                    <div className="text-xs text-slate-600">{m.desc}</div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 rounded-xl p-5">
                <div className="font-bold text-blue-900 mb-2">Потенциал монетизации SAM</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: 'SAM × конверсия 1%', value: '150 000 активных семей' },
                    { label: 'Средний ARPU', value: '~280 ₽/мес (кошелёк + партнёры)' },
                    { label: 'Годовая выручка', value: '~504 млн ₽/год' },
                    { label: 'При конверсии 0,1%', value: '~50 млн ₽/год' },
                  ].map((c, i) => (
                    <div key={i}>
                      <div className="text-slate-500">{c.label}</div>
                      <div className="font-black text-blue-800">{c.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            КАНАЛЫ
        ══════════════════════════════════════════════ */}
        {active === 'channels' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Каналы привлечения</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Маркетинговые каналы</h2>
              <p className="text-slate-500">Приоритизация по ROI и доступности для pre-revenue стартапа</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  priority: '🥇 Приоритет 1', name: 'ВКонтакте + MAX', budget: '₽30 000/мес', cac: '₽400–600', volume: '50–75 семей/мес',
                  color: 'border-blue-300 bg-blue-50',
                  tactics: [
                    'Таргет ВК: мамы 28–42, дети в профиле, интересы «здоровье детей», «семья», «кулинария»',
                    'Собственный канал в MAX (российский мессенджер): контент о семейном благополучии, лайфхаки, анонсы',
                    'Чат-бот в MAX для быстрого доступа к функциям платформы (3 администратора)',
                    'Партнёрские публикации в мамских сообществах ВКонтакте (бесплатно)',
                    'Конкурсы с призами — пополнение семейного кошелька (бонус на AI-функции)',
                  ],
                  metrics: { cpm: '₽350', ctr: '1,2%', cr: '3%' },
                },
                {
                  priority: '🥈 Приоритет 2', name: 'Партнёрства и B2B2C', budget: '₽10 000/мес', cac: '₽200–350', volume: '30–50 семей/мес',
                  color: 'border-green-300 bg-green-50',
                  tactics: [
                    'Педиатры и детские клиники: реферальная программа (300₽ за приведённую семью)',
                    'Школы и детские сады: листовки + QR-код на родительских собраниях',
                    'Психологи и семейные консультанты: бонусное пополнение кошелька в обмен на рекомендации',
                    'Страховые компании: совместный продукт «здоровье семьи»',
                    'Работодатели: «платформа как соцпакет» для сотрудников с семьями',
                  ],
                  metrics: { cpm: '—', ctr: '—', cr: '5–8%' },
                },
                {
                  priority: '🥉 Приоритет 3', name: 'SEO + Контент-маркетинг', budget: '₽15 000/мес', cac: '₽300–500', volume: '20–40 семей/мес',
                  color: 'border-purple-300 bg-purple-50',
                  tactics: [
                    'Блог: 4 статьи/месяц по запросам «как организовать семейный бюджет», «прививки ребёнку», «меню на неделю»',
                    'Яндекс.Дзен: короткие полезные материалы для мам',
                    'YouTube Shorts / TikTok: демо функций — «как за 5 минут запланировать меню на неделю»',
                    'Ответы на Mail.ru Ответах и тематических форумах (babyblog.ru, mama.ru)',
                    'Оптимизация App Store / Google Play (после выпуска мобильных приложений)',
                  ],
                  metrics: { cpm: '—', ctr: '2–4%', cr: '4–6%' },
                },
                {
                  priority: '⭐ Доп. канал', name: 'Яндекс.Директ / Поиск', budget: '₽20 000/мес', cac: '₽600–900', volume: '25–35 семей/мес',
                  color: 'border-orange-300 bg-orange-50',
                  tactics: [
                    'Запросы: «семейный органайзер», «приложение для семьи», «список покупок для семьи», «расписание для семьи»',
                    'Ретаргетинг на посетителей сайта (конверсия ×3 vs холодный трафик)',
                    'Look-alike аудитории от текущих платящих пользователей',
                    'Кампании по конкурентам: «альтернатива Todoist для семьи»',
                  ],
                  metrics: { cpm: '₽1 200', ctr: '3,5%', cr: '2,5%' },
                },
                {
                  priority: '🤝 Стратегический', name: 'Банк ПСБ (ПАО «Банк ПСБ»)', budget: '₽0 (партнёрство)', cac: '₽150–250', volume: '100–200 семей/мес',
                  color: 'border-slate-300 bg-slate-50',
                  tactics: [
                    'Интеграция в мобильное приложение ПСБ как «семейный сервис» для держателей карт',
                    'Совместный продукт: «Семейная карта ПСБ + бонусное пополнение кошелька Наша Семья»',
                    'Push-уведомления в приложении банка для 2+ млн семей военнослужащих',
                    'Co-branding: «Забота о семье с Банком ПСБ»',
                    'Льготная ипотека + раздел финансового планирования в нашей платформе',
                  ],
                  metrics: { cpm: '—', ctr: '—', cr: '8–12% (тёплая аудитория)' },
                },
                {
                  priority: '🛒 Маркетплейсы', name: 'Ozon + Wildberries + Яндекс Маркет', budget: '₽5 000/мес', cac: '₽250–400', volume: '40–80 семей/мес',
                  color: 'border-teal-300 bg-teal-50',
                  tactics: [
                    'Семейный ID → единый клиентский опыт: Ozon, WB и Маркет получают доступ к профилю семьи для персонализации и кросс-продаж',
                    'Общие расходы и счета: интеграция чеков из маркетплейсов в семейный бюджет платформы — единая картина трат семьи',
                    'Бонусные программы семьи: единый кошелёк лояльности — баллы Ozon/WB/Маркета суммируются в семейном профиле',
                    'Ozon Банк: продвижение подписки как cashback-бонус — семейный ID как основа для Ozon Pay и финансовых продуктов',
                    'Wildberries Pay: интеграция с WB-кошельком — семейный бюджет и трекинг покупок семьи в одном месте',
                    'Размещение «Пополнение семейного кошелька Наша Семья» как цифрового товара на Ozon и Wildberries — прямая дистрибуция',
                  ],
                  metrics: { cpm: '₽500', ctr: '2%', cr: '4–6%' },
                },
              ].map((ch, i) => (
                <div key={i} className={`rounded-2xl border-2 p-6 ${ch.color}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase mb-1">{ch.priority}</div>
                      <h3 className="text-xl font-black text-slate-900">{ch.name}</h3>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <div className="bg-white rounded-lg px-3 py-2 text-center shadow-sm">
                        <div className="text-xs text-slate-500">Бюджет</div>
                        <div className="font-black text-slate-900 text-sm">{ch.budget}</div>
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 text-center shadow-sm">
                        <div className="text-xs text-slate-500">CAC</div>
                        <div className="font-black text-slate-900 text-sm">{ch.cac}</div>
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 text-center shadow-sm">
                        <div className="text-xs text-slate-500">Объём</div>
                        <div className="font-black text-slate-900 text-sm">{ch.volume}</div>
                      </div>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {ch.tactics.map((t, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-slate-400 mt-0.5 flex-shrink-0">→</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            ВОРОНКА
        ══════════════════════════════════════════════ */}
        {active === 'funnel' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Конверсия</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Маркетинговая воронка</h2>
              <p className="text-slate-500">Полный путь от первого касания до платящего пользователя и реферала</p>
            </div>

            {/* Воронка */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Расчёт воронки — цель 10 000 активных платящих семей за 12 месяцев</h3>
              <div className="space-y-3">
                {[
                  { stage: '1. Охват (показы)', value: '2 400 000', conversion: '—', note: 'Реклама + органика + партнёры', width: 100, color: 'bg-slate-200 text-slate-700' },
                  { stage: '2. Переходы на сайт', value: '120 000', conversion: '5%', note: 'CTR в среднем 5% по каналам', width: 85, color: 'bg-blue-100 text-blue-700' },
                  { stage: '3. Регистрации (бесплатно)', value: '36 000', conversion: '30%', note: 'Регистрация без подписки и без карты', width: 70, color: 'bg-indigo-100 text-indigo-700' },
                  { stage: '4. Активация (7 дней)', value: '18 000', conversion: '50%', note: 'Добавили семью, заполнили профиль', width: 55, color: 'bg-violet-100 text-violet-700' },
                  { stage: '5. Retention (30 дней)', value: '12 600', conversion: '70%', note: 'Вернулись через 30 дней', width: 42, color: 'bg-purple-100 text-purple-700' },
                  { stage: '6. Активные платящие (кошелёк)', value: '10 000', conversion: '28%', note: 'Пополнили кошелёк и используют AI-функции', width: 28, color: 'bg-green-200 text-green-800' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-52 text-sm font-semibold text-slate-700 flex-shrink-0">{row.stage}</div>
                    <div className="flex-1">
                      <div className={`h-10 rounded-lg flex items-center px-4 font-black text-sm ${row.color}`} style={{ width: `${row.width}%` }}>
                        {row.value}
                        {row.conversion !== '—' && <span className="ml-2 text-xs font-normal opacity-70">↓ {row.conversion}</span>}
                      </div>
                    </div>
                    <div className="w-64 text-xs text-slate-500 hidden md:block">{row.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Онбординг */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Онбординг — путь новой семьи (первые 7 дней)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { day: 'День 0', title: 'Регистрация', icon: '👋', action: 'Создание аккаунта, добавление 1-го члена семьи', trigger: 'Приветственный email + Push' },
                  { day: 'День 1', title: 'Первая ценность', icon: '✨', action: 'Добавили задачу или событие в календарь', trigger: 'Email: «Что попробовать первым?»' },
                  { day: 'День 3', title: 'Вовлечение', icon: '🔥', action: 'Пригласили второго члена семьи', trigger: 'Push: «Позвали ли вы партнёра?»' },
                  { day: 'День 7', title: 'Первое пополнение', icon: '💳', action: 'Попробовали AI-функции → пополнение кошелька', trigger: 'Email + in-app: бонус +20% к первому пополнению' },
                ].map((step, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-5">
                    <div className="text-2xl mb-2">{step.icon}</div>
                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{step.day}</div>
                    <div className="font-bold text-slate-900 mb-2">{step.title}</div>
                    <div className="text-xs text-slate-600 mb-2">{step.action}</div>
                    <div className="text-xs text-blue-600 font-medium">{step.trigger}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retention */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Механики удержания (Retention)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Product-driven', color: 'bg-blue-50',
                    items: ['Еженедельный дайджест семьи по email', 'Напоминания о приёме лекарств (Push)', 'Напоминания о днях рождения за 3 дня', 'Еженедельное меню — повод вернуться', 'Достижения детей — эмоциональная привязка']
                  },
                  {
                    title: 'Community-driven', color: 'bg-green-50',
                    items: ['Чат пользователей в MAX', 'Голосования за новые функции', 'Программа «Семья месяца»', 'Реферальная программа: бонус на кошелёк за друга', 'Семейные челленджи (трекинг воды, шагов)']
                  },
                  {
                    title: 'Commercial-driven', color: 'bg-amber-50',
                    items: ['Бонус +20% к пополнению кошелька от 1000₽', 'Анонс новых AI-функций', 'Пакетные тарифы AI со скидкой 25%', 'Донат-программа «Угостить Домового»', 'Корпоративный тариф (от 5 семей)']
                  },
                ].map((block, i) => (
                  <div key={i} className={`rounded-xl p-5 ${block.color}`}>
                    <div className="font-bold text-slate-900 mb-3">{block.title}</div>
                    <ul className="space-y-2">{block.items.map((it, j) => <li key={j} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-slate-400 flex-shrink-0">·</span>{it}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            КОНТЕНТ
        ══════════════════════════════════════════════ */}
        {active === 'content' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Контент</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Контент-стратегия</h2>
              <p className="text-slate-500">Контент как главный инструмент привлечения и удержания при ограниченном бюджете</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  platform: 'ВКонтакте', handle: '@nashamily', freq: '5 постов/нед', icon: '🔵', color: 'bg-blue-50 border-blue-200',
                  formats: ['Советы по организации семейной жизни', 'Мини-обзоры функций платформы (гиф/скрин)', 'Реальные кейсы пользователей', 'Опросы: «Как вы ведёте список покупок?»', 'Сезонный контент: школа, каникулы, праздники'],
                  kpi: 'Цель: 5 000 подписчиков за 6 мес',
                },
                {
                  platform: 'MAX-канал «Наша Семья»', handle: 'max.ru/id231805288780_biz', freq: '3–4 поста/нед', icon: '💬', color: 'bg-sky-50 border-sky-200',
                  formats: ['Короткие лайфхаки для семьи (150–200 слов)', 'Эксклюзивные анонсы новых функций', 'Истории пользователей (анонимно)', 'Ссылки на статьи блога', 'Закрытые опросы для подписчиков'],
                  kpi: 'Цель: 3 000 подписчиков за 6 мес',
                },
                {
                  platform: 'YouTube Shorts / TikTok', handle: '@nashamily', freq: '2–3 видео/нед', icon: '🎬', color: 'bg-red-50 border-red-200',
                  formats: ['«Как за 2 минуты составить меню на неделю»', '«ИИ расшифровал анализ ребёнка — вот что показал»', '«Семейный маячок: папа видит где дети»', '«День в приложении — утро семьи с Наша Семья»', 'До/После: хаос vs порядок в семье'],
                  kpi: 'Цель: 10 000 просмотров/мес за 3 мес',
                },
                {
                  platform: 'Блог nashamily.ru', handle: '/blog', freq: '4 статьи/мес', icon: '📝', color: 'bg-green-50 border-green-200',
                  formats: ['«Прививки по возрасту: полный календарь 2026»', '«Семейный бюджет: как вести без ссор»', '«Меню на неделю для семьи с детьми»', '«Как мотивировать ребёнка делать уборку»', '«Права семей военных: полный гайд 2026»'],
                  kpi: '3 000 уникальных читателей/мес за 6 мес',
                },
              ].map((pl, i) => (
                <div key={i} className={`rounded-2xl border-2 p-6 ${pl.color}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{pl.icon}</div>
                    <div>
                      <div className="font-black text-slate-900">{pl.platform}</div>
                      <div className="text-sm text-slate-500">{pl.handle} · {pl.freq}</div>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {pl.formats.map((f, j) => <li key={j} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400">·</span>{f}</li>)}
                  </ul>
                  <div className="bg-white rounded-lg px-4 py-2 text-xs font-semibold text-slate-600">{pl.kpi}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-4">Контент-план на апрель 2026</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Неделя</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Тема</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Форматы</th>
                      <th className="text-left px-4 py-3 font-semibold text-slate-700">Цель</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { week: '1–7 апр', theme: 'Здоровье семьи', formats: 'Статья + 3 поста ВК + 2 Shorts', goal: 'Регистрации через здоровье-боль' },
                      { week: '8–14 апр', theme: 'Дети и школа', formats: 'Статья + ВК + Telegram + видео', goal: 'Сегмент: мамы школьников' },
                      { week: '15–21 апр', theme: 'Питание и меню', formats: 'Статья + демо функции + рецепт', goal: 'Виральность через кулинарный контент' },
                      { week: '22–30 апр', theme: 'Весенние путешествия', formats: 'Гайд + ВК + Stories + Shorts', goal: 'Активация раздела путешествий' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-4 py-3 font-semibold text-slate-900">{row.week}</td>
                        <td className="px-4 py-3 text-slate-700">{row.theme}</td>
                        <td className="px-4 py-3 text-slate-600">{row.formats}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{row.goal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            БЮДЖЕТ
        ══════════════════════════════════════════════ */}
        {active === 'budget' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Финансы</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Маркетинговый бюджет и юнит-экономика</h2>
              <p className="text-slate-500">Расчёт на 12 месяцев, март 2026 — март 2027</p>
            </div>

            {/* Юнит-экономика */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
              <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-4">Юнит-экономика</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: 'Средний ARPU', value: '~280 ₽/мес', sub: 'кошелёк 200₽ + партнёры 80₽' },
                  { label: 'LTV (36 мес)', value: '₽10 080', sub: 'при retention 36 мес' },
                  { label: 'CAC (средний)', value: '₽500', sub: 'по всем каналам' },
                  { label: 'LTV/CAC', value: '~14×', sub: 'отличный показатель' },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-white mb-1">{m.value}</div>
                    <div className="text-sm font-semibold text-slate-300">{m.label}</div>
                    <div className="text-xs text-slate-500">{m.sub}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: 'Окупаемость CAC', value: '~2 мес', sub: '500 ÷ 280 ≈ 1,8' },
                  { label: 'Маржа на AI', value: '60–70%', sub: 'pay-per-use модель' },
                  { label: 'Breakeven (активных)', value: '~2 850', sub: 'при затратах ₽800K/мес' },
                  { label: 'Выручка при 10K', value: '~₽33,6M/год', sub: '10000 × 280 × 12' },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="text-2xl font-black text-green-400 mb-1">{m.value}</div>
                    <div className="text-sm font-semibold text-slate-300">{m.label}</div>
                    <div className="text-xs text-slate-500">{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Бюджет по каналам */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Бюджет по каналам (ежемесячно)</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left px-5 py-3 font-semibold text-slate-700">Канал</th>
                      <th className="text-right px-5 py-3 font-semibold text-slate-700">Бюджет/мес</th>
                      <th className="text-right px-5 py-3 font-semibold text-slate-700">CAC</th>
                      <th className="text-right px-5 py-3 font-semibold text-slate-700">Семей/мес</th>
                      <th className="text-right px-5 py-3 font-semibold text-slate-700">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { channel: 'ВКонтакте таргет', budget: '₽20 000', cac: '₽450', families: '44', roi: '24×' },
                      { channel: 'Telegram Ads', budget: '₽10 000', cac: '₽500', families: '20', roi: '22×' },
                      { channel: 'Яндекс.Директ', budget: '₽20 000', cac: '₽750', families: '27', roi: '14×' },
                      { channel: 'Контент-маркетинг (SEO)', budget: '₽15 000', cac: '₽400', families: '38', roi: '27×' },
                      { channel: 'Партнёрства (клиники, школы)', budget: '₽10 000', cac: '₽270', families: '37', roi: '40×' },
                      { channel: 'YouTube Shorts / TikTok', budget: '₽5 000', cac: '₽200', families: '25', roi: '54×' },
                    ].map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="px-5 py-3 font-semibold text-slate-900">{row.channel}</td>
                        <td className="px-5 py-3 text-right text-slate-700">{row.budget}</td>
                        <td className="px-5 py-3 text-right text-slate-600">{row.cac}</td>
                        <td className="px-5 py-3 text-right font-bold text-blue-700">{row.families}</td>
                        <td className="px-5 py-3 text-right font-bold text-green-700">{row.roi}</td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-black">
                      <td className="px-5 py-3 text-slate-900">ИТОГО</td>
                      <td className="px-5 py-3 text-right text-slate-900">₽80 000</td>
                      <td className="px-5 py-3 text-right text-slate-700">₽423</td>
                      <td className="px-5 py-3 text-right text-blue-700">191</td>
                      <td className="px-5 py-3 text-right text-green-700">25,5×</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-slate-500">* ROI = LTV / CAC = ₽10 080 / CAC. Без учёта партнёрского канала ПСБ (+100–200 семей/мес при нулевом CAC)</div>
            </div>

            {/* Сценарии */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Сценарии роста (12 месяцев)</h3>
              <div className="grid grid-cols-3 gap-5">
                {[
                  {
                    name: 'Консервативный', color: 'bg-slate-50 border-slate-300', badge: 'bg-slate-500',
                    budget: '₽40 000/мес', families: '2 500', revenue: '~₽8,4 млн/год',
                    items: ['Только органика + контент', 'Партнёрства с клиниками', 'Без платной рекламы']
                  },
                  {
                    name: 'Базовый', color: 'bg-blue-50 border-blue-300', badge: 'bg-blue-600',
                    budget: '₽80 000/мес', families: '10 000', revenue: '~₽33,6 млн/год',
                    items: ['Все каналы планомерно', 'CAC ≈ ₽500 в среднем', 'Цель breakeven — месяц 8']
                  },
                  {
                    name: 'Агрессивный', color: 'bg-green-50 border-green-300', badge: 'bg-green-600',
                    budget: '₽200 000/мес', families: '25 000', revenue: '~₽84 млн/год',
                    items: ['Масштаб + мобильное приложение', 'Партнёрство с ПСБ активно', 'Инфлюенсеры + PR']
                  },
                ].map((sc, i) => (
                  <div key={i} className={`rounded-xl border-2 p-5 ${sc.color}`}>
                    <div className={`inline-block text-white text-xs font-bold px-2 py-1 rounded mb-3 ${sc.badge}`}>{sc.name}</div>
                    <div className="text-2xl font-black text-slate-900 mb-1">{sc.families}</div>
                    <div className="text-xs text-slate-500 mb-1">платящих семей</div>
                    <div className="text-lg font-black text-green-700 mb-3">{sc.revenue}</div>
                    <div className="text-xs text-slate-500 mb-3">бюджет {sc.budget}</div>
                    <ul className="space-y-1">{sc.items.map((it, j) => <li key={j} className="text-xs text-slate-700">· {it}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            KPI
        ══════════════════════════════════════════════ */}
        {active === 'kpi' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Метрики</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">KPI и система измерений</h2>
              <p className="text-slate-500">Ключевые показатели на март 2026 — март 2027</p>
            </div>

            {/* North Star */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-700 to-blue-700 text-white p-8 text-center">
              <div className="text-xs font-semibold tracking-widest text-indigo-200 uppercase mb-3">North Star Metric</div>
              <div className="text-5xl font-black mb-3">10 000</div>
              <div className="text-xl text-indigo-200">активных платящих семей к марту 2027</div>
              <div className="mt-4 text-sm text-indigo-300">Текущее значение: 51 семья → Рост: ×196</div>
            </div>

            {/* KPI таблицы */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'Привлечение', color: 'border-blue-200',
                  kpis: [
                    { metric: 'Новых регистраций/мес', now: '~30', target3: '1 000', target12: '3 000' },
                    { metric: 'CAC средний', now: '—', target3: '≤ ₽600', target12: '≤ ₽450' },
                    { metric: 'Охват/мес (показы)', now: '—', target3: '200 000', target12: '500 000' },
                    { metric: 'Органический трафик/мес', now: '—', target3: '5 000', target12: '20 000' },
                  ]
                },
                {
                  title: 'Активация', color: 'border-green-200',
                  kpis: [
                    { metric: 'Активация Day-7 (добавили семью)', now: '—', target3: '45%', target12: '55%' },
                    { metric: 'Приглашено членов/семья', now: '—', target3: '1,8', target12: '2,5' },
                    { metric: 'Заполнен профиль >50%', now: '—', target3: '30%', target12: '50%' },
                    { metric: 'Viral coefficient (рефералы)', now: '—', target3: '0,3', target12: '0,7' },
                  ]
                },
                {
                  title: 'Удержание', color: 'border-purple-200',
                  kpis: [
                    { metric: 'Retention D30', now: '—', target3: '40%', target12: '55%' },
                    { metric: 'Retention D90', now: '—', target3: '25%', target12: '40%' },
                    { metric: 'DAU/MAU', now: '—', target3: '15%', target12: '25%' },
                    { metric: 'Churn Rate/мес', now: '—', target3: '≤ 7%', target12: '≤ 4%' },
                  ]
                },
                {
                  title: 'Монетизация', color: 'border-amber-200',
                  kpis: [
                    { metric: 'Активных платящих семей', now: '0', target3: '300', target12: '10 000' },
                    { metric: 'Конверсия в активных платящих', now: '—', target3: '5%', target12: '28%' },
                    { metric: 'MRR (ежемес. выручка)', now: '₽0', target3: '~₽84K', target12: '~₽2,8M' },
                    { metric: 'ARR (годовая выручка)', now: '₽0', target3: '~₽1,0M', target12: '~₽33,6M' },
                  ]
                },
              ].map((group, i) => (
                <div key={i} className={`rounded-2xl border-2 bg-white p-6 ${group.color}`}>
                  <h3 className="font-black text-slate-900 mb-4">{group.title}</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500 uppercase">
                        <th className="text-left pb-2">Метрика</th>
                        <th className="text-right pb-2">Сейчас</th>
                        <th className="text-right pb-2">3 мес</th>
                        <th className="text-right pb-2">12 мес</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.kpis.map((row, j) => (
                        <tr key={j}>
                          <td className="py-2 text-slate-700">{row.metric}</td>
                          <td className="py-2 text-right text-slate-500">{row.now}</td>
                          <td className="py-2 text-right text-blue-700 font-semibold">{row.target3}</td>
                          <td className="py-2 text-right text-green-700 font-bold">{row.target12}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h3 className="text-xl font-black text-slate-900 mb-4">Дашборд метрик — еженедельный мониторинг</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { tool: 'Яндекс.Метрика', purpose: 'Трафик, конверсии, воронка сайта', free: true },
                  { tool: 'PostHog', purpose: 'Product analytics, retention, user paths', free: true },
                  { tool: 'ВК Ads / Яндекс', purpose: 'Эффективность рекламных кампаний', free: false },
                  { tool: 'Google Sheets', purpose: 'Сводный дашборд KPI, MRR, CAC', free: true },
                ].map((t, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4">
                    <div className="font-bold text-slate-900 mb-1">{t.tool}</div>
                    <div className="text-xs text-slate-600 mb-2">{t.purpose}</div>
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded inline-block ${t.free ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {t.free ? 'Бесплатно' : 'Платно'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            РОАДМАП
        ══════════════════════════════════════════════ */}
        {active === 'roadmap' && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Дорожная карта</div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Маркетинговый роадмап</h2>
              <p className="text-slate-500">Поквартальный план действий, март 2026 — март 2027</p>
            </div>

            <div className="space-y-5">
              {[
                {
                  period: 'Q1 2026 · Март – Май', subtitle: 'Фундамент и первые 300 платящих семей',
                  color: 'border-blue-400 bg-blue-50', badge: 'bg-blue-600', status: 'Старт 05.03.2026',
                  target: '300 активных платящих семей · MRR ~₽84K',
                  actions: [
                    { cat: 'Продукт', items: ['Настроить аналитику (PostHog, Яндекс.Метрика)', 'Доработать онбординг: первые 7 дней пользователя', 'Запустить реферальную программу (бонус на кошелёк за друга)', 'Email-цепочка: 5 писем за 7 дней после регистрации'] },
                    { cat: 'Каналы', items: ['Запустить ВКонтакте таргет (₽20K/мес)', 'Развивать MAX-канал «Наша Семья», первые 50 постов', 'Партнёрство с 3–5 детскими клиниками', '4 SEO-статьи в блог'] },
                    { cat: 'Контент', items: ['Снять 8 YouTube Shorts / TikTok (демо функций)', 'Подготовить кейсы первых пользователей', 'Запустить конкурс «Семья месяца»'] },
                  ]
                },
                {
                  period: 'Q2 2026 · Июнь – Август', subtitle: 'Масштаб и 2 000 платящих семей',
                  color: 'border-purple-400 bg-purple-50', badge: 'bg-purple-600', status: 'Планируется',
                  target: '2 000 активных платящих семей · MRR ~₽560K',
                  actions: [
                    { cat: 'Продукт', items: ['Запуск iOS-приложения (App Store)', 'Push-уведомления — напоминания, дайджест', 'A/B тест ценообразования: +20% к конверсии'] },
                    { cat: 'Каналы', items: ['Масштаб ВКонтакте до ₽40K/мес (Look-alike)', 'Запуск Яндекс.Директ поиск (₽20K/мес)', 'Инфлюенсер-маркетинг: 3–5 мам-блогеров (бартер)', 'Первые переговоры с Банком ПСБ'] },
                    { cat: 'PR', items: ['Публикация в Т—Ж / VC.ru / Forbes Woman', 'Участие в выставке «Мать и дитя» или «Kids Russia»', 'Комментарии эксперта в СМИ (тема семья + ИИ)'] },
                  ]
                },
                {
                  period: 'Q3 2026 · Сентябрь – Ноябрь', subtitle: 'B2B и 5 000 платящих семей',
                  color: 'border-green-400 bg-green-50', badge: 'bg-green-600', status: 'Планируется',
                  target: '5 000 активных платящих семей · MRR ~₽1,4M · Breakeven',
                  actions: [
                    { cat: 'B2B', items: ['Корпоративный тариф: «соцпакет для сотрудников»', 'Пилот с 2–3 работодателями (500+ семей)', 'Партнёрство со страховыми (ДМС + платформа)'] },
                    { cat: 'Каналы', items: ['Запуск Android-приложения (Google Play)', 'Пилот с Банком ПСБ — 50K push семьям военных', 'Масштаб всех каналов ×2, бюджет ₽160K/мес'] },
                    { cat: 'Контент', items: ['Подкаст «Счастливая семья» (Яндекс.Музыка)', 'YouTube-канал: длинные форматы 10+ минут', 'Email-рассылка 10K+ подписчиков'] },
                  ]
                },
                {
                  period: 'Q4 2026 · Декабрь – Март 2027', subtitle: 'Series A-ready: 10 000 платящих семей',
                  color: 'border-amber-400 bg-amber-50', badge: 'bg-amber-600', status: 'Планируется',
                  target: '10 000 активных платящих семей · MRR ~₽2,8M · ARR ~₽33,6M',
                  actions: [
                    { cat: 'Стратегия', items: ['Подготовка к Series A (инвест. дек, due diligence)', 'Переговоры с Казахстаном/Беларусью (пилот)', 'Оценка стратегической продажи или раунда'] },
                    { cat: 'Каналы', items: ['Новогодняя кампания: «Подари семье порядок»', 'ТВ-реклама / OLV (при бюджете ₽500K+)', 'Активный PR: интервью основателя в Forbes, РБК'] },
                    { cat: 'Продукт', items: ['ИИ-ассистент v2.0 с персональными советами', 'Интеграция с Госуслугами (льготы, документы)', 'Marketplace партнёров (психологи, нутрициологи)'] },
                  ]
                },
              ].map((q, i) => (
                <div key={i} className={`rounded-2xl border-2 p-6 ${q.color}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <div className={`inline-block text-white text-xs font-bold px-3 py-1 rounded-lg mb-2 ${q.badge}`}>{q.period}</div>
                      <h3 className="text-xl font-black text-slate-900">{q.subtitle}</h3>
                      <div className="text-sm text-slate-500 mt-1">{q.status}</div>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-3 shadow-sm text-sm font-bold text-slate-800">{q.target}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {q.actions.map((block, j) => (
                      <div key={j}>
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-2">{block.cat}</div>
                        <ul className="space-y-1.5">
                          {block.items.map((it, k) => (
                            <li key={k} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="text-slate-400 flex-shrink-0 mt-0.5">→</span>{it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Заглушки для остальных вкладок через overview */}
        {(active === 'funnel' || active === 'content') && active !== 'funnel' && active !== 'content' && (
          <div className="text-center py-20 text-slate-400">Раздел в разработке</div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-4 pb-8">
          «Наша Семья» · Маркетинговая стратегия v1.0 · 05.03.2026 · Конфиденциально
        </div>
      </div>

    </div>
  );
}