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
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            Наша семья
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

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Icon name="Sparkles" className="text-yellow-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Доступные функции
            </h2>
          </div>

          <div className="grid gap-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Users" className="text-blue-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Профили семьи
                </h3>
                <p className="text-gray-700">
                  Создайте профили для каждого члена семьи с фото, достижениями, 
                  уровнями и статистикой вклада в семейные дела.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="CheckSquare" className="text-green-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Задачи и поручения
                </h3>
                <p className="text-gray-700">
                  Распределяйте задачи, назначайте ответственных, отслеживайте прогресс. 
                  Система баллов мотивирует и показывает реальный вклад.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="Calendar" className="text-purple-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Календарь событий
                </h3>
                <p className="text-gray-700">
                  Планируйте семейные мероприятия, дни рождения, важные даты. 
                  Все события в одном месте с напоминаниями.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="Target" className="text-orange-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Семейные цели
                </h3>
                <p className="text-gray-700">
                  Ставьте общие цели (покупка квартиры, поездка, накопления) и 
                  отслеживайте прогресс всей семьёй.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Icon name="Heart" className="text-pink-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Ценности и традиции
                </h3>
                <p className="text-gray-700">
                  Документируйте семейные ценности, храните традиции и передавайте 
                  их следующим поколениям.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Icon name="Baby" className="text-indigo-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Развитие детей
                </h3>
                <p className="text-gray-700">
                  Отслеживайте успехи детей в учёбе, кружках, фиксируйте достижения 
                  и планируйте развитие.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Icon name="GitBranch" className="text-yellow-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Генеалогическое древо
                </h3>
                <p className="text-gray-700">
                  Создайте семейное древо с фотографиями, историями и связями 
                  между поколениями.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Icon name="BookOpen" className="text-teal-600" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Семейный блог
                </h3>
                <p className="text-gray-700">
                  Ведите дневник семейных событий, делитесь историями и 
                  создавайте цифровую память для будущих поколений.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl p-10 mb-8 border-2 border-amber-200">
          <div className="flex items-center gap-4 mb-8">
            <Icon name="Wrench" className="text-amber-600" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              В разработке — ваше мнение важно!
            </h2>
          </div>

          <p className="text-lg text-gray-700 mb-6">
            Мы активно работаем над новыми функциями и хотим услышать ваше мнение. 
            Голосуйте за те возможности, которые вам интересны — это поможет 
            нам приоритизировать разработку.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="MessageCircle" className="text-blue-600" size={24} />
                <h4 className="font-bold text-gray-800">Семейный чат</h4>
              </div>
              <p className="text-sm text-gray-600">
                Мессенджер для быстрого общения, обмена фото и файлами внутри семьи
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Wallet" className="text-green-600" size={24} />
                <h4 className="font-bold text-gray-800">Семейный бюджет</h4>
              </div>
              <p className="text-sm text-gray-600">
                Учёт доходов, расходов, планирование бюджета и финансовые цели
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="HeartPulse" className="text-red-600" size={24} />
                <h4 className="font-bold text-gray-800">Здоровье семьи</h4>
              </div>
              <p className="text-sm text-gray-600">
                Медкарты, график прививок, напоминания о приёме лекарств
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Car" className="text-gray-600" size={24} />
                <h4 className="font-bold text-gray-800">Гараж</h4>
              </div>
              <p className="text-sm text-gray-600">
                Учёт автомобилей, ТО, расход топлива, история обслуживания
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Image" className="text-purple-600" size={24} />
                <h4 className="font-bold text-gray-800">Фотоальбом</h4>
              </div>
              <p className="text-sm text-gray-600">
                Безлимитное хранение фото, умная сортировка, слайдшоу
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Brain" className="text-indigo-600" size={24} />
                <h4 className="font-bold text-gray-800">ИИ-психолог</h4>
              </div>
              <p className="text-sm text-gray-600">
                Консультации 24/7, анализ эмоций, советы по отношениям
              </p>
            </div>
          </div>

          <div className="mt-6 bg-amber-100 rounded-xl p-5 border border-amber-300">
            <p className="text-sm text-amber-900 font-medium">
              💡 <strong>Как это работает:</strong> Заходите в приложение, открывайте раздел 
              "В разработке" и голосуйте за функции, которые хотите видеть первыми. 
              Ваши голоса напрямую влияют на приоритеты!
            </p>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-10 mb-8">
          <div className="flex items-center gap-4 mb-8">
            <Icon name="Target" className="text-green-500" size={40} />
            <h2 className="text-3xl font-bold text-gray-800">
              Наша миссия
            </h2>
          </div>

          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <div className="bg-green-50 rounded-2xl p-6">
              <p className="font-semibold text-green-900 mb-3">
                🎯 Укрепить 10 миллионов семей к 2030 году
              </p>
              <ul className="space-y-2">
                <li className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Снизить семейные конфликты через справедливое распределение обязанностей</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Воспитать ответственное поколение через систему задач и достижений</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Сохранить семейные ценности и традиции для будущих поколений</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-600 flex-shrink-0">✓</span>
                  <span>Создать цифровую память семьи — фото, истории, достижения</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl shadow-xl p-10 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Присоединяйтесь сегодня!
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Войдите через Яндекс ID и начните организовывать свою семью
          </p>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => window.location.href = '/login'}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto"
            >
              Начать использовать
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </section>

        <div className="text-center text-gray-500 text-sm mt-12">
          <p>© 2025 Наша семья. Объединяем семьи. Укрепляем общество.</p>
        </div>
      </div>
    </div>
  );
}