import Icon from '@/components/ui/icon';

export function PresentationFooter() {
  return (
    <>
      <section data-pdf-slide className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-5 sm:p-10 mb-8 text-white">
        <div className="text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold">
            «Наша семья» — это:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
            {[
              'Единственная в России комплексная семейная платформа',
              '12 хабов жизни семьи в одном приложении',
              'Портфолио развития ребёнка по 8 сферам — карта, а не оценка',
              'AI-ассистент «Домовой» + голосовое управление (Алиса)',
              '110+ backend-функций, 245 таблиц БД, 165+ экранов',
              'Полностью российский продукт, на стадии включения в реестр ПО',
              'Работающий продукт в production',
              'Готовый раздел «Финансы» — открытая площадка для продуктов партнёра',
              'Социально значимый проект в рамках Стратегии семейной политики РФ до 2036 года',
              'Канал и чат-бот в мессенджере MAX',
              'Открытая «Доска идей» — развитие продукта вместе с пользователями',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon name="Check" size={16} className="text-emerald-300 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-purple-100">{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button 
              onClick={() => window.location.href = '/welcome'}
              className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-2xl font-bold text-base shadow-lg inline-flex items-center gap-2 transition-all hover:scale-105"
            >
              Перейти на платформу
              <Icon name="ArrowRight" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* СЛАЙД: Юридическая информация — в самый низ презентации */}
      <section data-pdf-slide className="bg-white rounded-3xl shadow-xl p-6 sm:p-10 mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-700">
            <Icon name="Building2" size={22} className="text-white sm:hidden" />
            <Icon name="Building2" size={28} className="text-white hidden sm:block" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Юридическая информация</h2>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-gray-500 mb-1">Наименование</p>
              <p className="font-semibold">ИП Кузьменко А.В.</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-gray-500 mb-1">Платформа</p>
              <p className="font-semibold">nasha-semiya.ru</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-gray-500 mb-1">ОГРНИП</p>
              <p className="font-semibold">325774600908955</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-gray-500 mb-1">ИНН</p>
              <p className="font-semibold">231805288780</p>
            </div>
          </div>
        </div>
      </section>

      <div data-pdf-slide className="text-center text-gray-500 pb-8 space-y-1">
        <p className="text-sm font-medium">
          © 2026 Наша семья. Все права защищены.
        </p>
        <p className="text-xs">
          ИП Кузьменко А.В. | ОГРНИП: 325774600908955 | ИНН: 231805288780
        </p>
        <p className="text-xs text-gray-400">
          Объединяем семьи. Укрепляем общество.
        </p>
      </div>
    </>
  );
}