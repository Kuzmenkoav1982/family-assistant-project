import { ArrowRight } from 'lucide-react';
import Icon from '@/components/ui/icon';

export default function Presentation() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            Семейный Органайзер
          </h1>
          <p className="text-2xl text-purple-600">
            Объединяем семьи. Укрепляем общество.
          </p>
        </div>

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Heart" className="text-red-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Почему это важно?
            </h2>
          </div>
          
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              В современном мире семьи теряют связь. Родители работают, дети учатся, 
              бабушки и дедушки остаются в стороне. Каждый живёт в своём ритме, 
              а общие дела превращаются в хаос и конфликты.
            </p>
            
            <div className="bg-purple-50 rounded-2xl p-6 border-l-4 border-purple-500">
              <p className="font-semibold text-purple-900 text-xl mb-2">
                Семейный Органайзер — это не просто приложение.
              </p>
              <p>
                Это инструмент для восстановления семейных связей, справедливого 
                распределения обязанностей и воспитания ответственности у каждого 
                члена семьи.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Icon name="Sparkles" className="text-yellow-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Как мы помогаем семьям
            </h2>
          </div>

          <div className="grid gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Users" className="text-blue-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Справедливость в каждом доме
                </h3>
                <p className="text-gray-700">
                  Больше никаких споров "кто больше делает". Система баллов 
                  и прозрачное распределение задач показывают реальный вклад 
                  каждого члена семьи.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="Trophy" className="text-green-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Мотивация через достижения
                </h3>
                <p className="text-gray-700">
                  Дети растут ответственными, взрослые видят свой прогресс. 
                  Уровни, достижения и награды делают домашние дела увлекательными, 
                  а не обязательными.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="MessageSquareWarning" className="text-purple-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Разрешение конфликтов
                </h3>
                <p className="text-gray-700">
                  Жалобная книга с ИИ-помощником учит семью конструктивному диалогу. 
                  Не замалчивать проблемы, а решать их вместе — через понимание 
                  и взаимное уважение.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Icon name="Calendar" className="text-pink-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Сохранение традиций
                </h3>
                <p className="text-gray-700">
                  Календарь религиозных событий, семейные рецепты, важные даты — 
                  всё это помогает передавать ценности из поколения в поколение 
                  и укреплять культурную идентичность.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="GraduationCap" className="text-orange-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Обучение жизненным навыкам
                </h3>
                <p className="text-gray-700">
                  Дети учатся планировать время, нести ответственность, готовить 
                  по семейным рецептам. Это настоящая подготовка к взрослой жизни 
                  в безопасной среде семьи.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-xl p-10 mb-8 text-white">
          <div className="flex items-center gap-4 mb-8">
            <Icon name="Sparkle" size={40} />
            <h2 className="text-3xl font-bold">
              Главные функции
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="CheckSquare" size={24} />
                <h3 className="text-xl font-bold">Задачи</h3>
              </div>
              <p className="text-white/90">
                Создавайте, назначайте и отслеживайте дела. Система баллов 
                и категории помогают справедливо распределить нагрузку.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Users" size={24} />
                <h3 className="text-xl font-bold">Профили семьи</h3>
              </div>
              <p className="text-white/90">
                Полная информация о каждом: достижения, предпочтения, 
                обязанности. Видно кто чем занят и кто сколько сделал.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="ChefHat" size={24} />
                <h3 className="text-xl font-bold">Меню и рецепты</h3>
              </div>
              <p className="text-white/90">
                Планируйте меню на неделю с учётом предпочтений всех. 
                Семейные рецепты передаются из поколения в поколение.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="ShoppingCart" size={24} />
                <h3 className="text-xl font-bold">Умные покупки</h3>
              </div>
              <p className="text-white/90">
                Список покупок для всей семьи. Автоматические подсказки 
                на основе меню и истории покупок.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Calendar" size={24} />
                <h3 className="text-xl font-bold">Календарь</h3>
              </div>
              <p className="text-white/90">
                Все важные даты в одном месте: дни рождения, годовщины, 
                религиозные праздники, встречи и мероприятия.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="MessageSquareWarning" size={24} />
                <h3 className="text-xl font-bold">Жалобная книга</h3>
              </div>
              <p className="text-white/90">
                ИИ-помощник для разрешения конфликтов. Учит семью открытому 
                диалогу и конструктивному решению проблем.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Church" size={24} />
                <h3 className="text-xl font-bold">Вера</h3>
              </div>
              <p className="text-white/90">
                Религиозные события, посты, информация о храме. 
                Помогает сохранять духовные традиции семьи.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Trophy" size={24} />
                <h3 className="text-xl font-bold">Достижения</h3>
              </div>
              <p className="text-white/90">
                Система уровней, баллов и наград. Каждый видит свой 
                прогресс и чувствует признание семьи.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Globe" className="text-blue-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Влияние на общество
            </h2>
          </div>
          
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Когда семьи становятся крепче — крепнет всё общество. 
              Дети из организованных семей растут более ответственными, 
              они видят примеры справедливости и взаимопомощи каждый день.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  100%
                </div>
                <div className="text-gray-600">
                  семей получают инструмент для организации
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  80%
                </div>
                <div className="text-gray-600">
                  конфликтов можно предотвратить через диалог
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  ∞
                </div>
                <div className="text-gray-600">
                  традиций сохранится для будущих поколений
                </div>
              </div>
            </div>

            <p>
              Мы создаём цифровой фундамент для миллионов семей России. 
              Каждая организованная семья — это меньше стресса, больше времени 
              друг для друга, крепкие традиции и здоровое следующее поколение.
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 mt-8">
              <p className="text-xl font-bold text-purple-900 text-center mb-4">
                Сильные семьи = Сильная страна
              </p>
              <p className="text-center text-gray-700">
                Семейный Органайзер — это инвестиция в будущее каждой семьи 
                и всего общества. Начните с одной семьи. Объедините страну.
              </p>
            </div>
          </div>
        </section>

        <section className="text-center py-12">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <span>Начните укреплять свою семью сегодня</span>
            <ArrowRight size={24} />
          </div>
        </section>

      </div>
    </div>
  );
}