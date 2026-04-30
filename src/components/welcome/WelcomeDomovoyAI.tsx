import { useState } from 'react';
import Icon from '@/components/ui/icon';

const DOMOVOY_CENTER = 'https://cdn.poehali.dev/files/4934b182-04ec-456b-814c-77b2704e0d2e.png';

const aiFunctions = [
  {
    name: 'ИИ-Диета',
    hub: 'Питание',
    icon: 'Apple',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    description: 'Персональный рацион по здоровью семьи',
  },
  {
    name: 'AI-план развития',
    hub: 'Развитие',
    icon: 'GraduationCap',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    description: 'Индивидуальный план по возрасту ребёнка',
  },
  {
    name: 'AI-психолог',
    hub: 'Развитие',
    icon: 'Brain',
    color: 'from-purple-500 to-fuchsia-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    description: 'Поддержка и рекомендации для семьи',
  },
  {
    name: 'Зеркало родителя',
    hub: 'Семейный код',
    icon: 'Heart',
    color: 'from-fuchsia-500 to-pink-500',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    text: 'text-fuchsia-600',
    description: 'Тест PARI + ИИ-разбор результатов',
  },
  {
    name: 'Конфликт-AI',
    hub: 'Развитие',
    icon: 'MessageCircle',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    description: 'Помощь в разрешении семейных конфликтов',
  },
  {
    name: 'AI-рецепты',
    hub: 'Питание',
    icon: 'ChefHat',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    description: 'Рецепты с учётом вкусов и аллергий',
  },
  {
    name: 'AI-маршруты',
    hub: 'Путешествия',
    icon: 'Compass',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    description: 'Маршруты путешествий для всей семьи',
  },
  {
    name: 'AI-праздники',
    hub: 'Семья',
    icon: 'Gift',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-600',
    description: 'Сценарии и идеи для семейных праздников',
  },
  {
    name: 'AI-ветеринар',
    hub: 'Питомцы',
    icon: 'PawPrint',
    color: 'from-lime-500 to-green-500',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    text: 'text-lime-700',
    description: 'Советы по уходу за питомцами',
  },
  {
    name: 'Астрология',
    hub: 'Семейный код',
    icon: 'Star',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    description: 'Семейный гороскоп и совместимость',
  },
  {
    name: 'Голосовой AI',
    hub: 'Семья',
    icon: 'Mic',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
    description: 'Управление голосом через Яндекс Алису',
  },
];

export default function WelcomeDomovoyAI() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#1a0a2e] via-[#2d1058] to-[#1a0a2e]">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Icon name="Bot" size={28} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">AI-карта «Домовой»</h2>
            <p className="text-purple-300 text-sm sm:text-base mt-0.5">
              {aiFunctions.length} AI-функций в единой экосистеме семьи
            </p>
          </div>
        </div>

        {/* Domovoy hero */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_40px_rgba(139,92,246,0.5)] mb-4">
            <img src={DOMOVOY_CENTER} alt="Домовой" className="w-full h-full object-cover" />
          </div>
          <p className="text-purple-200 text-sm text-center max-w-md">
            AI-помощник «Домовой» объединяет все умные функции платформы в одном месте
          </p>
        </div>

        <p className="text-purple-300 text-sm mb-4">Нажмите на функцию, чтобы узнать подробнее</p>

        {/* AI list — accordion */}
        <div className="space-y-3">
          {aiFunctions.map((fn, i) => {
            const isOpen = active === i;
            return (
              <div
                key={fn.name}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? 'bg-white/10 border-white/25' : 'bg-white/5 border-white/10'
                }`}
              >
                <button
                  onClick={() => setActive(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                >
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${fn.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <Icon name={fn.icon} size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">{fn.name}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-white/15 text-purple-200">
                        {fn.hub}
                      </span>
                    </div>
                    <div className="text-xs text-purple-300 mt-0.5 truncate">{fn.description}</div>
                  </div>
                  <Icon
                    name="ChevronDown"
                    size={20}
                    className={`text-purple-300 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1">
                    <div className={`rounded-xl ${fn.bg} ${fn.border} border-2 p-4`}>
                      <div className="flex items-start gap-2 mb-2">
                        <Icon name="Sparkles" size={16} className={`${fn.text} flex-shrink-0 mt-0.5`} />
                        <p className="text-sm text-gray-700 leading-relaxed">{fn.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-3">
                        <Icon name="Layers" size={12} />
                        <span>Хаб:</span>
                        <span className={`font-semibold ${fn.text}`}>{fn.hub}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
