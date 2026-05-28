import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import FamilyIdCard from '@/components/family-id/FamilyIdCard';
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

function generateFamilyCode(id: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  let code = '';
  let n = Math.abs(hash);
  for (let i = 0; i < 8; i++) {
    code += chars[n % chars.length];
    n = Math.floor(n / chars.length) + (i * 7919);
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
}

const WHAT_IS_ID = [
  { icon: 'Key', color: 'text-violet-600', bg: 'bg-violet-50', title: 'Ключ доступа', desc: 'Единый код, по которому родственники могут присоединиться к вашей семье в системе' },
  { icon: 'GitBranch', color: 'text-emerald-600', bg: 'bg-emerald-50', title: 'Связь поколений', desc: 'Один код объединяет всё дерево: прошлое, настоящее и будущее вашего рода' },
  { icon: 'BookOpen', color: 'text-amber-600', bg: 'bg-amber-50', title: 'Передача наследия', desc: 'Передайте код детям и внукам — и они получат доступ ко всей истории семьи' },
  { icon: 'Shield', color: 'text-blue-600', bg: 'bg-blue-50', title: 'Безопасность', desc: 'ID уникален и принадлежит только вашей семье. Никто другой не может им воспользоваться без разрешения' },
];

const HOW_TO_USE = [
  { step: '1', text: 'Скопируйте Семейный ID', icon: 'Copy' },
  { step: '2', text: 'Поделитесь с родственниками', icon: 'Share2' },
  { step: '3', text: 'Они вводят код при регистрации', icon: 'UserPlus' },
  { step: '4', text: 'Семья объединена в одной системе', icon: 'Users' },
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
  const cardRef = useRef<HTMLDivElement>(null);

  // Анимация появления карточки
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      const ud = localStorage.getItem('userData');
      if (ud) {
        const parsed = JSON.parse(ud);
        setInfo(prev => ({
          ...prev,
          familyId: parsed.family_id || parsed.familyId || prev.familyId,
          familyName: parsed.family_name || parsed.familyName || prev.familyName,
          logoUrl: parsed.logo_url || parsed.logoUrl || prev.logoUrl,
        }));
      }
      const fn = localStorage.getItem('familyName');
      if (fn) setInfo(prev => ({ ...prev, familyName: fn }));
      const fl = localStorage.getItem('familyLogo');
      if (fl) setInfo(prev => ({ ...prev, logoUrl: fl }));
      const motto = localStorage.getItem('familyMotto');
      if (motto) setInfo(prev => ({ ...prev, motto }));
    } catch { /* ignore */ }
  }, []);

  // Демо-данные — перекрываем после загрузки
  const displayInfo = isDemoMode ? {
    familyName: 'Кузнецовы',
    familyId: 'demo_family_1',
    logoUrl: 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/optimized/logo-36.webp',
    membersCount: 4,
    foundedYear: 2009,
    motto: 'Вместе — сильнее. Любовь — наша опора.',
  } : info;

  const code = generateFamilyCode(displayInfo.familyId);

  const handleShare = async () => {
    const shareText = `Семейный ID: ${code}\n\nПрисоединяйся к нашей семье «${displayInfo.familyName}» в приложении «Наша Семья» → nasha-semiya.ru`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Семейный ID — ${displayInfo.familyName}`, text: shareText });
      } catch { /* отменено */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch { /* ignore */ }
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
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">

        {/* Заголовок */}
        <div
          className="text-center transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
            <Icon name="Fingerprint" size={15} />
            Уникальный идентификатор семьи
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Семейный ID
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            Ключ к истории вашей семьи. Один код — вся память, структура и путь рода.
          </p>
        </div>

        {/* Карточка с анимацией */}
        <div
          ref={cardRef}
          className="transition-all duration-700 ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? 'translateY(0) scale(1) rotateX(0deg)'
              : 'translateY(32px) scale(0.92) rotateX(6deg)',
            transitionDelay: '120ms',
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

        {/* Кнопки действий */}
        <div
          className="grid grid-cols-2 gap-3 transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transitionDelay: '280ms' }}
        >
          <Button
            onClick={handleShare}
            className="bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white gap-2"
          >
            <Icon name={copied ? 'Check' : 'Share2'} size={16} />
            {copied ? 'Скопировано!' : 'Поделиться'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/tree')}
            className="border-violet-200 text-violet-700 hover:bg-violet-50 gap-2"
          >
            <Icon name="GitBranch" size={16} />
            Открыть древо
          </Button>
        </div>

        {/* Что такое Семейный ID */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '380ms' }}
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

        {/* Как использовать */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '450ms' }}
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Icon name="Zap" size={18} className="text-amber-500" />
            Как пригласить родственника?
          </h2>
          <div className="relative">
            <div className="absolute left-[18px] top-5 bottom-5 w-0.5 bg-gradient-to-b from-violet-300 via-purple-200 to-violet-100" />
            <div className="space-y-3">
              {HOW_TO_USE.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pl-1">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md z-10">
                    <Icon name={item.icon as 'Copy'} size={16} className="text-white" />
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

        {/* Связанные разделы */}
        <div
          className="transition-all duration-500"
          style={{ opacity: visible ? 1 : 0, transitionDelay: '520ms' }}
        >
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Связанные разделы</h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: 'GitBranch', label: 'Семейное древо', path: '/tree', color: 'text-amber-600', bg: 'bg-amber-50' },
              { icon: 'BookImage', label: 'Альбом памяти', path: '/memory', color: 'text-pink-600', bg: 'bg-pink-50' },
              { icon: 'Route', label: 'Дорога жизни', path: '/life-road', color: 'text-violet-600', bg: 'bg-violet-50' },
              { icon: 'Users', label: 'Члены семьи', path: '/family-management', color: 'text-blue-600', bg: 'bg-blue-50' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-left"
              >
                <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center`}>
                  <Icon name={item.icon as 'Users'} size={16} className={item.color} />
                </div>
                <span className="text-sm font-medium text-gray-800 leading-tight">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </SectionPageFrame>
  );
}
