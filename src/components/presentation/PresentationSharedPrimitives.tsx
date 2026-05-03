import Icon from '@/components/ui/icon';

export function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section data-pdf-slide className={`bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 md:p-10 mb-6 sm:mb-8 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({ icon, iconColor, title }: { icon: string; iconColor: string; title: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
        <Icon name={icon} size={22} className="text-white sm:hidden" />
        <Icon name={icon} size={28} className="text-white hidden sm:block" />
      </div>
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

export function StatCard({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-3 sm:p-5 border border-slate-100 text-center">
      <Icon name={icon} size={24} className="text-purple-500 mx-auto mb-2" />
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function FeatureRow({ icon, iconBg, title, desc }: { icon: string; iconBg: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon name={icon} size={18} className="text-white" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export function ComparisonTable() {
  const rows = [
    { label: 'Российская юрисдикция', us: true, foreign: false, todo: false, bank: true },
    { label: 'Локализация данных в РФ', us: true, foreign: false, todo: false, bank: true },
    { label: 'Всё-в-одном для семьи', us: true, foreign: false, todo: false, bank: false },
    { label: 'AI-ассистент', us: true, foreign: false, todo: false, bank: false },
    { label: 'Голосовое управление', us: true, foreign: false, todo: false, bank: false },
    { label: 'Здоровье + медкарты', us: true, foreign: false, todo: false, bank: false },
    { label: 'Развитие детей с ИИ', us: true, foreign: false, todo: false, bank: false },
    { label: 'Семейные финансы', us: true, foreign: false, todo: false, bank: true },
    { label: 'Госпрограммы и пособия', us: true, foreign: false, todo: false, bank: false },
    { label: 'Геолокация семьи', us: true, foreign: false, todo: false, bank: false },
  ];

  return (
    <div className="overflow-x-auto -mx-2 sm:-mx-2">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="border-b-2 border-purple-200">
            <th className="text-left py-2 px-1.5 sm:px-2 text-gray-600 font-medium text-[10px] sm:text-xs">Критерий</th>
            <th className="text-center py-2 px-1 text-purple-700 font-bold text-[10px] sm:text-xs">Наша семья</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-[10px] sm:text-xs hidden sm:table-cell">Зарубежные</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-[10px] sm:text-xs hidden sm:table-cell">Todoist</th>
            <th className="text-center py-2 px-1 text-gray-500 font-medium text-[10px] sm:text-xs">Банки</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50/50' : ''}>
              <td className="py-1.5 px-1.5 sm:px-2 text-gray-700 text-[10px] sm:text-xs">{row.label}</td>
              <td className="text-center py-1.5">{row.us ? '✅' : '❌'}</td>
              <td className="text-center py-1.5 hidden sm:table-cell">{row.foreign ? '✅' : '❌'}</td>
              <td className="text-center py-1.5 hidden sm:table-cell">{row.todo ? '✅' : '❌'}</td>
              <td className="text-center py-1.5">{row.bank ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
