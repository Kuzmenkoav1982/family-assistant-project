import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/bucket/a27a631b-a410-4e33-a494-7f60b9a8eedb.JPG';

export default function AwardCard() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await fetch(LOGO_URL);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setLogoDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error('Ошибка загрузки логотипа:', e);
        setLogoDataUrl(LOGO_URL);
      }
    };
    loadLogo();
  }, []);

  const downloadPNG = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Карточка проекта</h1>
            <p className="text-sm text-gray-500">
              Для заявки в Generation AI Awards 2026
            </p>
          </div>
          <Button
            onClick={downloadPNG}
            disabled={isDownloading || !logoDataUrl}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Icon name="Download" size={18} className="mr-2" />
            {isDownloading ? 'Готовлю PNG...' : 'Скачать PNG'}
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 overflow-auto">
          <div
            ref={cardRef}
            id="award-card"
            style={{
              width: '1600px',
              height: '900px',
              position: 'relative',
              background:
                'linear-gradient(135deg, #fde68a 0%, #fbcfe8 25%, #ddd6fe 55%, #c7d2fe 100%)',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'radial-gradient(circle at 15% 20%, rgba(251, 146, 60, 0.4) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(236, 72, 153, 0.4) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.25) 0%, transparent 60%)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: '50px',
                right: '50px',
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '9999px',
                padding: '14px 28px',
                boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '2px solid #a855f7',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '9999px',
                  background: '#7c3aed',
                }}
              />
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#5b21b6',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                }}
              >
                Generation AI Awards 2026
              </span>
            </div>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                padding: '0 100px',
                gap: '80px',
              }}
            >
              <div style={{ flexShrink: 0, position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: '-30px',
                    background:
                      'linear-gradient(135deg, #fb923c 0%, #ec4899 50%, #a855f7 100%)',
                    filter: 'blur(60px)',
                    opacity: 0.5,
                    borderRadius: '40px',
                  }}
                />
                {logoDataUrl && (
                  <img
                    src={logoDataUrl}
                    alt="Наша Семья"
                    style={{
                      position: 'relative',
                      width: '420px',
                      height: '420px',
                      borderRadius: '48px',
                      boxShadow: '0 30px 80px rgba(0, 0, 0, 0.35)',
                      border: '8px solid white',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1
                  style={{
                    fontSize: '110px',
                    fontWeight: 900,
                    lineHeight: 1,
                    margin: 0,
                    marginBottom: '20px',
                    color: '#5b21b6',
                    textShadow: '0 4px 20px rgba(139, 92, 246, 0.25)',
                    letterSpacing: '-2px',
                  }}
                >
                  Наша Семья
                </h1>
                <p
                  style={{
                    fontSize: '34px',
                    color: '#374151',
                    fontWeight: 600,
                    margin: 0,
                    marginBottom: '40px',
                    lineHeight: 1.3,
                  }}
                >
                  AI-платформа для управления
                  <br />
                  семейной жизнью
                </p>

                <div
                  style={{
                    display: 'inline-block',
                    background: '#7c3aed',
                    borderRadius: '24px',
                    padding: '24px 36px',
                    boxShadow: '0 20px 50px rgba(124, 58, 237, 0.4)',
                    border: '3px solid #ffffff',
                  }}
                >
                  <p
                    style={{
                      fontSize: '16px',
                      color: '#e9d5ff',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      fontWeight: 700,
                      margin: 0,
                      marginBottom: '8px',
                    }}
                  >
                    Номинация
                  </p>
                  <p
                    style={{
                      fontSize: '30px',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Лучший стартап в области
                    <br />
                    генеративного AI
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '50px',
                left: '100px',
                right: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '22px',
                color: '#374151',
                fontWeight: 700,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '26px' }}>🌐</span>
                <span>nasha-semiya.ru</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '26px' }}>✨</span>
                <span>YandexGPT · Yandex Vision</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '26px' }}>🏢</span>
                <span>ИП Кузьменко А.В.</span>
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
            <li>Дождись загрузки логотипа (кнопка станет активной)</li>
            <li>Нажми «Скачать PNG» — файл 3200×1800 px сохранится на компьютер</li>
            <li>Загрузи файл в поле «Карточка проекта» формы заявки Generation AI Awards 2026</li>
          </ol>
          {!logoDataUrl && (
            <p className="mt-3 text-xs text-amber-600 flex items-center gap-1.5">
              <Icon name="Loader2" size={14} className="animate-spin" />
              Загружаю логотип...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
