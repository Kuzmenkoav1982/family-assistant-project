import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import FamilyIdCard, { generateFamilyCode } from '@/components/family-id/FamilyIdCard';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { useDemoMode } from '@/contexts/DemoModeContext';

const INVITE_API = 'https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d';
const BASE_URL = 'https://nasha-semiya.ru';

interface FamilyInfo {
  familyName: string;
  familyId: string;
  logoUrl: string;
  membersCount: number;
  foundedYear: number;
  motto: string;
}

const CONNECTIONS = [
  { icon: 'GitBranch', label: 'Семейное древо', desc: 'Все ветви рода',    path: '/tree',              color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200',  delay: 0   },
  { icon: 'BookImage', label: 'Альбом памяти',  desc: 'История в фото',   path: '/memory',            color: 'text-pink-500',   bg: 'bg-pink-50',   border: 'border-pink-200',   delay: 90  },
  { icon: 'Route',     label: 'Дорога жизни',   desc: 'Путь каждого',     path: '/life-road',         color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', delay: 180 },
  { icon: 'Users',     label: 'Члены семьи',    desc: 'Профили близких',  path: '/family-management', color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200',   delay: 270 },
];

const WHAT_IS_ID = [
  { icon: 'Fingerprint', color: 'text-violet-600', bg: 'bg-violet-50', title: 'Идентификатор семьи',      desc: 'Уникальный код, который идентифицирует вашу семью в системе. Постоянный — не меняется.' },
  { icon: 'UserPlus',    color: 'text-blue-600',   bg: 'bg-blue-50',   title: 'Объединение родственников', desc: 'Близкие могут присоединиться к семье по ссылке-приглашению — отдельному временному коду доступа.' },
  { icon: 'Shield',      color: 'text-amber-600',  bg: 'bg-amber-50',  title: 'Безопасность',              desc: 'Сам по себе Family ID не даёт доступа к данным. Для вступления нужна отдельная ссылка-приглашение.' },
  { icon: 'GitBranch',   color: 'text-emerald-600',bg: 'bg-emerald-50',title: 'Передача истории',          desc: 'Передайте ID детям и внукам — они найдут вашу семью и смогут запросить доступ.' },
];

const HOW_TO_INVITE = [
  { step: '1', text: 'Нажмите «Пригласить» — система создаст ссылку',         icon: 'Share2'   },
  { step: '2', text: 'Скопируйте ссылку и отправьте родственнику',            icon: 'Send'     },
  { step: '3', text: 'Родственник регистрируется и присоединяется к семье',   icon: 'UserPlus' },
  { step: '4', text: 'После этого вы сможете добавить его в семейное древо',  icon: 'GitBranch'},
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
  const [inviteState, setInviteState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [linesVisible, setLinesVisible] = useState(false);
  const [chipsVisible, setChipsVisible] = useState([false, false, false, false]);

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

  const handleCreateInvite = async () => {
    if (isDemoMode) {
      const demoLink = `${BASE_URL}/register?code=DEMO1234`;
      setInviteLink(demoLink);
      setInviteState('done');
      return;
    }
    setInviteState('loading');
    try {
      const token = localStorage.getItem('authToken') || '';
      const res = await fetch(INVITE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ action: 'create', max_uses: 1, days_valid: 7 }),
      });
      const data = await res.json();
      if (data.success && data.invite?.code) {
        const link = `${BASE_URL}/register?code=${data.invite.code}`;
        setInviteLink(link);
        setInviteState('done');
      } else {
        setInviteState('error');
      }
    } catch {
      setInviteState('error');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Присоединяйся к семье «${displayInfo.familyName}»`,
          text: `Привет! Присоединяйся к нашей семье в «Наша Семья»:`,
          url: inviteLink,
        });
      } catch { /* отменено */ }
    } else {
      handleCopyLink();
    }
  };

  const handleReset = () => {
    setInviteState('idle');
    setInviteLink('');
    setCopied(false);
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
            Уникальный идентификатор вашей семьи. Для приглашения родственников используйте отдельную ссылку-приглашение.
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

        {/* Блок связей */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '350ms' }}
        >
          <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Семейное пространство включает
          </p>
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
                const cy = svgRect.height / 2;
                if (!to.x && !to.y) return null;
                return (
                  <line
                    key={i}
                    x1={cx} y1={cy} x2={to.x} y2={to.y}
                    stroke="url(#lg1)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    style={{
                      opacity: linesVisible && chipsVisible[i] ? 0.6 : 0,
                      transition: `opacity 0.5s ease ${150 + i * 80}ms`,
                    }}
                  />
                );
              })}
            </svg>
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

        {/* Блок приглашения */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '500ms' }}
        >
          {inviteState === 'idle' && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleCreateInvite}
                className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white gap-2"
              >
                <Icon name="UserPlus" size={16} />
                Пригласить
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/family-invite')}
                className="border-violet-200 text-violet-700 hover:bg-violet-50 gap-2"
              >
                <Icon name="Settings2" size={16} />
                Все приглашения
              </Button>
            </div>
          )}

          {inviteState === 'loading' && (
            <div className="flex items-center justify-center gap-2 py-3 text-violet-600 text-sm font-medium">
              <Icon name="Loader" size={16} className="animate-spin" />
              Создаём ссылку-приглашение…
            </div>
          )}

          {inviteState === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <Icon name="AlertCircle" size={18} className="text-red-500 flex-shrink-0" />
              <div className="flex-1 text-sm text-red-700">Не удалось создать приглашение. Попробуйте снова.</div>
              <button onClick={handleReset} className="text-xs text-red-500 underline">Снова</button>
            </div>
          )}

          {inviteState === 'done' && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-violet-700 text-sm font-semibold">
                <Icon name="CheckCircle" size={16} className="text-emerald-500" />
                Ссылка создана — действует 7 дней
              </div>
              <div className="bg-white border border-violet-100 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono break-all">
                {inviteLink}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" onClick={handleCopyLink} className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5">
                  <Icon name={copied ? 'Check' : 'Copy'} size={14} />
                  {copied ? 'Скопировано!' : 'Скопировать'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleNativeShare} className="border-violet-200 text-violet-700 gap-1.5">
                  <Icon name="Share2" size={14} />
                  Поделиться
                </Button>
              </div>
              <button onClick={handleReset} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Создать новую ссылку
              </button>
            </div>
          )}
        </div>

        {/* Что такое Family ID */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '580ms' }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="HelpCircle" size={18} className="text-violet-500" />
            Что такое Семейный ID?
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

        {/* Как пригласить */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '640ms' }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Zap" size={18} className="text-amber-500" />
            Как пригласить родственника?
          </h2>
          <div className="relative">
            <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-violet-400 via-purple-200 to-violet-100" />
            <div className="space-y-3">
              {HOW_TO_INVITE.map((item, i) => (
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
          <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
            После вступления родственника вы сможете вручную добавить его в семейное древо и указать родство.
          </p>
        </div>

      </div>
    </SectionPageFrame>
  );
}
