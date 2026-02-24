import Icon from '@/components/ui/icon';

const DOMOVOY_IMG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/f5f98c5e-0116-4004-a74f-986626d7178c.jpeg';

const capabilities = [
  { icon: 'MessageSquare', text: 'Отвечает на любые вопросы о семье' },
  { icon: 'UtensilsCrossed', text: 'Составляет меню и рецепты' },
  { icon: 'Heart', text: 'Советы по здоровью и воспитанию' },
  { icon: 'Calendar', text: 'Планирует мероприятия и задачи' },
  { icon: 'Mic', text: 'Управление голосом через Яндекс Алису' },
  { icon: 'ShoppingCart', text: 'Добавляет продукты в список покупок' },
];

export default function WelcomeAI() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-300 to-amber-300 rounded-[2.5rem] blur-2xl opacity-30 scale-110" />
              <img
                src={DOMOVOY_IMG}
                alt="AI-ассистент Домовой"
                className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-[2.5rem] object-cover shadow-2xl ring-4 ring-white"
              />
              <div className="absolute -bottom-3 -right-3 bg-white rounded-2xl shadow-xl px-4 py-2.5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">Онлайн 24/7</span>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Icon name="Sparkles" size={16} />
              Уникальная функция
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Познакомьтесь с{' '}
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Домовым
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Ваш персональный AI-помощник, который знает всё о вашей семье. 
              Хранитель очага, добрый дух дома — спрашивайте что угодно.
              А ещё он работает с Яндекс Алисой!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {capabilities.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white/80 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
                    <Icon name={item.icon} size={15} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}