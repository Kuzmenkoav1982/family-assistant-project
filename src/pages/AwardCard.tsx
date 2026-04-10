import { useState } from 'react';
import html2canvas from 'html2canvas';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/a27a631b-a410-4e33-a494-7f60b9a8eedb.JPG';

export default function AwardCard() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPNG = async () => {
    setIsDownloading(true);
    try {
      const card = document.getElementById('award-card');
      if (!card) return;

      const canvas = await html2canvas(card, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = 'Nasha-Semya-Award-Card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Ошибка при скачивании карточки:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Карточка проекта</h1>
            <p className="text-sm text-gray-500">
              Для заявки в Generation AI Awards 2026
            </p>
          </div>
          <Button
            onClick={downloadPNG}
            disabled={isDownloading}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Icon name="Download" size={18} className="mr-2" />
            {isDownloading ? 'Готовлю PNG...' : 'Скачать PNG'}
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          <div
            id="award-card"
            className="relative w-full rounded-3xl overflow-hidden"
            style={{
              aspectRatio: '16 / 9',
              background:
                'linear-gradient(135deg, #fef3c7 0%, #fce7f3 30%, #ede9fe 70%, #dbeafe 100%)',
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, #f59e0b 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ec4899 0%, transparent 40%), radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 50%)',
              }}
            />

            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-md flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-600" />
              <span className="text-[10px] sm:text-xs font-bold text-purple-800 uppercase tracking-wider">
                Generation AI Awards 2026
              </span>
            </div>

            <div className="relative h-full flex items-center p-6 sm:p-10 md:p-14">
              <div className="flex items-center gap-6 sm:gap-10 w-full">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 blur-2xl opacity-40 rounded-3xl" />
                    <img
                      src={LOGO_URL}
                      alt="Наша Семья — логотип"
                      crossOrigin="anonymous"
                      className="relative w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 rounded-3xl shadow-2xl object-cover border-4 border-white"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h1
                    className="font-black text-gray-900 leading-tight mb-2 sm:mb-3"
                    style={{
                      fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
                      background:
                        'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f59e0b 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Наша Семья
                  </h1>
                  <p className="text-xs sm:text-sm md:text-lg text-gray-700 font-medium mb-3 sm:mb-5 leading-snug">
                    AI-платформа для управления
                    <br />
                    семейной жизнью
                  </p>

                  <div className="inline-block bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-lg border border-purple-200">
                    <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">
                      Номинация
                    </p>
                    <p className="text-[10px] sm:text-sm md:text-base font-bold text-purple-700">
                      Лучший стартап в области
                      <br className="hidden sm:block" />
                      {' '}
                      генеративного AI
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 sm:bottom-6 left-6 sm:left-10 right-6 sm:right-10 flex items-center justify-between text-[8px] sm:text-xs text-gray-600">
              <div className="flex items-center gap-1 sm:gap-2">
                <Icon name="Globe" size={12} className="text-purple-600" />
                <span className="font-semibold">nasha-semiya.ru</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Icon name="Sparkles" size={12} className="text-pink-600" />
                <span className="font-semibold">YandexGPT · Yandex Vision</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Icon name="Building2" size={12} className="text-indigo-600" />
                <span className="font-semibold">ИП Кузьменко А.В.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
            <Icon name="Info" size={16} className="text-purple-600" />
            Как использовать
          </h3>
          <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
            <li>Нажми «Скачать PNG» — файл сохранится на компьютер</li>
            <li>В форме заявки Generation AI Awards 2026 найди поле «Карточка проекта»</li>
            <li>Загрузи скачанный файл (горизонтальный PNG, содержит лого, название и номинацию)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
