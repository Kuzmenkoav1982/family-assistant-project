import Icon from '@/components/ui/icon';

const scenarios = [
  { icon: 'GraduationCap', text: 'Планирует обучение ребёнка' },
  { icon: 'Stethoscope', text: 'Выбирает лечение' },
  { icon: 'Home', text: 'Переезжает или покупает недвижимость' },
  { icon: 'HandHeart', text: 'Помогает родственникам' },
  { icon: 'Plane', text: 'Планирует путешествие' },
  { icon: 'PiggyBank', text: 'Формирует накопления' },
  { icon: 'Wallet', text: 'Ведёт бюджет' },
  { icon: 'BookOpen', text: 'Оплачивает кружки и образование' },
  { icon: 'ShoppingBag', text: 'Готовится к крупной покупке' },
  { icon: 'FileText', text: 'Хранит документы' },
  { icon: 'ShieldCheck', text: 'Принимает решения о страховании' },
  { icon: 'Landmark', text: 'Думает о передаче капитала детям' },
];

export default function Slide04() {
  return (
    <section
      id="slide-4"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 shrink-0">
          <Icon name="Users" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Семья — место возникновения финансового спроса</h2>
          <p className="text-sm text-gray-500 mt-0.5">Большинство финансовых потребностей начинается не в банковском приложении</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 mb-6">
        {scenarios.map((s) => (
          <div key={s.text} className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-100">
            <Icon name={s.icon} size={15} className="text-purple-700 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-purple-900 leading-snug">{s.text}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <Icon name="Eye" size={13} /> Что видит банк / платёжная система
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">Уже готовую операцию — перевод, платёж, заявку на продукт</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
            <Icon name="Sparkles" size={13} /> Что видит «Наша семья»
          </p>
          <p className="text-sm text-emerald-900 leading-relaxed font-medium">Жизненный сценарий, из которого эта операция возникает</p>
        </div>
      </div>

      <div className="mt-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-center">
        <p className="text-white font-bold text-sm sm:text-base">
          Это и есть главный стратегический актив проекта — не аудитория, а контекст возникновения потребности
        </p>
      </div>
    </section>
  );
}
