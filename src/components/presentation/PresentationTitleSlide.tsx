import Icon from '@/components/ui/icon';

export function PresentationTitleSlide() {
  return (
    <div data-pdf-slide className="text-center mb-16 pt-4">
      <div className="inline-block mb-3 px-4 py-1.5 bg-emerald-100 rounded-full">
        <span className="text-emerald-700 text-sm font-medium">Стратегия семейной политики РФ до 2036 года</span>
      </div>
      <div className="flex justify-center mb-6">
        <img
          src={`https://cdn.poehali.dev/files/${encodeURIComponent('Логотип Наша Семья.JPG')}`}
          alt="Наша семья"
          className="h-20 w-20 sm:h-28 sm:w-28 md:h-36 md:w-36 object-contain rounded-2xl shadow-lg"
        />
      </div>
      <h1 className="text-3xl sm:text-5xl font-bold mb-3 text-slate-800 tracking-tight">
        Наша Семья
      </h1>
      <p className="text-base sm:text-xl text-slate-500 mb-1">
        Цифровая платформа благополучия семейной жизни
      </p>
      <p className="text-sm sm:text-base font-semibold text-slate-600 mb-3 tracking-wide uppercase">элемент семейной экосистемы</p>
      <p className="text-xl sm:text-2xl font-semibold text-emerald-700 mb-6">
        Объединяем семьи. Укрепляем общество.
      </p>

      {/* Концепция: Семья как единый клиент */}
      <div className="max-w-2xl mx-auto mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 text-left">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Icon name="Users" size={16} className="text-white" />
          </div>
          <h3 className="font-bold text-blue-900 text-sm">Семья как единый клиент — Семейный ID</h3>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          Единый цифровой профиль семьи открывает новое качество клиентского опыта: общие расходы, 
          совместные счета, единый ID для банков и маркетплейсов.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Общие расходы и счета', 'Бонусные программы семьи', 'Единый клиентский опыт', 'Интеграция с маркетплейсами'].map((tag) => (
            <span key={tag} className="text-xs bg-white text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium">{tag}</span>
          ))}
        </div>
      </div>

      
    </div>
  );
}