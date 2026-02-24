import Icon from '@/components/ui/icon';

const PHONE_IMG = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/2e8fe906-941e-4986-b745-a4d8898a8a64.jpeg';

export default function WelcomePWA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Icon name="Smartphone" size={16} />
            Работает как приложение
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Установите на телефон
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Не нужно скачивать из магазина — добавьте на главный экран прямо из браузера
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Icon name="Apple" size={24} className="text-white" fallback="Smartphone" />
              </div>
              <div>
                <h3 className="font-bold text-lg">iPhone / iPad</h3>
                <p className="text-sm text-gray-400">Safari</p>
              </div>
            </div>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">1</span>
                <div>
                  <p className="font-medium">Откройте nasha-semiya.ru</p>
                  <p className="text-sm text-gray-400">Именно в Safari</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="font-medium">Нажмите кнопку «Поделиться»</p>
                  <p className="text-sm text-gray-400">Квадрат со стрелкой внизу экрана</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">3</span>
                <div>
                  <p className="font-medium">«На экран Домой»</p>
                  <p className="text-sm text-gray-400">Прокрутите вниз и нажмите</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="flex justify-center">
            <img
              src={PHONE_IMG}
              alt="Приложение на телефоне"
              className="w-56 sm:w-64 rounded-3xl shadow-2xl"
              loading="lazy"
            />
          </div>

          <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Icon name="Smartphone" size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Android</h3>
                <p className="text-sm text-green-200">Chrome</p>
              </div>
            </div>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-400 text-green-900 text-sm font-bold flex items-center justify-center">1</span>
                <div>
                  <p className="font-medium">Откройте nasha-semiya.ru</p>
                  <p className="text-sm text-green-200">В браузере Chrome</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-400 text-green-900 text-sm font-bold flex items-center justify-center">2</span>
                <div>
                  <p className="font-medium">Нажмите три точки ⋮</p>
                  <p className="text-sm text-green-200">В правом верхнем углу</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-400 text-green-900 text-sm font-bold flex items-center justify-center">3</span>
                <div>
                  <p className="font-medium">«Установить приложение»</p>
                  <p className="text-sm text-green-200">Или «Добавить на главный экран»</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}