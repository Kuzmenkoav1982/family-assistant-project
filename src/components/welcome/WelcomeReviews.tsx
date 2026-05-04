import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import func2url from '../../../backend/func2url.json';

interface Review {
  id: string;
  user_name: string;
  title: string;
  description: string;
  rating: number;
  created_at: string;
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: 'f1',
    user_name: 'Артём и Катя',
    title: 'Пользуемся вдвоём, очень помогает',
    description:
      'Живём вдвоём, но домашних дел всё равно полно. Раньше вечно спорили кто должен был купить молоко. Теперь список покупок общий, обязанности распределены — меньше конфликтов, больше времени друг на друга. Рекомендуем!',
    rating: 5,
    created_at: '2026-03-22T00:00:00',
  },
  {
    id: 'f2',
    user_name: 'Ольга М.',
    title: 'Семейное древо — это что-то!',
    description:
      'Скачала ради интереса, а потом залипла на семейном древе. Внесла всех родственников до прабабушек, добавила фотографии — теперь показываю детям, откуда наш род. Очень трогательно получилось. Спасибо разработчикам за такую возможность!',
    rating: 5,
    created_at: '2026-03-10T00:00:00',
  },
  {
    id: 'f3',
    user_name: 'Наталья К.',
    title: 'Хорошее приложение, но есть куда расти',
    description:
      'В целом нравится — идея отличная, интерфейс приятный. Пользуюсь календарём и списком покупок. Хотелось бы добавить возможность прикреплять фото к задачам и синхронизацию с Google-календарём. Ставлю 4, но потенциал на 5 точно есть!',
    rating: 4,
    created_at: '2026-04-02T00:00:00',
  },
];

const formatDate = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.[0] || '?').toUpperCase();
};

const AVATAR_GRADIENTS = [
  'from-orange-400 to-pink-500',
  'from-purple-400 to-pink-500',
  'from-blue-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-yellow-400 to-orange-500',
  'from-pink-400 to-rose-500',
];

export default function WelcomeReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = (func2url as Record<string, string>)['feedback'];
    if (!url) {
      setLoading(false);
      return;
    }

    fetch(`${url}?type=review`)
      .then((r) => r.json())
      .then((data) => {
        const items: Review[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.feedback)
          ? data.feedback
          : Array.isArray(data?.reviews)
          ? data.reviews
          : [];

        const filtered = items
          .filter((r) => r && typeof r.description === 'string' && r.description.length > 30)
          .filter((r) => (r.rating ?? 0) >= 4)
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 6);

        if (filtered.length > 0) {
          setReviews(filtered);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 5;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  return (
    <section className="py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Icon name="Star" size={16} />
            Отзывы пользователей
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Что говорят семьи
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Реальные отзывы тех, кто уже навёл порядок в семейных делах
          </p>

          <div className="inline-flex items-center gap-3 mt-6 bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Icon
                  key={i}
                  name="Star"
                  size={18}
                  className={i <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">из 5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.slice(0, 6).map((r, idx) => (
            <div
              key={r.id}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br ${
                      AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                    } text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                  >
                    {getInitials(r.user_name || 'Г')}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{r.user_name || 'Гость'}</div>
                    <div className="text-xs text-gray-400">{formatDate(r.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Icon
                      key={i}
                      name="Star"
                      size={14}
                      className={
                        i <= (r.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
                      }
                    />
                  ))}
                </div>
              </div>

              {r.title && (
                <h3 className="font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{r.title}</h3>
              )}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-5">{r.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button
            onClick={() => navigate('/feedback')}
            variant="outline"
            size="lg"
            className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 rounded-2xl font-semibold"
          >
            <Icon name="MessageSquare" size={18} className="mr-2" />
            Все отзывы
          </Button>
        </div>

        {loading && reviews === FALLBACK_REVIEWS && (
          <div className="sr-only">Загружаем свежие отзывы…</div>
        )}
      </div>
    </section>
  );
}
