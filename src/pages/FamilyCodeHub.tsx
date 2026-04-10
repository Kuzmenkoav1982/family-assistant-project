import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { Helmet } from 'react-helmet-async';

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
    id: 'personal',
    title: 'Личный код',
    description: 'Полный расклад на каждого члена семьи: нумерология, квадрат Пифагора, астрология и арканы судьбы',
    icon: 'UserCircle2',
    path: '/family-matrix/personal',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    badge: 'Нумерология',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'couple',
    title: 'Код пары',
    description: 'Совместимость по всем 4 пластам: нумерология, астрология, арканы, психология. Оценка 0-100% и советы',
    icon: 'Heart',
    path: '/family-matrix/couple',
    gradient: 'from-rose-500 via-pink-500 to-red-500',
    badge: 'Совместимость',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'family',
    title: 'Код семьи',
    description: 'Энергетика семьи сегодня, матрица взаимоотношений, биоритмы и дни силы для каждого',
    icon: 'Users',
    path: '/family-matrix/family',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    badge: 'Энергетика',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'rituals',
    title: 'Ритуалы примирения',
    description: 'Персональные сценарии после ссор на основе языков любви, стихий и нумерологии',
    icon: 'Flame',
    path: '/family-matrix/rituals',
    gradient: 'from-teal-500 via-cyan-500 to-blue-500',
    badge: 'Сценарии',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'child-code',
    title: 'Детский код',
    description: 'Врождённые таланты, стиль обучения, мотивация и рекомендации для родителей',
    icon: 'Baby',
    path: '/family-matrix/child',
    gradient: 'from-sky-400 via-blue-500 to-indigo-500',
    badge: 'Таланты',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
  {
    id: 'name-calculator',
    title: 'Имя для малыша',
    description: 'Топ-10 имён по совместимости с родителями + проверка своего варианта',
    icon: 'Sparkles',
    path: '/family-matrix/name',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    badge: 'Калькулятор',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    ready: true,
  },
];

export default function FamilyCodeHub() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Код Семьи — Нумерология, астрология и совместимость | Наша Семья</title>
        <meta
          name="description"
          content="Полный расклад на каждого члена семьи: нумерология, квадрат Пифагора, астрология, арканы судьбы. Совместимость супругов и анализ семьи."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 lg:p-8 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          <SectionHero
            title="Код Семьи"
            subtitle="Нумерология, астрология и совместимость членов семьи"
            imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/b01853ff-894d-4bfc-98e1-e32b7c13a7bc.jpg"
            backPath="/"
          />

          <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-violet-50 to-fuchsia-50">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2.5 rounded-xl flex-shrink-0">
                  <Icon name="Sparkles" size={22} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-purple-900 mb-2">Что такое Код Семьи?</h3>
                  <p className="text-sm text-purple-800/80 leading-relaxed mb-3">
                    Это единый раздел глубокого анализа членов вашей семьи. Система рассчитывает и комбинирует
                    все пласты информации о человеке для максимально точного портрета и анализа совместимости:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="Calculator" size={14} className="text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">Нумерология</span>
                      </div>
                      <p className="text-[11px] text-purple-800/70 leading-tight">
                        Числа судьбы, квадрат Пифагора
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="Star" size={14} className="text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">Астрология</span>
                      </div>
                      <p className="text-[11px] text-purple-800/70 leading-tight">
                        Зодиак, Бацзы, стихии
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="Wand2" size={14} className="text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">Арканы</span>
                      </div>
                      <p className="text-[11px] text-purple-800/70 leading-tight">
                        Таро-расклад судьбы
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="Heart" size={14} className="text-purple-600" />
                        <span className="text-xs font-semibold text-purple-900">Психология</span>
                      </div>
                      <p className="text-[11px] text-purple-800/70 leading-tight">
                        Языки любви, психотипы
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-purple-800/80 leading-relaxed mt-3">
                    Совместимость супругов анализируется по <strong>всем четырём пластам одновременно</strong>:
                    числа, знаки зодиака, арканы и психотипы. Получаете оценку 0-100% по каждому направлению
                    и общий вердикт с конкретными рекомендациями.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subSections.map((section) => (
              <Card
                key={section.id}
                className={`group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 overflow-hidden ${
                  section.ready ? 'border-transparent' : 'border-dashed border-purple-200'
                }`}
                onClick={() => {
                  if (section.ready) {
                    navigate(section.path);
                  }
                }}
              >
                <div className={`h-2 bg-gradient-to-r ${section.gradient}`} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`bg-gradient-to-br ${section.gradient} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon name={section.icon} size={24} className="text-white" />
                    </div>
                    {section.badge && (
                      <Badge className={section.badgeColor || 'bg-gray-100 text-gray-600'}>
                        {section.badge}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {section.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <span
                      className={`text-xs font-medium flex items-center gap-1 transition-all ${
                        section.ready
                          ? 'text-purple-600 group-hover:gap-2'
                          : 'text-gray-400'
                      }`}
                    >
                      {section.ready ? 'Открыть' : 'В разработке'}
                      <Icon name={section.ready ? 'ArrowRight' : 'Clock'} size={14} />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 p-2.5 rounded-xl flex-shrink-0">
                  <Icon name="Info" size={22} className="text-amber-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-amber-900">Как это работает?</h3>
                  <ul className="text-sm text-amber-900/80 space-y-1.5 list-none">
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Укажите дату рождения и ФИО в профиле — этого достаточно для полного расчёта нумерологии, астрологии и арканов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Система рассчитает все числа, квадрат Пифагора, зодиак, Бацзы и Таро-расклад автоматически</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Совместимость пары считается по всем пластам одновременно: числа + стихии + арканы + психотипы</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Домовой будет давать советы с учётом ВСЕХ расчётов и данных анкет обоих участников</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Icon name="Check" size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <span>Доступ можно отключить в настройках → Права доступа</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}