import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';

interface TabInfo {
  icon: string;
  color: string;
  title: string;
  text: string;
}

const TABS: TabInfo[] = [
  {
    icon: 'Route',
    color: 'text-pink-600',
    title: 'Дорога',
    text: 'Главный таймлайн: добавляй события прошлого и планы будущего. Якорь «Я сейчас» показывает, где ты на пути.',
  },
  {
    icon: 'BarChart3',
    color: 'text-rose-600',
    title: 'Инсайты',
    text: 'Жизнь в цифрах: сколько событий по категориям и сезонам, что было «в этот день», ближайшие планы.',
  },
  {
    icon: 'Target',
    color: 'text-blue-600',
    title: 'Цели',
    text: 'Цели с чек-листом шагов, прогрессом и сферой жизни. ИИ-Домовой поможет подобрать методику.',
  },
  {
    icon: 'PieChart',
    color: 'text-emerald-600',
    title: 'Баланс',
    text: 'Колесо баланса по 8 сферам: оцени каждую от 1 до 10 и увидишь, где стоит уделить внимания.',
  },
  {
    icon: 'Library',
    color: 'text-amber-600',
    title: 'Методики',
    text: '5 проверенных техник: SMART, Икигай, Колесо жизни, 7 навыков Кови, OKR — с пошаговыми инструкциями.',
  },
];

const FEATURES = [
  { icon: 'Sparkles', title: 'Домовой', text: 'ИИ-наставник видит твой путь целиком и подсказывает следующий шаг.' },
  { icon: 'Film', title: 'История', text: 'Режим сторис — пролистывай события как в Apple Memories.' },
  { icon: 'Share2', title: 'Поделиться', text: 'Экспортируй путь текстом для соцсетей, мессенджеров или печати.' },
  { icon: 'CalendarPlus', title: 'Сегодня', text: 'Быстрая кнопка, чтобы записать сегодняшнее событие в один тап.' },
];

export default function LifeRoadInstructions() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Icon name="Hammer" className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left group gap-2">
              <h3 className="font-semibold text-purple-900 text-sm">
                Что такое «Мастерская жизни» и как ей пользоваться
              </h3>
              <Icon
                name={isOpen ? 'ChevronUp' : 'ChevronDown'}
                className="h-5 w-5 text-purple-600 transition-transform group-hover:scale-110 flex-shrink-0"
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-3">
              <AlertDescription className="text-purple-900/90">
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    <strong>Мастерская жизни</strong> — твой рабочий стол автора собственной судьбы.
                    Здесь ты видишь пройденный путь, отмечаешь настоящее и собираешь будущее из целей, привычек и мечт.
                  </p>

                  <div>
                    <p className="font-semibold text-purple-900 mb-1.5">5 вкладок — 5 инструментов:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {TABS.map((t) => (
                        <div key={t.title} className="bg-white/70 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon name={t.icon} size={14} className={t.color} />
                            <span className="font-semibold">{t.title}</span>
                          </div>
                          <p className="text-[11px] text-purple-800/80 leading-snug">{t.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-purple-900 mb-1.5">Плюс полезные фишки:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {FEATURES.map((f) => (
                        <div key={f.title} className="bg-white/70 rounded-lg p-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            <Icon name={f.icon} size={12} className="text-purple-600" />
                            <span className="font-semibold text-[11px]">{f.title}</span>
                          </div>
                          <p className="text-[10px] text-purple-800/80 leading-snug">{f.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-lg p-2.5 border border-purple-200/50">
                    <p className="text-[11px] text-purple-900/90 leading-relaxed">
                      <span className="font-semibold">С чего начать:</span>{' '}
                      укажи дату рождения в профиле — путь разделится на 6 сезонов жизни (Детство · Юность ·
                      Становление · Зрелость · Расцвет · Мудрость). Затем добавь 3–5 ярких событий прошлого,
                      цель на будущее и оцени Колесо баланса. Всё остальное — дело регулярности и твоего
                      вдохновения.
                    </p>
                  </div>

                  <p className="text-[11px] text-purple-700/80 italic">
                    Совет: на мобильном между вкладками можно переключаться свайпом. А кнопка «Сегодня» всегда
                    под рукой — запиши момент, пока он свежий.
                  </p>
                </div>
              </AlertDescription>
            </CollapsibleContent>
          </div>
        </div>
      </Alert>
    </Collapsible>
  );
}
