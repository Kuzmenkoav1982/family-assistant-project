import { useEffect, useRef } from 'react';

const WELCOME_API = 'https://functions.poehali.dev/fe19c08e-4cc1-4aa8-a1af-b03678b7ba22';

function getSessionId() {
  let sid = sessionStorage.getItem('welcome_sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('welcome_sid', sid);
  }
  return sid;
}

export default function WelcomeVideo() {
  const videoRef = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          fetch(WELCOME_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'track_video_view',
              session_id: getSessionId(),
              user_agent: navigator.userAgent,
            }),
          }).catch(() => {});
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-4xl mx-auto px-4 space-y-16">

        <div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              🏠 Домовёнок — хранитель русских семей
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Мешок мастера для крепкой семьи
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Тысячу лет Домовёнок бережёт русские семьи. Теперь он собрал двенадцать опор
              в одно приложение. Когда крепка каждая семья — крепка вся Россия.
              Присоединяйтесь — вместе будем укреплять семьи, общество, страну.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="w-full sm:w-1/2 rounded-2xl shadow-xl bg-amber-50 flex items-center justify-center p-3">
              <img
                src="https://cdn.poehali.dev/files/ca712a09-b06f-4b9d-9369-d3baaa169b7e.jpg"
                alt="Домовёнок с мешком мастера — приложение Наша Семья"
                className="w-full object-contain rounded-xl"
              />
            </div>
            <div className="w-full sm:w-1/2 rounded-2xl shadow-xl bg-emerald-50 flex items-center justify-center p-3">
              <img
                src="https://cdn.poehali.dev/files/56dd1a64-098e-4403-ae09-9de6508be482.jpg"
                alt="Домовёнок с 12 опорами семейной жизни — приложение Наша Семья"
                className="w-full object-contain rounded-xl"
              />
            </div>
          </div>

          <div
            ref={videoRef}
            className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video"
          >
            <iframe
              src="https://rutube.ru/play/embed/43fc1759d245e8598f5abf7f19328eb8/"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="clipboard-write; autoplay"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Посмотрите, как работает семейное приложение
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Короткое видео о возможностях платформы «Наша Семья»
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
            <iframe
              src="https://rutube.ru/play/embed/e8451f5f3b3abb6b493c972d787602a8/"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="clipboard-write; autoplay"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Блок «Семья»: участники, дети и маячок
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Подробный обзор раздела управления семьёй — вкладки Семья, Дети и функция отслеживания местоположения
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
            <iframe
              src="https://rutube.ru/play/embed/2e9235e3835baebfb440d5395f1598fc/"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="clipboard-write; autoplay"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}