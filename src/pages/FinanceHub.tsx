import { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceHubInstructions } from '@/components/finance/FinanceInstructions';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import type { Modality } from '@/components/hub/ModalityBadge';
import type { CardStatus } from '@/components/hub/StatusBadge';

interface SubSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  path: string;
  modality: Modality;
  status: CardStatus;
  isNew?: boolean;
  group: 'analysis' | 'accounting' | 'goals' | 'protection' | 'service';
  cta?: string;
}

const subSections: SubSection[] = [
  // Анализ и стратегия
  { id: 'analytics', title: 'Финансовый пульс', description: 'Анализ здоровья финансов, ИИ-рекомендации, прогнозы', icon: 'Activity',  iconColor: 'text-violet-600', iconBg: 'bg-violet-50 dark:bg-violet-950/40', path: '/finance/analytics', modality: 'ai',      status: 'new', isNew: true, group: 'analysis', cta: 'Открыть' },
  { id: 'strategy',  title: 'Стратегия погашения', description: 'Лавина, снежный ком — сравни стратегии и симулятор «Что если?»', icon: 'Swords',  iconColor: 'text-orange-600', iconBg: 'bg-orange-50 dark:bg-orange-950/40', path: '/finance/strategy', modality: 'ai', status: 'new', isNew: true, group: 'analysis', cta: 'Открыть' },
  { id: 'cashflow',  title: 'Кэш-флоу прогноз', description: 'Прогноз движения денег на 24 месяца и кассовые разрывы', icon: 'TrendingUp', iconColor: 'text-teal-600', iconBg: 'bg-teal-50 dark:bg-teal-950/40', path: '/finance/cashflow', modality: 'ai', status: 'new', isNew: true, group: 'analysis', cta: 'Открыть' },

  // Учёт
  { id: 'budget',    title: 'Бюджет', description: 'Доходы, расходы, аналитика по категориям и лимиты', icon: 'PieChart', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-950/40', path: '/finance/budget', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },
  { id: 'accounts',  title: 'Счета и карты', description: 'Банковские карты, счета и наличные — все балансы вместе', icon: 'CreditCard', iconColor: 'text-blue-600', iconBg: 'bg-blue-50 dark:bg-blue-950/40', path: '/finance/accounts', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },
  { id: 'debts',     title: 'Кредиты и долги', description: 'Ипотека, кредиты, займы — остатки, графики, переплаты', icon: 'Receipt', iconColor: 'text-rose-600', iconBg: 'bg-rose-50 dark:bg-rose-950/40', path: '/finance/debts', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },
  { id: 'assets',    title: 'Имущество', description: 'Недвижимость, транспорт, техника — учёт и стоимость активов', icon: 'Home', iconColor: 'text-sky-600', iconBg: 'bg-sky-50 dark:bg-sky-950/40', path: '/finance/assets', modality: 'service', status: 'ready', group: 'accounting', cta: 'Открыть' },

  // Цели и обучение
  { id: 'goals',     title: 'Финансовые цели', description: 'Накопления на мечту: квартира, машина, отпуск, образование', icon: 'Target', iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-950/40', path: '/finance/goals', modality: 'service', status: 'ready', group: 'goals', cta: 'Открыть' },
  { id: 'literacy',  title: 'Финансовая грамотность', description: 'Обучение для всей семьи: курсы, тесты и задания по возрастам', icon: 'GraduationCap', iconColor: 'text-purple-600', iconBg: 'bg-purple-50 dark:bg-purple-950/40', path: '/finance/literacy', modality: 'content', status: 'ready', group: 'goals', cta: 'Открыть' },

  // Защита
  { id: 'antiscam',  title: 'Антимошенник', description: 'База мошеннических схем, проверка ссылок и тревожная кнопка', icon: 'ShieldAlert', iconColor: 'text-rose-700', iconBg: 'bg-rose-50 dark:bg-rose-950/40', path: '/finance/antiscam', modality: 'service', status: 'recommended', group: 'protection', cta: 'Открыть' },

  // Сервис
  { id: 'loyalty',   title: 'Скидочные карты', description: 'Карты лояльности магазинов, аптек, АЗС — вся семья видит все карты', icon: 'Ticket', iconColor: 'text-pink-600', iconBg: 'bg-pink-50 dark:bg-pink-950/40', path: '/finance/loyalty', modality: 'service', status: 'ready', group: 'service', cta: 'Открыть' },
  { id: 'wallet',    title: 'Кошелёк сервиса', description: 'Баланс для ИИ-функций: диета, рецепты, открытки, рекомендации', icon: 'Wallet', iconColor: 'text-cyan-600', iconBg: 'bg-cyan-50 dark:bg-cyan-950/40', path: '/wallet', modality: 'service', status: 'ready', group: 'service', cta: 'Открыть' },
];

const OWNER_ONLY_SECTIONS = ['budget', 'debts', 'accounts', 'recurring', 'assets', 'analytics', 'strategy', 'cashflow'];

const GROUPS: { id: SubSection['group']; title: string; subtitle: string }[] = [
  { id: 'analysis',   title: 'Анализ и стратегия', subtitle: 'Картина и прогнозы' },
  { id: 'accounting', title: 'Учёт',               subtitle: 'Деньги, балансы, обязательства' },
  { id: 'goals',      title: 'Цели и обучение',    subtitle: 'Куда двигаемся и что учим' },
  { id: 'protection', title: 'Защита',             subtitle: 'Безопасность семейных финансов' },
  { id: 'service',    title: 'Сервис',             subtitle: 'Дополнительные инструменты' },
];

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

export default function FinanceHub() {
  const navigate = useNavigate();
  const isOwner = useIsFamilyOwner();
  const [showAI, setShowAI] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const askAI = async (question?: string) => {
    setAiLoading(true);
    setAiAdvice('');
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action: 'ai_advice', question: question || aiQuestion || '' }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiAdvice(data.advice || 'Нет рекомендаций');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Ошибка ИИ');
      }
    } catch {
      toast.error('Ошибка соединения');
    }
    setAiLoading(false);
  };

  const visibleSections = subSections.filter(s => isOwner || !OWNER_ONLY_SECTIONS.includes(s.id));

  return (
    <>
      <SEOHead
        title="Финансы — центр управления семейным бюджетом"
        description="Бюджет, счета, кредиты, финансовые цели, имущество, скидочные карты. Всё для финансового благополучия семьи."
        path="/finance"
        breadcrumbs={[{ name: 'Финансы', path: '/finance' }]}
      />
      <HubLayoutV2
        title="Финансы"
        subtitle="Операционный хаб — Цикл: Сбор → Панорама → Исполнение"
        description="Бюджет, счета, кредиты, цели и защита. Всё для финансового благополучия семьи."
        icon="Wallet"
        iconColor="text-emerald-600"
        iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        modalities={['service', 'ai']}
        cycleHint="Связан с Домом, Покупками, Питанием — расходы стекаются сюда"
        backgroundClass="bg-gradient-to-b from-emerald-50 via-green-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',  value: visibleSections.length, icon: 'LayoutGrid' },
          { label: 'Защита',    value: 'Шифрование',           icon: 'ShieldCheck' },
          { label: 'Доступ',    value: isOwner ? 'Полный' : 'Член семьи', icon: 'KeyRound' },
          { label: 'Помощник',  value: 'ИИ-советник',          icon: 'BrainCircuit' },
        ]}
        primaryAction={{
          label: 'Финансовый пульс',
          icon: 'Activity',
          onClick: () => navigate('/finance/analytics'),
        }}
        secondaryAction={{
          label: 'Спросить ИИ',
          icon: 'BrainCircuit',
          onClick: () => { setShowAI(true); if (!aiAdvice) askAI(); },
        }}
        relatedLinks={[
          { label: 'Дом',       icon: 'Building',     path: '/home-hub' },
          { label: 'Покупки',   icon: 'ShoppingCart', path: '/shopping' },
          { label: 'Питание',   icon: 'Apple',        path: '/nutrition' },
          { label: 'Госуслуги', icon: 'Landmark',     path: '/state-hub' },
        ]}
      >
        <FinanceHubInstructions />

        <details className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent border border-emerald-200/50 group/privacy">
          <summary className="flex items-center gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Icon name="Shield" size={16} className="text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-800 flex-1">Безопасность и доступ к данным</p>
            <Icon name="ChevronDown" size={16} className="text-emerald-500 transition-transform group-open/privacy:rotate-180" />
          </summary>
          <div className="px-4 pb-4 pl-[3.75rem] space-y-1.5">
            <p className="text-xs text-emerald-600/80">
              Финансовая информация не передаётся третьим лицам и хранится в зашифрованном виде.
            </p>
            <div className="text-xs text-emerald-700/70 space-y-0.5">
              <p className="font-medium text-emerald-800/80">Доступ только у владельца семьи:</p>
              <p>Бюджет, Счета и карты, Кредиты и долги, Регулярные платежи, Имущество, Аналитика, Стратегия погашения, Прогноз кэшфлоу</p>
              <p className="font-medium text-emerald-800/80 mt-1">Доступ для всех членов семьи:</p>
              <p>Финансовые цели, Грамотность, Скидочные карты, Антимошенник</p>
            </div>
          </div>
        </details>

        {GROUPS.map(group => {
          const items = visibleSections.filter(s => s.group === group.id);
          if (items.length === 0) return null;
          return (
            <div key={group.id}>
              <div className="px-2 mb-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {group.title}
                </div>
                <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{group.subtitle}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(s => (
                  <HubCardV2
                    key={s.id}
                    icon={s.icon}
                    iconColor={s.iconColor}
                    iconBg={s.iconBg}
                    title={s.title}
                    description={s.description}
                    modality={s.modality}
                    status={s.status}
                    isNew={s.isNew}
                    cta={s.cta}
                    onClick={() => navigate(s.path)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        <Card className="bg-gradient-to-r from-violet-600 to-purple-700 text-white border-0 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.01]"
          onClick={() => { setShowAI(true); if (!aiAdvice) askAI(); }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon name="BrainCircuit" size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">ИИ-советник</h3>
                <p className="text-violet-200 text-sm">Анализ бюджета, рекомендации по долгам и накоплениям</p>
              </div>
              <Icon name="ChevronRight" size={24} className="text-white/60" />
            </div>
          </CardContent>
        </Card>
      </HubLayoutV2>

      <Dialog open={showAI} onOpenChange={setShowAI}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="BrainCircuit" size={20} className="text-violet-600" />
              ИИ-финансовый советник
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[
                'Проанализируй мой бюджет',
                'Как гасить кредиты?',
                'Где сократить расходы?',
                'Куда направить свободные деньги?'
              ].map(q => (
                <Button key={q} variant="outline" size="sm" className="text-xs"
                  onClick={() => { setAiQuestion(q); askAI(q); }}>
                  {q}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <Input placeholder="Задайте вопрос о ваших финансах..."
                value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !aiLoading && askAI()} />
              <Button onClick={() => askAI()} disabled={aiLoading}
                className="bg-violet-600 hover:bg-violet-700 flex-shrink-0">
                <Icon name="Send" size={16} />
              </Button>
            </div>

            {aiLoading && (
              <div className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-600" />
                <p className="text-sm text-violet-700">Анализирую ваши финансы...</p>
              </div>
            )}

            {aiAdvice && !aiLoading && (
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Sparkles" size={16} className="text-violet-600" />
                  <span className="text-sm font-medium text-violet-800">Рекомендации</span>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {aiAdvice}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
