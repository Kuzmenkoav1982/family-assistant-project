import Icon from '@/components/ui/icon';

export function PresentationContentSections() {
  return (
    <>
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
              "Наша семья" — это не просто приложение.
            </p>
            <p>
              Это инструмент для восстановления семейных связей, справедливого 
              распределения обязанностей и воспитания ответственности у каждого 
              члена семьи.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl shadow-xl p-10 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Icon name="Star" className="text-emerald-600" size={40} />
          <h2 className="text-3xl font-bold text-gray-800">
            Наша миссия
          </h2>
        </div>
        
        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-8 border-2 border-emerald-400 text-center">
            <p className="font-bold text-2xl text-emerald-900 mb-3">
              "Объединяя семьи, мы укрепляем общество"
            </p>
            <p className="text-gray-800">
              Семья — это фундамент общества. Когда семьи работают как единая команда, 
              дети вырастают ответственными, родители чувствуют поддержку, а старшее 
              поколение остаётся вовлечённым в жизнь близких.
            </p>
          </div>
          <p>
            "Наша семья" помогает восстановить связи между поколениями, научить детей 
            ответственности и создать атмосферу взаимопомощи и любви.
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl p-10 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Icon name="Users" className="text-blue-600" size={40} />
          <h2 className="text-3xl font-bold text-gray-800">
            Для кого это приложение?
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Icon name="Baby" className="text-pink-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Семьи с детьми до 7 лет</h3>
                <p className="text-gray-700">
                  Отслеживайте развитие ребёнка с помощью ИИ, получайте персональные планы развития, 
                  сохраняйте важные моменты взросления.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Icon name="GraduationCap" className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Семьи со школьниками</h3>
                <p className="text-gray-700">
                  Организуйте учёбу, кружки, домашние задания. Мотивируйте детей 
                  через систему баллов и достижений.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Icon name="Heart" className="text-red-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Многопоколенные семьи</h3>
                <p className="text-gray-700">
                  Вовлеките бабушек и дедушек в семейные дела, сохраняйте истории 
                  рода, укрепляйте связь поколений.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Icon name="Home" className="text-orange-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Активные семьи</h3>
                <p className="text-gray-700">
                  Планируйте совместные мероприятия, путешествия, традиции. 
                  Создавайте семейные воспоминания вместе.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Icon name="Sparkles" className="text-purple-600" size={40} />
          <h2 className="text-3xl font-bold text-gray-800">
            Ключевые возможности
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Умные задачи с ИИ</h3>
                <p className="text-gray-600 text-sm">
                  Автоматическое распределение обязанностей с учётом загруженности каждого члена семьи
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Система мотивации</h3>
                <p className="text-gray-600 text-sm">
                  Баллы, достижения и награды делают выполнение задач увлекательным для детей и взрослых
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Семейный календарь</h3>
                <p className="text-gray-600 text-sm">
                  Следите за важными датами, планируйте мероприятия, синхронизируйте расписания всех членов семьи
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Развитие детей</h3>
                <p className="text-gray-600 text-sm">
                  ИИ-ассистент отслеживает прогресс ребёнка и предлагает индивидуальные планы развития
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Семейный чат</h3>
                <p className="text-gray-600 text-sm">
                  Общайтесь, делитесь новостями и планами в одном месте
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Семейное древо</h3>
                <p className="text-gray-600 text-sm">
                  Сохраняйте истории рода, создавайте связи между поколениями
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Семейные ценности и традиции</h3>
                <p className="text-gray-600 text-sm">
                  Документируйте важные моменты, создавайте и поддерживайте семейные ритуалы
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <Icon name="CheckCircle" className="text-purple-600" size={18} />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1">Статистика и аналитика</h3>
                <p className="text-gray-600 text-sm">
                  Отслеживайте прогресс семьи, анализируйте распределение нагрузки, находите точки роста
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl shadow-xl p-10">
        <div className="flex items-center gap-4 mb-6">
          <Icon name="Building2" className="text-slate-600" size={40} />
          <h2 className="text-3xl font-bold text-gray-800">
            Юридическая информация
          </h2>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border-l-4 border-slate-500">
          <div className="space-y-2 text-gray-700 text-lg">
            <p className="font-semibold text-slate-900">Кузьменко А.В.</p>
            <p><span className="font-medium">ОГРНИП:</span> 325774600908955</p>
            <p><span className="font-medium">ИНН:</span> 231805288780</p>
          </div>
        </div>
      </section>
    </>
  );
}