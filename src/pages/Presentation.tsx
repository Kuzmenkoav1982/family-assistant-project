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

      // Добавляем класс для печати
      element.classList.add('printing');
      
      // Небольшая задержка для применения стилей
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

      // Убираем класс после рендера
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

      pdf.save('Семейный-Органайзер-Презентация.pdf');
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
          .printing .text-center:not(section) {
            page-break-after: avoid !important;
            margin-bottom: 6mm !important;
          }
          .printing .bg-white\\/10,
          .printing .bg-white,
          .printing .bg-gradient-to-r,
          .printing .bg-gradient-to-br,
          .printing .bg-orange-50,
          .printing .bg-blue-50,
          .printing .bg-green-50,
          .printing .bg-pink-50,
          .printing .bg-purple-50 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .printing > div:first-child {
            margin-bottom: 8mm !important;
            page-break-after: avoid !important;
          }
          .printing h1 {
            font-size: 2rem !important;
          }
          .printing h2 {
            font-size: 1.5rem !important;
          }
          .printing h3 {
            font-size: 1.25rem !important;
          }
          .printing .grid {
            gap: 4mm !important;
          }
          
          /* Скрываем кнопки при печати */
          .fixed {
            display: none !important;
          }
        }
        
        /* Стили для обычного просмотра перед PDF */
        @media screen {
          #presentation-content {
            min-height: 100vh;
          }
        }
      `}</style>

      <div id="presentation-content" className="max-w-4xl mx-auto px-6 py-12 print:px-0 print:py-0">
        
        <div className="text-center mb-16 print:mb-8 print:break-inside-avoid">
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            Семейный Органайзер
          </h1>
          <p className="text-2xl text-purple-600">
            Объединяем семьи. Укрепляем общество.
          </p>
        </div>

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8 print:mb-6 print:break-inside-avoid">
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

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8 print:mb-6 print:break-inside-avoid">
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

        <section className="bg-white rounded-3xl shadow-xl p-5 md:p-10 mb-8 print:mb-6 border-2 md:border-4 border-orange-200 print:break-inside-avoid">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <Icon name="Baby" className="text-orange-500 flex-shrink-0" size={32} />
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-gray-800">
                Семейный органайзер — управление всеми сферами жизни семьи
              </h2>
              <p className="text-sm md:text-lg text-orange-600 font-medium">
                Комплексное пространство для организации и развития семьи
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200 md:border-2 mb-6">
            <p className="text-sm md:text-lg text-gray-700 leading-relaxed">
              Семейный органайзер — это пространство, где все члены семьи участвуют в жизнедеятельности семьи, 
              которое создано для минимизации траты времени на рутинные ежедневные дела, позволяющее грамотно 
              планировать и контролировать все самые важные сферы жизни членов семьи (здоровье, финансы, развитие детей, 
              планирование периодически повторяющихся дел и долгосрочных целей и т.д.).
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-purple-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Brain" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Интегрированный ИИ
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    В семейный органайзер интегрирован ИИ, который будет помогать всем членам семьи достигать 
                    успехов во всех жизненных ситуациях.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-teal-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-teal-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="GraduationCap" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Помощь родителям в развитии детей
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Родителям помогать оценивать с помощью тестов уровень развития детей и на основании 
                    результатов предлагать рекомендации для развития необходимых компетенций.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-orange-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="CalendarRange" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Планирование расписания и меню
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Планировать расписание. Предлагать блюда для приготовления с учётом пищевых предпочтений 
                    и особенностей всех членов семьи с возможностью голосования за предложенный вариант всеми 
                    членами семьи.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-pink-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Heart" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Жалобная книга с ИИ-анализом
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Раздел «Жалобная книга» с ИИ-анализом конфликтных ситуаций и рекомендациями по их решению. 
                    Любой член семьи может оставить жалобу на другого члена семьи. ИИ проанализирует жалобу и 
                    предложит решение.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-indigo-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="MessageCircle" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Семейный чат
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Внутренний чат для быстрой коммуникации между всеми членами семьи. Обсуждайте планы, 
                    делитесь новостями и координируйте действия в реальном времени.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Sparkles" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Семейные традиции и ценности
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Сохраняйте и передавайте семейные традиции следующим поколениям. Записывайте истории, 
                    рецепты и важные моменты семейной истории.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-blue-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Mic" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Голосовой помощник
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Интеграция с голосовыми ассистентами (Алиса, Маруся). Добавляйте задачи, проверяйте 
                    календарь и управляйте органайзером голосом — удобно, когда руки заняты.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-yellow-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="CheckSquare" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Система задач и баллов
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Справедливое распределение домашних дел с системой вознаграждений. Каждая выполненная 
                    задача приносит баллы, которые можно обменять на привилегии или карманные деньги.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-orange-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Target" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    Семейные и личные цели
                  </h3>
                  <p className="text-sm md:text-base text-gray-700">
                    Ставьте общие цели семьи и личные цели каждого члена. Отслеживайте прогресс, 
                    поддерживайте друг друга в достижениях и празднуйте успехи вместе.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl md:rounded-2xl p-4 md:p-8 border border-orange-200 md:border-2">
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon name="Brain" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">
                    ИИ-оценка развития детей по 8 компетенциям
                  </h3>
                  <p className="text-sm md:text-lg text-gray-700">
                    Искусственный интеллект анализирует развитие ребёнка в ключевых областях: 
                    физическое здоровье, эмоциональный интеллект, социальные навыки, 
                    креативность, логическое мышление, самостоятельность, ответственность и обучаемость.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-4 md:mt-6">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Activity" className="text-red-500" size={20} />
                    <span className="font-semibold text-gray-800">Физическое развитие</span>
                  </div>
                  <p className="text-sm text-gray-600">Здоровье, координация, активность</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Heart" className="text-pink-500" size={20} />
                    <span className="font-semibold text-gray-800">Эмоциональный интеллект</span>
                  </div>
                  <p className="text-sm text-gray-600">Понимание и управление эмоциями</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Users" className="text-blue-500" size={20} />
                    <span className="font-semibold text-gray-800">Социальные навыки</span>
                  </div>
                  <p className="text-sm text-gray-600">Общение, дружба, работа в команде</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Lightbulb" className="text-yellow-500" size={20} />
                    <span className="font-semibold text-gray-800">Креативность</span>
                  </div>
                  <p className="text-sm text-gray-600">Творческое мышление, воображение</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Brain" className="text-purple-500" size={20} />
                    <span className="font-semibold text-gray-800">Логика и мышление</span>
                  </div>
                  <p className="text-sm text-gray-600">Анализ, причинно-следственные связи</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Target" className="text-green-500" size={20} />
                    <span className="font-semibold text-gray-800">Самостоятельность</span>
                  </div>
                  <p className="text-sm text-gray-600">Независимость, инициатива</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="Shield" className="text-indigo-500" size={20} />
                    <span className="font-semibold text-gray-800">Ответственность</span>
                  </div>
                  <p className="text-sm text-gray-600">Надёжность, выполнение обещаний</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon name="BookOpen" className="text-orange-500" size={20} />
                    <span className="font-semibold text-gray-800">Обучаемость</span>
                  </div>
                  <p className="text-sm text-gray-600">Усвоение новых знаний и навыков</p>
                </div>
              </div>
            </div>


                    Награды за прогресс мотивируют ребёнка развиваться дальше
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl md:rounded-2xl p-5 md:p-8 text-white text-center">
              <Icon name="Rocket" className="mx-auto mb-3 md:mb-4" size={36} />
              <h3 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                Результат: счастливые дети с гармоничным развитием
              </h3>
              <p className="text-sm md:text-lg text-white/90 max-w-3xl mx-auto">
                Родители получают не просто приложение, а настоящего помощника в воспитании. 
                ИИ берёт на себя аналитику, даёт конкретные советы, а семья видит реальные 
                результаты — уверенные, ответственные и всесторонне развитые дети.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-xl p-10 mb-8 print:mb-6 text-white print:break-inside-avoid">
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

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8 print:mb-6 print:break-inside-avoid">
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

        <section className="text-center py-12 print:break-inside-avoid">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <span>Начните укреплять свою семью сегодня</span>
            <ArrowRight size={24} />
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-10 mt-8 print:mt-6 print:break-inside-avoid">
          <div className="flex items-center gap-4 mb-6">
            <Icon name="Mail" className="text-purple-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Контакты
            </h2>
          </div>
          
          <div className="space-y-4 text-lg">
            <div className="flex items-center gap-3">
              <Icon name="User" className="text-gray-600" size={24} />
              <span className="font-semibold text-gray-800">Кузьменко Алексей</span>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="Phone" className="text-green-600" size={24} />
              <a href="tel:+79850807888" className="text-purple-600 hover:text-purple-800 font-medium">
                +7 985 080 78 88
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Icon name="Mail" className="text-blue-600" size={24} />
              <a href="mailto:kuzmenkoav1982@yandex.ru" className="text-purple-600 hover:text-purple-800 font-medium">
                kuzmenkoav1982@yandex.ru
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}