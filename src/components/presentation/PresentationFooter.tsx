import Icon from '@/components/ui/icon';

export function PresentationFooter() {
  return (
    <>
      <section className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-10 mb-8 text-white">
        <div className="text-center space-y-5">
          <h2 className="text-3xl font-bold">
            «Наша семья» — это:
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
            {[
              'Единственная в России комплексная семейная платформа',
              '12 направлений жизни семьи в одном приложении',
              'AI-ассистент «Домовой» + голосовое управление (Алиса)',
              '86 backend-функций, 151 таблица БД, 90+ экранов',
              'Полностью российский продукт, на стадии включения в реестр ПО',
              'Работающий MVP в production',
              'Готовый раздел «Финансы» — открытая площадка для продуктов партнёра',
              'Социально значимый проект в рамках «Десятилетия семьи»',
              '811 подписчиков канала + чат-бот в MAX',
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

      <div className="text-center text-gray-500 pb-8 space-y-1">
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
