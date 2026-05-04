import Icon from '@/components/ui/icon';

const problems = [
  {
    before: 'Записки на холодильнике и забытые дела',
    after: 'Единый список задач семьи с уведомлениями',
    icon: 'ClipboardList',
    color: 'text-blue-500',
    bg: 'bg-blue-100',
  },
  {
    before: '«Кто забирает из школы?»',
    after: 'Общий семейный календарь с напоминаниями',
    icon: 'Calendar',
    color: 'text-purple-500',
    bg: 'bg-purple-100',
  },
  {
    before: '«Что сегодня на ужин?»',
    after: 'Меню на неделю и AI-рецепты из продуктов дома',
    icon: 'ChefHat',
    color: 'text-green-500',
    bg: 'bg-green-100',
  },
  {
    before: '«Где ребёнок? Доехал ли?»',
    after: 'GPS-маячок семьи в реальном времени',
    icon: 'MapPin',
    color: 'text-red-500',
    bg: 'bg-red-100',
  },
  {
    before: 'Забытые прививки, анализы и лекарства',
    after: 'Медкарты семьи с напоминаниями и врачами',
    icon: 'Heart',
    color: 'text-pink-500',
    bg: 'bg-pink-100',
  },
  {
    before: '«Куда уходят деньги?»',
    after: 'Семейный бюджет: доходы, расходы, аналитика',
    icon: 'Wallet',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
  },
  {
    before: 'Список покупок забыт дома',
    after: 'Общий список покупок и голосование за блюда',
    icon: 'ShoppingCart',
    color: 'text-cyan-500',
    bg: 'bg-cyan-100',
  },
  {
    before: 'Не знаю, как и чему учить ребёнка',
    after: 'AI-план развития по возрасту и тест родителя',
    icon: 'GraduationCap',
    color: 'text-indigo-500',
    bg: 'bg-indigo-100',
  },
  {
    before: 'Ссоры из-за бытовых мелочей',
    after: 'Конфликт-AI и AI-психолог для семьи',
    icon: 'HeartHandshake',
    color: 'text-rose-500',
    bg: 'bg-rose-100',
  },
  {
    before: 'Куда поехать всей семьёй на выходные?',
    after: 'AI-маршруты и идеи праздников под запросы',
    icon: 'Plane',
    color: 'text-sky-500',
    bg: 'bg-sky-100',
  },
  {
    before: 'Авто: ТО, страховка, ремонт — всё в голове',
    after: 'Гараж: документы, напоминания и история',
    icon: 'Car',
    color: 'text-slate-500',
    bg: 'bg-slate-100',
  },
  {
    before: 'Сложно объяснить ценности и традиции детям',
    after: 'Семейный кодекс, заповеди и народная мудрость',
    icon: 'BookOpen',
    color: 'text-amber-500',
    bg: 'bg-amber-100',
  },
  {
    before: 'Постоянно набирать всё руками неудобно',
    after: 'Голосовое управление через Яндекс Алису',
    icon: 'Mic',
    color: 'text-violet-500',
    bg: 'bg-violet-100',
  },
  {
    before: 'Госуслуги, пособия, маткапитал — где смотреть?',
    after: 'Семья и государство: господдержка в одном месте',
    icon: 'Landmark',
    color: 'text-orange-500',
    bg: 'bg-orange-100',
  },
];

export default function WelcomeProblems() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Знакомые проблемы?
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            14 семейных болей — и готовое решение для каждой в одном приложении
          </p>
        </div>

        <div className="space-y-4">
          {problems.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon name={item.icon} size={22} className={item.color} />
              </div>

              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                <div className="flex-1">
                  <p className="text-gray-400 text-sm line-through">{item.before}</p>
                </div>
                <div className="hidden sm:block">
                  <Icon name="ArrowRight" size={20} className="text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.after}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}