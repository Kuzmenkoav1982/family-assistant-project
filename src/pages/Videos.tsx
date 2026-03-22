import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

const videos = [
  {
    id: 1,
    title: 'Обзор приложения «Наша Семья»',
    description: 'Полный обзор возможностей платформы: планирование, здоровье, питание, задачи и ИИ-помощник',
    embedUrl: 'https://rutube.ru/play/embed/e8451f5f3b3abb6b493c972d787602a8/',
  },
  {
    id: 2,
    title: 'Блок «Семья»: участники, дети и маячок',
    description: 'Подробный разбор раздела управления семьёй — вкладки Семья, Дети и функция отслеживания местоположения',
    embedUrl: 'https://rutube.ru/play/embed/2e9235e3835baebfb440d5395f1598fc/',
  },
];

export default function Videos() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Видео о приложении
          </h1>
          <p className="text-lg text-gray-500">
            Смотрите обзоры и инструкции по работе с «Наша Семья»
          </p>
        </div>

        <div className="space-y-14">
          {videos.map((video) => (
            <div key={video.id}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{video.title}</h2>
                <p className="text-gray-500 text-sm">{video.description}</p>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black aspect-video">
                <iframe
                  src={video.embedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="clipboard-write; autoplay"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
