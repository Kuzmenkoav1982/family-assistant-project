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

        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Icon name="Sparkles" className="text-yellow-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Возможности для вашей семьи
            </h2>
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
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Профили членов семьи</strong> — создайте индивидуальные профили с фото, датой рождения, достижениями и статистикой</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Уровни и опыт</strong> — система уровней мотивирует каждого члена семьи выполнять задачи и зарабатывать баллы</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Управление доступом</strong> — настройте права для каждого: кто может создавать задачи, управлять календарем, редактировать профили</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
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
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Задачи для всех</strong> — создавайте задачи, назначайте ответственных, устанавливайте сроки и приоритеты</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Система баллов</strong> — каждая выполненная задача приносит баллы и опыт, мотивируя всех участвовать</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Отслеживание прогресса</strong> — видите кто что сделал, сколько баллов заработал, какой вклад в семью</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Рецепты и меню</strong> — храните семейные рецепты, планируйте меню на неделю</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
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
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Семейный календарь</strong> — планируйте события, встречи, дни рождения, праздники</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Автоматические напоминания</strong> — получайте уведомления о предстоящих событиях</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Путешествия</strong> — планируйте поездки, маршруты, достопримечательности</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Дорожная карта жизни</strong> — отмечайте ключевые события и этапы жизни семьи</p>
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
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Семейный бюджет</strong> — учёт доходов и расходов, планирование финансов</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Семейные цели</strong> — ставьте финансовые цели (квартира, машина, отпуск) и отслеживайте прогресс</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Гараж</strong> — учёт транспорта, ТО, страховки, расходы на обслуживание</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Аналитика</strong> — графики расходов, статистика по категориям, прогнозы</p>
                </div>
              </div>
            </div>

            {/* Блок 5: ПРИОРИТЕТ - Развитие детей */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 shadow-xl border-4 border-yellow-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-400 text-orange-900 px-4 py-1 rounded-full text-sm font-bold">
                  ⭐ ПРИОРИТЕТ
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Icon name="Baby" size={36} className="text-yellow-300" />
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

              <div className="mt-6 bg-yellow-400 rounded-xl p-6 text-center">
                <p className="text-orange-900 font-bold text-xl mb-2">
                  🎯 Всё для гармоничного развития вашего ребёнка
                </p>
                <p className="text-orange-800 text-lg">
                  От рождения до совершеннолетия — сохраняйте каждый важный момент
                </p>
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
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Семейный кодекс</strong> — определите ценности, правила и принципы вашей семьи</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Голосования</strong> — принимайте важные решения демократически, учитывая мнение всех</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Генеалогическое древо</strong> — создайте родословную, храните историю поколений</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Духовность и вера</strong> — раздел для хранения духовных практик и традиций</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
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
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Медицинские карты</strong> — храните информацию о здоровье всех членов семьи</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Семейный психолог</strong> — встроенный AI-ассистент для психологической поддержки</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Домашние животные</strong> — профили питомцев, прививки, визиты к ветеринару</p>
                </div>
              </div>
            </div>

            {/* Блок 8: Коммуникация и поддержка */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-indigo-600 mb-4 flex items-center gap-3">
                <Icon name="MessageCircle" size={28} />
                Коммуникация и поддержка
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>AI-ассистент</strong> — умный помощник для решения семейных вопросов</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Сообщество</strong> — общайтесь с другими семьями, делитесь опытом</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Обратная связь</strong> — предлагайте новые функции, сообщайте о проблемах</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Техподдержка</strong> — быстрая помощь в решении вопросов</p>
                </div>
              </div>
            </div>

            {/* Блок 9: Настройки и безопасность */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h3 className="text-2xl font-bold text-slate-600 mb-4 flex items-center gap-3">
                <Icon name="Settings" size={28} />
                Настройки и безопасность
              </h3>
              <div className="space-y-3 ml-11">
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Управление семьёй</strong> — добавляйте и удаляйте членов, настраивайте их права</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Приватность</strong> — контролируйте, кто и что видит в семейном пространстве</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>PWA установка</strong> — установите приложение на телефон как обычное приложение</p>
                </div>
                <div className="flex gap-3">
                  <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={20} />
                  <p><strong>Многоязычность</strong> — поддержка разных языков и культур</p>
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