import { ArrowRight, Download, X } from 'lucide-react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function Presentation() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('presentation-content');
      if (!element) return;

      element.classList.add('printing');
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        windowHeight: element.scrollHeight,
        imageTimeout: 0,
        removeContainer: true
      });

      element.classList.remove('printing');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const topMargin = 15;
      const bottomMargin = 15;
      const sideMargin = 10;
      
      const imgWidth = pageWidth - (2 * sideMargin);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentHeight = pageHeight - topMargin - bottomMargin;
      
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        const yPosition = -(page * contentHeight) + topMargin;
        
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          sideMargin,
          yPosition,
          imgWidth,
          imgHeight,
          undefined,
          'FAST'
        );
      }

      pdf.save('Наша-семья-Презентация.pdf');
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={() => window.location.href = '/welcome'}
          variant="outline"
          className="shadow-lg"
        >
          <Icon name="Home" size={18} />
        </Button>
        <Button
          onClick={downloadPDF}
          disabled={isDownloading}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        >
          <Download className="mr-2" size={18} />
          {isDownloading ? 'Создаём PDF...' : 'Скачать PDF'}
        </Button>
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="shadow-lg"
        >
          <X size={18} />
        </Button>
      </div>

      <style>{`
        @media print {
          .printing {
            padding: 12mm 8mm !important;
            max-width: 100% !important;
          }
          .printing section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 8mm !important;
            padding: 6mm !important;
          }
          .fixed {
            display: none !important;
          }
        }
      `}</style>

      <div id="presentation-content" className="max-w-4xl mx-auto px-6 py-12">
        
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <img 
              src="https://cdn.poehali.dev/files/35561da4-c60e-44c0-9bf9-c57eef88996b.png" 
              alt="Наша семья"
              className="h-32 w-32 object-contain"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-slate-800">
            Наша семья
          </h1>
          <p className="text-2xl text-emerald-900">
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
                  <Icon name="Users" className="text-purple-600" size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Многопоколенные семьи</h3>
                  <p className="text-gray-700">
                    Координируйте действия бабушек, дедушек, родителей и детей. 
                    Справедливо распределяйте обязанности между всеми.
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
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Молодые пары</h3>
                  <p className="text-gray-700">
                    Начните выстраивать семейные традиции, ставьте совместные цели, 
                    планируйте будущее вместе.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-300">
            <div className="flex items-center gap-4 mb-3">
              <Icon name="Sparkles" className="text-purple-600" size={32} />
              <h3 className="text-xl font-bold text-purple-900">✨ Особенность</h3>
            </div>
            <p className="text-lg text-gray-800">
              Мы объединяем до трёх поколений в одной семье — бабушки, родители, дети. 
              Каждый видит свою роль и вклад.
            </p>
          </div>
        </section>

        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Icon name="Sparkles" className="text-yellow-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Возможности для вашей семьи
            </h2>
          </div>

          <div className="flex items-center gap-6 mb-8 p-4 bg-white/60 rounded-xl border-2 border-indigo-200">
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-xl">✅</span>
              <span className="font-semibold text-gray-700">Уже работает</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 text-xl">🔄</span>
              <span className="font-semibold text-gray-700">Скоро появится</span>
            </div>
          </div>

          <div className="grid gap-8">
            {/* Блок 1: Управление семьей */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-3">
                <Icon name="Users" size={28} />
                Управление семьёй
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Профили членов семьи</strong> — создайте индивидуальные профили с фото, датой рождения, достижениями и статистикой</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Уровни и опыт</strong> — система уровней мотивирует каждого члена семьи выполнять задачи и зарабатывать баллы</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Управление доступом</strong> — настройте права для каждого: кто может создавать задачи, управлять календарем, редактировать профили</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Семейный код</strong> — уникальный код для приглашения родственников в вашу семью</p>
                </div>
              </div>
            </div>

            {/* Блок 2: Задачи и организация */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-green-600 mb-4 flex items-center gap-3">
                <Icon name="ListChecks" size={28} />
                Задачи и организация
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Задачи для всех</strong> — создавайте задачи, назначайте ответственных, устанавливайте сроки и приоритеты</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Система баллов</strong> — каждая выполненная задача приносит баллы и опыт, мотивируя всех участвовать</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Отслеживание прогресса</strong> — видите кто что сделал, сколько баллов заработал, какой вклад в семью</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Рецепты и меню</strong> — храните семейные рецепты, планируйте меню на неделю <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Список покупок</strong> — создавайте общий список продуктов и необходимых покупок</p>
                </div>
              </div>
            </div>

            {/* Блок 3: Планирование и события */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-purple-600 mb-4 flex items-center gap-3">
                <Icon name="CalendarDays" size={28} />
                Планирование и события
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Семейный календарь</strong> — планируйте события, встречи, дни рождения, праздники</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Экспорт в iCal</strong> — выгружайте события в Google Calendar, Apple Calendar, Outlook одним кликом</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Push-уведомления</strong> — мгновенные оповещения о задачах, событиях и достижениях (поддержка iOS PWA)</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Путешествия</strong> — планируйте поездки, маршруты, достопримечательности <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Дорожная карта жизни</strong> — отмечайте ключевые события и этапы жизни семьи <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
              </div>
            </div>

            {/* Блок 4: Финансы и имущество */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-emerald-600 mb-4 flex items-center gap-3">
                <Icon name="Wallet" size={28} />
                Финансы и имущество
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Семейный бюджет</strong> — учёт доходов и расходов, планирование финансов <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Семейные цели</strong> — ставьте финансовые цели (квартира, машина, отпуск) и отслеживайте прогресс</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Гараж</strong> — учёт транспорта, ТО, страховки, расходы на обслуживание <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Аналитика</strong> — графики расходов, статистика по категориям, прогнозы</p>
                </div>
              </div>
            </div>

            {/* Блок 5: AI-Ассистент Домовой */}
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 shadow-xl border-4 border-violet-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-violet-200 text-violet-900 px-4 py-1 rounded-full text-sm font-bold">
                  🤖 ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Icon name="Bot" size={36} className="text-violet-200" />
                AI-Ассистент Домовой
              </h3>
              <div className="space-y-4 ml-2">
                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Sparkles" className="text-violet-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">8 экспертных ролей</p>
                      <p className="text-gray-700">Семейный помощник, Повар, Органайзер, Педагог, Финансовый советник, Психолог, Фитнес-тренер, Планировщик путешествий</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="MessageSquare" className="text-violet-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Умный чат-помощник</p>
                      <p className="text-gray-700">Консультации по питанию, расчёт БЖУ, подбор рецептов, советы по воспитанию, планирование бюджета</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Lightbulb" className="text-violet-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Персональные советы</p>
                      <p className="text-gray-700">ИИ знает вашу семью и даёт рекомендации с учётом возраста детей, предпочтений и целей</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl p-4 border-2 border-violet-300">
                  <div className="flex gap-3">
                    <Icon name="Zap" className="text-violet-700 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-violet-900 text-lg mb-1">Виджет быстрого доступа</p>
                      <p className="text-gray-800">Плавающая кнопка на всех страницах — мгновенный вызов ассистента для помощи</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Блок 6: ПРИОРИТЕТ - Развитие детей */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 shadow-xl border-4 border-yellow-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-400 text-orange-900 px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ ПРИОРИТЕТ
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Icon name="GraduationCap" size={36} className="text-yellow-300" />
                Развитие и воспитание детей
              </h3>
              <div className="space-y-4 ml-2">
                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="User" className="text-orange-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Полный профиль ребёнка</p>
                      <p className="text-gray-700">Фото, дата рождения, возраст, вес, рост, группа здоровья, особенности развития. Вся информация в одном месте.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300">
                  <div className="flex gap-3">
                    <Icon name="Brain" className="text-purple-700 flex-shrink-0" size={28} />
                    <div>
                      <p className="font-bold text-purple-900 text-lg mb-2 flex items-center gap-2">
                        ИИ-оценка развития ребёнка
                        <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">НОВОЕ</span>
                      </p>
                      <p className="text-gray-800 mb-3">Искусственный интеллект анализирует развитие ребёнка по возрастным нормам и создаёт персональный план развития.</p>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">✓</span>
                          <span><strong>Анкеты по возрасту:</strong> 8 возрастных диапазонов от 0 до 7 лет с учётом норм развития</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">✓</span>
                          <span><strong>5 категорий навыков:</strong> крупная и мелкая моторика, речь, социальные навыки, когнитивное развитие</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">✓</span>
                          <span><strong>Детальный анализ:</strong> процентная оценка по каждой категории, сильные стороны и зоны роста</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">✓</span>
                          <span><strong>Персональный план:</strong> конкретные упражнения и задания с отслеживанием прогресса</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600">✓</span>
                          <span><strong>Архив с графиком:</strong> история всех оценок и динамика развития ребёнка</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="GraduationCap" className="text-blue-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Образование и учёба</p>
                      <p className="text-gray-700">Расписание уроков, домашние задания, оценки, успеваемость по предметам, контакты учителей, родительские собрания.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Sparkles" className="text-purple-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Кружки и секции</p>
                      <p className="text-gray-700">Спортивные секции, творческие студии, языковые курсы — расписание, достижения, оплата, контакты тренеров.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="TrendingUp" className="text-green-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Отслеживание развития</p>
                      <p className="text-gray-700">Физическое развитие (рост, вес, спортивные нормативы), интеллектуальное (успеваемость, навыки), творческое (достижения, таланты).</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Heart" className="text-red-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Здоровье ребёнка</p>
                      <p className="text-gray-700">Медицинская карта, прививки, анализы, визиты к врачам, аллергии, хронические заболевания, группа крови.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Trophy" className="text-yellow-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Достижения и награды</p>
                      <p className="text-gray-700">Грамоты, медали, сертификаты, победы в соревнованиях и олимпиадах. Фото наград, описание достижений.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Target" className="text-indigo-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Цели и планы развития</p>
                      <p className="text-gray-700">Ставьте цели для ребёнка (научиться плавать, выучить таблицу умножения), отслеживайте прогресс, отмечайте достижения.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Palette" className="text-pink-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Творческое портфолио</p>
                      <p className="text-gray-700">Рисунки, поделки, стихи, сочинения — сохраняйте творческие работы ребёнка с датами и описаниями.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Calendar" className="text-cyan-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Режим дня</p>
                      <p className="text-gray-700">Создайте расписание дня ребёнка: подъём, школа, кружки, домашние задания, прогулки, сон. Формируйте здоровые привычки.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="BookOpen" className="text-emerald-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Дневник развития</p>
                      <p className="text-gray-700">Записывайте важные моменты: первые шаги, первое слово, смешные фразы, важные события. Создайте историю взросления.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Users" className="text-violet-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Социальное развитие</p>
                      <p className="text-gray-700">Друзья, общение, навыки коммуникации, конфликты и их решение. Помогайте ребёнку строить здоровые отношения.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Brain" className="text-rose-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Психологическое состояние</p>
                      <p className="text-gray-700">Отслеживайте настроение, эмоции, поведенческие особенности. Консультации с психологом, рекомендации специалистов.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-yellow-400 rounded-xl p-6 text-center">
                  <p className="text-orange-900 font-bold text-xl mb-2">
                    🎯 Всё для гармоничного развития вашего ребёнка
                  </p>
                  <p className="text-orange-800 text-lg">
                    От рождения до совершеннолетия — сохраняйте каждый важный момент
                  </p>
                </div>


              </div>
            </div>

            {/* Блок 6: Ценности и традиции */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-pink-600 mb-4 flex items-center gap-3">
                <Icon name="Heart" size={28} />
                Ценности и традиции
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Семья и Государство</strong> — информация о государственных программах поддержки семей, льготах, субсидиях и правах</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Голосования</strong> — принимайте важные решения демократически, учитывая мнение всех</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Генеалогическое древо</strong> — создайте родословную, храните историю поколений <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Духовность и вера</strong> — раздел для хранения духовных практик и традиций <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Культурные особенности</strong> — информация о национальностях, традициях, обычаях семьи</p>
                </div>
              </div>
            </div>

            {/* Блок 7: Здоровье и благополучие */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-3">
                <Icon name="Heart" size={28} />
                Здоровье и благополучие
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Медицинские карты</strong> — храните данные о здоровье всех членов семьи, прививки, анализы, диагнозы <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Запись к врачам</strong> — отслеживайте визиты к специалистам, результаты обследований <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Спорт и фитнес</strong> — планы тренировок, трекер активности, цели по здоровью <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Питание</strong> — рацион, калории, полезные привычки, рекомендации диетолога <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
              </div>
            </div>

            {/* Блок 8: Питомцы */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-amber-600 mb-4 flex items-center gap-3">
                <Icon name="Dog" size={28} />
                Питомцы
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Профили питомцев</strong> — кличка, порода, возраст, фото, особенности характера <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Здоровье питомцев</strong> — ветеринарные карты, прививки, визиты к ветеринару <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Уход и расписание</strong> — кормление, прогулки, груминг, дрессировка <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
              </div>
            </div>

            {/* Блок 9: Общение */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-indigo-600 mb-4 flex items-center gap-3">
                <Icon name="MessageCircle" size={28} />
                Общение
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Семейный чат</strong> — общайтесь с родными в приватном пространстве, делитесь фото и новостями <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Видеозвонки</strong> — встроенные групповые видеозвонки для общения на расстоянии <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Уведомления и напоминания</strong> — автоматические напоминания о событиях и задачах</p>
                </div>
              </div>
            </div>

            {/* Блок 10: СУПЕРСИЛА - ИИ и голосовое управление */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 shadow-xl border-4 border-cyan-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-cyan-400 text-blue-900 px-4 py-1 rounded-full text-sm font-bold">
                  🤖 ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Icon name="Brain" size={36} className="text-cyan-300" />
                ИИ-помощник и голосовое управление
              </h3>
              <div className="space-y-4 ml-2">
                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="MessageSquare" className="text-blue-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Умный семейный ассистент</p>
                      <p className="text-gray-700">ИИ знает все о вашей семье: предпочтения, расписание, интересы каждого члена. Отвечает на вопросы, даёт советы, помогает планировать.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Mic" className="text-purple-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Голосовое управление</p>
                      <p className="text-gray-700">Интеграция с Алисой, Siri, Google Assistant. Скажите: "Добавь молоко в список покупок" или "Напомни Маше о тренировке" — ИИ всё сделает.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="MapPin" className="text-red-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Планирование путешествий</p>
                      <p className="text-gray-700">ИИ изучает предпочтения семьи и предлагает направления для отдыха. Находит отели, туры, билеты с учётом бюджета и интересов каждого.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Theater" className="text-pink-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Культурные рекомендации</p>
                      <p className="text-gray-700">Если кто-то любит театр — ИИ предложит спектакли. Кто-то увлекается кино — подберёт премьеры. Учитывает интересы каждого.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Search" className="text-green-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Поиск и мониторинг информации</p>
                      <p className="text-gray-700">ИИ отслеживает цены на билеты, акции в магазинах, новые кружки для детей, скидки на отели — всё что важно вашей семье.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Sparkles" className="text-yellow-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Персональные предложения</p>
                      <p className="text-gray-700">На основе анализа предпочтений ИИ предлагает рестораны, мероприятия, товары, услуги — точно то, что нужно вашей семье прямо сейчас.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Calendar" className="text-orange-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Умное планирование</p>
                      <p className="text-gray-700">ИИ предлагает оптимальное расписание с учётом занятости всех, напоминает о важных событиях, предупреждает о конфликтах в календаре.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="ShoppingCart" className="text-indigo-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Автоматические списки покупок</p>
                      <p className="text-gray-700">ИИ анализирует потребление продуктов, предлагает что докупить, напоминает о заканчивающихся товарах, оптимизирует бюджет.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Apple" className="text-green-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">ИИ-диетолог и подсчёт калорий</p>
                      <p className="text-gray-700">Ведёт учёт калорий для каждого члена семьи. Рассчитывает калорийность продуктов и готовых блюд. Анализирует рецепты: ИИ скажет сколько калорий в порции борща или салата. Предлагает здоровые альтернативы и персональные диеты.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Utensils" className="text-orange-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Анализ питания семьи</p>
                      <p className="text-gray-700">ИИ отслеживает что ест каждый член семьи, считает БЖУ, витамины, минералы. Предупреждает о несбалансированном питании и даёт рекомендации по улучшению рациона.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Heart" className="text-rose-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Семейный психолог</p>
                      <p className="text-gray-700">ИИ помогает разрешать конфликты, даёт советы по воспитанию детей, поддерживает в трудных ситуациях. Доступен 24/7.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="TrendingUp" className="text-cyan-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Аналитика и инсайты</p>
                      <p className="text-gray-700">ИИ анализирует активность семьи, выявляет паттерны, предлагает улучшения: "Дети стали меньше читать" или "Семья давно не ездила вместе на природу".</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Zap" className="text-amber-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Быстрые команды</p>
                      <p className="text-gray-700">"Создай задачу для всех", "Запланируй семейный ужин на выходных", "Покажи расходы за месяц" — говорите естественным языком, ИИ понимает всё.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/95 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Icon name="Globe" className="text-emerald-600 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-bold text-gray-900 text-lg mb-1">Синхронизация с устройствами</p>
                      <p className="text-gray-700">Все голосовые помощники синхронизированы. Сказали команду на телефоне, умной колонке или часах — всё обновляется мгновенно.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-cyan-400 rounded-xl p-6 text-center">
                <p className="text-blue-900 font-bold text-xl mb-2">
                  🚀 ИИ делает управление семьёй простым и приятным
                </p>
                <p className="text-blue-800 text-lg">
                  Просто говорите что нужно — технологии сделают всё за вас
                </p>
              </div>
            </div>

            {/* Блок 11: Настройки и безопасность */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-slate-600 mb-4 flex items-center gap-3">
                <Icon name="Settings" size={28} />
                Настройки и безопасность
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Управление семьёй</strong> — добавляйте и удаляйте членов, настраивайте их права</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>Приватность</strong> — контролируйте, кто и что видит в семейном пространстве</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0 text-lg">✅</span>
                  <p><strong>PWA установка</strong> — установите приложение на телефон как обычное приложение</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-blue-600 flex-shrink-0 text-lg">🔄</span>
                  <p><strong>Многоязычность</strong> — поддержка разных языков и культур <span className="text-blue-600 text-sm font-semibold">Скоро</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Target" className="text-blue-600" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Что даёт вашей семье?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-lg">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Порядок и организация</h3>
                  <p className="text-gray-700">
                    Все дела, события и планы в одном месте. Никто ничего не забудет.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="Users" className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Укрепление связей</h3>
                  <p className="text-gray-700">
                    Совместные дела и цели объединяют семью, создают общие воспоминания.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="Award" className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Мотивация детей</h3>
                  <p className="text-gray-700">
                    Система уровней и баллов делает домашние дела интересными для детей.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Icon name="Shield" className="text-pink-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Ответственность</h3>
                  <p className="text-gray-700">
                    Каждый видит свой вклад в семью и понимает свою значимость.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="BookOpen" className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Семейная история</h3>
                  <p className="text-gray-700">
                    Сохраняйте традиции, создавайте историю для будущих поколений.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Icon name="Sparkles" className="text-indigo-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-2">Умные решения</h3>
                  <p className="text-gray-700">
                    AI-помощник подсказывает, помогает планировать и решать проблемы.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Users" className="text-indigo-600" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Для кого это приложение?
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Icon name="Home" className="text-blue-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Для семей с детьми</h3>
                <p className="text-gray-700 text-lg">
                  Организуйте учёбу, развитие, здоровье детей. Мотивируйте их через систему задач и наград.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Icon name="Users" className="text-purple-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Для больших семей</h3>
                <p className="text-gray-700 text-lg">
                  Координируйте действия нескольких поколений, справедливо распределяйте обязанности.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Icon name="Heart" className="text-red-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Для молодых пар</h3>
                <p className="text-gray-700 text-lg">
                  Начните выстраивать семейные традиции, ставьте совместные цели, планируйте будущее.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Icon name="Sparkles" className="text-yellow-600" size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Для активных семей</h3>
                <p className="text-gray-700 text-lg">
                  Планируйте путешествия, события, хобби. Храните воспоминания и достижения.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-xl p-10 mb-8 text-white">
          <div className="text-center">
            <Icon name="Rocket" className="mx-auto mb-6" size={64} />
            <h2 className="text-4xl font-bold mb-4">
              Начните прямо сейчас!
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Присоединяйтесь к тысячам семей, которые уже используют "Наша семья"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/login'}
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6"
              >
                <Icon name="LogIn" className="mr-2" size={24} />
                Войти в приложение
              </Button>
              <Button
                onClick={() => window.location.href = '/welcome'}
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                <Icon name="Home" className="mr-2" size={24} />
                На главную
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Есть вопросы?
            </h2>
            <p className="text-xl text-gray-700 mb-6">
              Мы всегда готовы помочь вашей семье
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/support'}
                variant="outline"
                className="border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Icon name="MessageCircle" className="mr-2" size={20} />
                Написать в поддержку
              </Button>
              <Button
                onClick={() => window.location.href = '/community'}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Icon name="Users" className="mr-2" size={20} />
                Присоединиться к сообществу
              </Button>
            </div>
          </div>
        </section>

        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">
            © 2024 Наша семья. Объединяем семьи. Укрепляем общество.
          </p>
        </div>
      </div>
    </div>
  );
}