import Icon from '@/components/ui/icon';

const stages = [
  { num: '1', icon: 'Rocket', title: 'Стратегический пилот', desc: '4–6 месяцев после юр. и тех. подготовки. 2–3 сценария: международная оплата, семейная цель, запись в «А7 Финансы»' },
  { num: '2', icon: 'TrendingUp', title: 'Стратегическая инвестиция', desc: 'А7 входит как миноритарный инвестор, получает приоритет в согласованных сценариях и агрегированную аналитику' },
  { num: '3', icon: 'Building2', title: 'СП или white-label', desc: 'Только после подтверждения метрик пилота — «А7 Семья», white-label кабинет, совместный хаб или отдельное СП' },
];

const dealTerms = ['Миноритарная доля', 'Без передачи контроля над платформой на первом этапе', 'Транши по milestone', 'Коммерческая модель отдельно от инвестиционной', 'Узкая эксклюзивность — категория и срок', 'Право на следующий раунд без блокировки других инвесторов', 'Опцион на увеличение доли только при достижении KPI'];

const risks = [
  { icon: 'ShieldAlert', text: 'Санкционный и репутационный риск — нужен отдельный legal due diligence перед сделкой' },
  { icon: 'Link2Off', text: 'Риск зависимости от одного партнёра — узкая эксклюзивность и измеримые обязательства' },
  { icon: 'FileWarning', text: 'Требования 152-ФЗ и защиты данных — чёткое разделение прав на данные' },
];

export default function Slide17() {
  return (
    <section
      id="slide-17"
      data-pdf-slide
      className="scroll-mt-20 bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-6 sm:mb-8 border border-slate-100"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-500 shrink-0">
          <Icon name="Layers" size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Инвестиционная модель</h2>
          <p className="text-sm text-gray-500 mt-0.5">Не абстрактная просьба «инвестировать в проект», а конструкция с этапами</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {stages.map((s) => (
          <div key={s.num} className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-white text-xs font-bold flex items-center justify-center shrink-0">{s.num}</div>
              <Icon name={s.icon} size={16} className="text-slate-600" />
              <h3 className="font-bold text-gray-800 text-sm">{s.title}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Хорошая структура сделки</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dealTerms.map((t) => (
            <div key={t} className="flex items-start gap-2 text-xs text-gray-700">
              <Icon name="Check" size={13} className="text-emerald-600 mt-0.5 shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
          <Icon name="AlertTriangle" size={13} /> Риски, которые честно учитываем
        </p>
        <div className="space-y-1.5">
          {risks.map((r) => (
            <div key={r.text} className="flex items-start gap-2">
              <Icon name={r.icon} size={14} className="text-amber-700 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-900 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
