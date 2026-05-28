import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import FamilyIdCard, { generateFamilyCode } from '@/components/family-id/FamilyIdCard';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoModeContext';

interface FamilyInfo {
  familyName: string;
  familyId: string;
  logoUrl: string;
  membersCount: number;
  foundedYear: number;
  motto: string;
}

const CONNECTIONS = [
  { icon: 'GitBranch', label: 'Семейное древо', desc: 'Все ветви рода', path: '/tree',              color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  delay: 0   },
  { icon: 'BookImage', label: 'Альбом памяти',  desc: 'История в фото', path: '/memory',            color: 'text-pink-500',   bg: 'bg-pink-50',   border: 'border-pink-200',   delay: 90  },
  { icon: 'Route',     label: 'Дорога жизни',   desc: 'Путь каждого',   path: '/life-road',         color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', delay: 180 },
  { icon: 'Users',     label: 'Члены семьи',    desc: 'Профили близких', path: '/family-management', color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   delay: 270 },
];

const WHAT_IS_ID = [
  { icon: 'Key',      color: 'text-violet-600', bg: 'bg-violet-50', title: 'Ключ к наследию рода',       desc: 'Один код открывает всю память семьи: древо, альбом, дорогу жизни и профили близких' },
  { icon: 'GitBranch',color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Связь поколений',          desc: 'Передайте код детям и внукам — они получат доступ к истории рода и продолжат её' },
  { icon: 'UserPlus', color: 'text-blue-600',   bg: 'bg-blue-50',   title: 'Объединение родственников',  desc: 'По этому коду дальние родственники присоединяются к древу и становятся частью общей истории' },
  { icon: 'Shield',   color: 'text-amber-600',  bg: 'bg-amber-50',  title: 'Безопасность',               desc: 'ID принадлежит только вашей семье. Никто не получит доступ без вашего разрешения' },
];

const HOW_TO_USE = [
  { step: '1', text: 'Нажмите «Пригласить родственника»',      icon: 'Share2'    },
  { step: '2', text: 'Система отправит ссылку с вашим кодом', icon: 'Send'      },
  { step: '3', text: 'Родственник регистрируется по ссылке',  icon: 'UserPlus'  },
  { step: '4', text: 'Новая ветвь появляется в древе рода',   icon: 'GitBranch' },
];

export default function FamilyId() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();

  const [info, setInfo] = useState<FamilyInfo>({
    familyName: 'Наша Семья',
    familyId: 'demo_family_1',
    logoUrl: '',
    membersCount: 4,
    foundedYear: new Date().getFullYear(),
    motto: 'Вместе — сильнее',
  });
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [linesVisible, setLinesVisible] = useState(false);
  const [chipsVisible, setChipsVisible] = useState([false, false, false, false]);

  // refs для SVG-линий
  const svgRef = useRef<SVGSVGElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [chipCenters, setChipCenters] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    try {
      const ud = localStorage.getItem('userData');
      if (ud) {
        const p = JSON.parse(ud);
        setInfo(prev => ({
          ...prev,
          familyId: p.family_id || p.familyId || prev.familyId,
          familyName: p.family_name || p.familyName || prev.familyName,
          logoUrl: p.logo_url || p.logoUrl || prev.logoUrl,
        }));
      }
      const fn = localStorage.getItem('familyName');
      if (fn) setInfo(prev => ({ ...prev, familyName: fn }));
      const fl = localStorage.getItem('familyLogo');
      if (fl) setInfo(prev => ({ ...prev, logoUrl: fl }));
      const m = localStorage.getItem('familyMotto');
      if (m) setInfo(prev => ({ ...prev, motto: m }));
    } catch { /* ignore */ }
  }, []);

  // Каскадная анимация появления
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setLinesVisible(true), 500);
    const timers = CONNECTIONS.map((c, i) =>
      setTimeout(() => {
        setChipsVisible(prev => { const n = [...prev]; n[i] = true; return n; });
      }, 550 + c.delay)
    );
    return () => { clearTimeout(t1); clearTimeout(t2); timers.forEach(clearTimeout); };
  }, []);

  // Позиции чипов для SVG-линий
  useEffect(() => {
    if (!linesVisible) return;
    const svg = svgRef.current;
    if (!svg) return;
    const svgRect = svg.getBoundingClientRect();
    const centers = chipRefs.current.map(ref => {
      if (!ref) return { x: 0, y: 0 };
      const r = ref.getBoundingClientRect();
      return {
        x: (r.left + r.width / 2) - svgRect.left,
        y: (r.top + r.height / 2) - svgRect.top,
      };
    });
    setChipCenters(centers);
  }, [linesVisible, chipsVisible]);

  const displayInfo = isDemoMode
    ? { familyName: 'Кузнецовы', familyId: 'demo_family_1', logoUrl: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/optimized/logo-36.webp', membersCount: 4, foundedYear: 2009, motto: 'Вместе — сильнее. Любовь — наша опора.' }
    : info;

  const code = generateFamilyCode(displayInfo.familyId);

  const handleShare = async () => {
    const text = `Присоединяйся к семье «${displayInfo.familyName}» в «Наша Семья».\n\nСемейный ID: ${code}\n\nnasha-semiya.ru`;
    if (navigator.share) {
      try { await navigator.share({ title: `Семья ${displayInfo.familyName}`, text }); } catch { /* отменено */ }
    } else {
      try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* ignore */ }
    }
  };

  return (
    <SectionPageFrame
      title="Семейный ID"
      backPath="/"
      variant="light"
      width="normal"
      backgroundClass="bg-gradient-to-br from-violet-50 via-white to-purple-50"
    >
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Заголовок */}
        <div
          className="text-center transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(12px)' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-3">
            <Icon name="Fingerprint" size={15} />
            Цифровой паспорт семьи
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Семейный ID</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            Один код, который связывает память семьи, древо рода и доступ для близких.
          </p>
        </div>

        {/* Карточка */}
        <div
          className="transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.93)',
            transitionDelay: '100ms',
          }}
        >
          <FamilyIdCard
            familyName={displayInfo.familyName}
            familyId={displayInfo.familyId}
            logoUrl={displayInfo.logoUrl}
            membersCount={displayInfo.membersCount}
            foundedYear={displayInfo.foundedYear}
            motto={displayInfo.motto}
          />
        </div>

        {/* ── Блок связей: «Этот ID открывает» ── */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '350ms' }}
        >
          <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Этот ID открывает доступ к
          </p>

          {/* Обёртка с SVG-линиями поверх чипов */}
          <div className="relative">
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {chipCenters.map((to, i) => {
                if (!svgRef.current) return null;
                const svgRect = svgRef.current.getBoundingClientRect();
                const cx = svgRect.width / 2;
                const cy = 0;
                const len = Math.sqrt((to.x - cx) ** 2 + (to.y - cy) ** 2);
                return (
                  <line key={i}
                    x1={cx} y1={cy} x2={to.x} y2={to.y}
                    stroke="url(#lg1)"
                    strokeWidth="1.5"
                    strokeDasharray={len}
                    strokeDashoffset={linesVisible ? 0 : len}
                    style={{ transition: `stroke-dashoffset 0.65s ease ${300 + CONNECTIONS[i].delay}ms` }}
                  />
                );
              })}
            </svg>

            {/* Пульсирующий центр */}
            <div className="flex justify-center mb-4 relative z-10">
              <div style={{ opacity: linesVisible ? 1 : 0, transition: 'opacity 0.4s ease 250ms' }}>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-50" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/40" />
                </span>
              </div>
            </div>

            {/* 4 чипа */}
            <div className="grid grid-cols-2 gap-2.5 relative z-10">
              {CONNECTIONS.map((item, i) => (
                <div
                  key={item.path}
                  ref={el => { chipRefs.current[i] = el; }}
                  className="transition-all duration-500"
                  style={{
                    opacity: chipsVisible[i] ? 1 : 0,
                    transform: chipsVisible[i] ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(10px)',
                  }}
                >
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center gap-2.5 p-3 rounded-xl border ${item.border} ${item.bg} hover:shadow-md transition-all text-left group`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon name={item.icon as 'Users'} size={16} className={item.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-gray-800 leading-tight">{item.label}</div>
                      <div className="text-[11px] text-gray-400 leading-tight mt-0.5">{item.desc}</div>
                    </div>
                    <Icon name="ChevronRight" size={13} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div
          className="grid grid-cols-2 gap-3 transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '500ms' }}
        >
          <Button
            onClick={handleShare}
            className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white gap-2"
          >
            <Icon name={copied ? 'Check' : 'UserPlus'} size={16} />
            {copied ? 'Скопировано!' : 'Пригласить'}
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="border-violet-200 text-violet-700 hover:bg-violet-50 gap-2"
          >
            <Icon name="Share2" size={16} />
            Поделиться ID
          </Button>
        </div>

        {/* Что открывает ID */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '580ms' }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="HelpCircle" size={18} className="text-violet-500" />
            Что открывает Семейный ID?
          </h2>
          <div className="space-y-3">
            {WHAT_IS_ID.map(item => (
              <div key={item.title} className="flex gap-3 p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                <div className={`w-9 h-9 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon name={item.icon as 'Key'} size={18} className={item.color} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Как подключить родственника */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '640ms' }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Zap" size={18} className="text-amber-500" />
            Как подключить родственника?
          </h2>
          <div className="relative">
            <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-violet-400 via-purple-200 to-violet-100" />
            <div className="space-y-3">
              {HOW_TO_USE.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pl-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md z-10">
                    <Icon name={item.icon as 'Send'} size={16} className="text-white" />
                  </div>
                  <div className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wide">Шаг {item.step}</span>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </SectionPageFrame>
  );
}
