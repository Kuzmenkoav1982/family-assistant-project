import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceHubInstructions } from '@/components/finance/FinanceInstructions';

interface SubSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  ready: boolean;
}

const subSections: SubSection[] = [
  {
    id: 'analytics',
    title: 'Финансовый пульс',
    description: 'Полный анализ: здоровье финансов, ИИ-рекомендации, прогнозы и стратегии',
    icon: 'Activity',
    path: '/finance/analytics',
    gradient: 'from-violet-500 to-purple-600',
    badge: 'NEW',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    ready: true,
  },
  {
    id: 'strategy',
    title: 'Стратегия погашения',
    description: 'Лавина, снежный ком — сравни стратегии, симулятор "Что если?"',
    icon: 'Swords',
    path: '/finance/strategy',
    gradient: 'from-orange-500 to-red-600',
    badge: 'NEW',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    ready: true,
  },
  {
    id: 'cashflow',
    title: 'Кэш-флоу прогноз',
    description: 'Прогноз движения денег на 24 месяца, предупреждения о кассовых разрывах',
    icon: 'TrendingUp',
    path: '/finance/cashflow',
    gradient: 'from-teal-500 to-emerald-600',
    badge: 'NEW',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
    ready: true,
  },
  {
    id: 'budget',
    title: 'Бюджет',
    description: 'Доходы, расходы, аналитика по категориям и лимиты на месяц',
    icon: 'PieChart',
    path: '/finance/budget',
    gradient: 'from-emerald-500 to-green-600',
    ready: true,
  },
  {
    id: 'accounts',
    title: 'Счета и карты',
    description: 'Банковские карты, счета, наличные — все балансы в одном месте',
    icon: 'CreditCard',
    path: '/finance/accounts',
    gradient: 'from-blue-500 to-indigo-600',
    ready: true,
  },
  {
    id: 'debts',
    title: 'Кредиты и долги',
    description: 'Ипотека, кредиты, займы — остатки, графики платежей, переплаты',
    icon: 'Receipt',
    path: '/finance/debts',
    gradient: 'from-red-500 to-rose-600',
    ready: true,
  },
  {
    id: 'goals',
    title: 'Финансовые цели',
    description: 'Накопления на мечту: квартира, машина, отпуск, образование',
    icon: 'Target',
    path: '/finance/goals',
    gradient: 'from-amber-500 to-orange-600',
    ready: true,
  },
  {
    id: 'literacy',
    title: 'Финансовая грамотность',
    description: 'Обучение для всей семьи: курсы, тесты, задания по возрастам',
    icon: 'GraduationCap',
    path: '/finance/literacy',
    gradient: 'from-purple-500 to-violet-600',
    ready: true,
  },
  {
    id: 'assets',
    title: 'Имущество',
    description: 'Недвижимость, транспорт, техника — учёт и стоимость всех активов',
    icon: 'Home',
    path: '/finance/assets',
    gradient: 'from-sky-500 to-blue-600',
    ready: true,
  },
  {
    id: 'loyalty',
    title: 'Скидочные карты',
    description: 'Карты лояльности магазинов, аптек, АЗС — вся семья видит все карты',
    icon: 'Ticket',
    path: '/finance/loyalty',
    gradient: 'from-pink-500 to-rose-600',
    ready: true,
  },
  {
    id: 'antiscam',
    title: 'Антимошенник',
    description: 'База мошеннических схем, проверка ссылок и тревожная кнопка для защиты семьи',
    icon: 'ShieldAlert',
    path: '/finance/antiscam',
    gradient: 'from-red-500 to-rose-700',
    ready: true,
  },
  {
    id: 'wallet',
    title: 'Кошелёк сервиса',
    description: 'Баланс для ИИ-функций: диета, рецепты, открытки, рекомендации',
    icon: 'Wallet',
    path: '/wallet',
    gradient: 'from-cyan-500 to-teal-600',
    ready: true,
  },
];

const OWNER_ONLY_SECTIONS = ['budget', 'debts', 'accounts', 'recurring', 'assets', 'analytics', 'strategy', 'cashflow'];

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
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ action: 'ai_advice', question: question || aiQuestion || '' })
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-green-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Финансы"
          subtitle="Бюджет, счета, долги и финансовые цели семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/dda8e6ec-c019-40cd-a6e7-d49428af5b50.jpg"
        />

        <FinanceHubInstructions />

        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent border border-emerald-200/50 p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon name="Shield" size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Ваши данные защищены</p>
              <p className="text-xs text-emerald-600/80 mt-0.5">
                Финансовая информация доступна только членам вашей семьи и не передаётся третьим лицам
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subSections.filter(s => isOwner || !OWNER_ONLY_SECTIONS.includes(s.id)).map((section) => (
            <Card
              key={section.id}
              className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 ${
                section.ready ? 'border-transparent' : 'border-dashed border-gray-200'
              } overflow-hidden`}
              onClick={() => {
                if (section.ready) {
                  navigate(section.path);
                }
              }}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div
                    className={`w-20 min-h-full bg-gradient-to-br ${section.gradient} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon
                      name={section.icon}
                      size={32}
                      className="text-white drop-shadow-sm"
                    />
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base group-hover:text-emerald-700 transition-colors">
                        {section.title}
                      </h3>
                      {section.badge && (
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 ${section.badgeColor || ''}`}
                        >
                          {section.badge}
                        </Badge>
                      )}
                      {!section.ready && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-600 border-amber-200"
                        >
                          Скоро
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug">
                      {section.description}
                    </p>
                  </div>

                  <div className="flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon
                      name="ChevronRight"
                      size={20}
                      className="text-gray-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
      </div>

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
    </div>
  );
}