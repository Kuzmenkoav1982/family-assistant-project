import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useDevSectionVotes } from '@/hooks/useDevSectionVotes';

interface DevSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  path?: string;
}

const devSections: DevSection[] = [
  {
    id: 'education',
    title: 'Образование',
    description: 'Школа, кружки и развитие детей',
    icon: 'GraduationCap',
    path: '/education',
    features: [
      '🎓 Школьное расписание — Уроки, звонки, расписание по дням недели для каждого ребёнка',
      '📚 Домашние задания — Учёт ДЗ с напоминаниями, контроль выполнения, помощь родителей',
      '📊 Успеваемость — Электронный дневник: оценки по предметам, средний балл, динамика',
      '👨‍🏫 Контакты учителей — База всех преподавателей: ФИО, предмет, телефон, email',
      '🎨 Кружки и секции — Расписание дополнительных занятий: спорт, музыка, рисование, языки',
      '📅 Школьные события — Родительские собрания, концерты, олимпиады, экскурсии',
      '💰 Расходы на образование — Учёт трат: учебники, форма, кружки, репетиторы, канцелярия',
      '🏆 Достижения детей — Грамоты, дипломы, победы в конкурсах, спортивные результаты',
      '📖 План обучения — Цели на четверть и год, подготовка к экзаменам, развитие навыков',
      '👥 Родительский комитет — Чат с другими родителями класса, совместные организационные вопросы',
      '🎯 Профориентация — Выбор будущей профессии, рекомендации вузов, подготовка к ЕГЭ',
      '📈 Прогресс обучения — Графики успеваемости, сравнение по предметам, зоны роста'
    ]
  },
  {
    id: 'album',
    title: 'Альбом',
    description: 'Семейный фотоальбом',
    icon: 'Image',
    features: [
      '📸 Хранение семейных фото — Неограниченное облачное хранилище для всех семейных фотографий',
      '📁 Альбомы по событиям — Организация фото по событиям: дни рождения, отпуск, школьные праздники',
      '📅 Автоматическая сортировка — Умная сортировка по датам, людям, местам съёмки',
      '👥 Совместный доступ — Все члены семьи могут загружать и просматривать фотографии',
      '🔍 Поиск по фото — Быстрый поиск по людям, датам, местам, событиям',
      '🎨 Редактор фото — Базовое редактирование: обрезка, фильтры, коррекция',
      '💬 Комментарии — Обсуждение фотографий, воспоминания, истории к снимкам',
      '⭐ Избранное — Отметка лучших фотографий для быстрого доступа',
      '📤 Экспорт альбомов — Создание фотокниг, экспорт для печати',
      '🔐 Приватность — Настройка видимости альбомов для разных членов семьи',
      '📊 Статистика — Сколько фото за год, самые активные фотографы семьи',
      '🎬 Видео — Хранение семейных видео рядом с фотографиями'
    ]
  },
  {
    id: 'blog',
    title: 'Блог',
    description: 'Семейный блог и истории',
    icon: 'BookOpen',
    features: [
      '✍️ Записи о событиях — Ведение семейного дневника: что происходит в жизни семьи',
      '📸 Фото и видео — Прикрепление медиафайлов к записям',
      '👥 Авторство — Каждый член семьи может вести свой блог',
      '💬 Комментарии — Обсуждение записей внутри семьи',
      '🔐 Уровни приватности — Публичные, семейные, личные записи',
      '🏷️ Теги и категории — Организация записей по темам',
      '🔍 Поиск — Быстрый поиск по всем записям',
      '📅 Календарь записей — Просмотр всех событий по датам',
      '⭐ Важные моменты — Отметка значимых событий',
      '📤 Экспорт — Сохранение блога в PDF, создание семейной летописи',
      '🎨 Оформление — Красивые шаблоны для записей',
      '📊 Статистика — Кто больше всего пишет, популярные темы'
    ]
  },
  {
    id: 'chat',
    title: 'Чат',
    description: 'Семейный чат в реальном времени',
    icon: 'MessageCircle',
    features: [
      '💬 Общий чат семьи — Групповой чат для всех членов семьи',
      '📱 Личные сообщения — Приватная переписка между членами семьи',
      '📸 Медиафайлы — Отправка фото, видео, голосовых сообщений',
      '📎 Файлы — Обмен документами и файлами',
      '🔔 Уведомления — Push-уведомления о новых сообщениях',
      '😊 Эмодзи и стикеры — Семейные стикерпаки',
      '📍 Геолокация — Делиться местоположением с семьёй',
      '🗓️ Планирование — Прямо из чата создавать события в календаре',
      '🔍 Поиск по истории — Быстрый поиск сообщений и файлов',
      '⭐ Важные сообщения — Закрепление важной информации',
      '👥 Групповые чаты — Создание отдельных чатов для подгрупп',
      '🔐 Безопасность — Зашифрованные сообщения'
    ]
  },
  {
    id: 'community',
    title: 'Сообщество',
    description: 'Сообщество семей',
    icon: 'Users2',
    path: '/community',
    features: [
      '👥 Форум семей — Общение с другими семьями, обмен опытом',
      '📝 Тематические обсуждения — Отдельные ветки: воспитание, здоровье, образование, быт',
      '🎉 События и встречи — Организация совместных мероприятий для семей',
      '💡 Советы от опытных — Истории успеха, лайфхаки от других родителей',
      '🔍 Поиск единомышленников — Нахождение семей с похожими интересами',
      '📸 Фотогалерея — Совместные фото с семейных мероприятий',
      '⭐ Рейтинг активности — Самые активные участники сообщества',
      '🎓 Мастер-классы — Онлайн и офлайн обучающие встречи',
      '🤝 Взаимопомощь — Помощь семей друг другу в разных ситуациях',
      '🗺️ Карта семей — География участников сообщества',
      '📢 Объявления — Доска объявлений для обмена вещами, услугами',
      '🔐 Модерация — Безопасное пространство с проверенными участниками'
    ]
  }
];

export default function InDevelopmentList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { votes, loading, castVote } = useDevSectionVotes();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const handleVote = async (sectionId: string, voteType: 'up' | 'down') => {
    const result = await castVote(sectionId, voteType, comments[sectionId]);
    
    if (result.success) {
      toast({
        title: voteType === 'up' ? '👍 Спасибо за голос!' : '👎 Голос учтён',
        description: 'Ваше мнение поможет нам определить приоритеты',
      });
      setComments(prev => ({ ...prev, [sectionId]: '' }));
    } else {
      toast({
        title: 'Ошибка',
        description: result.error || 'Не удалось проголосовать',
        variant: 'destructive'
      });
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getSectionVotes = (sectionId: string) => {
    return votes[sectionId] || { up: 0, down: 0 };
  };

  const totalVotes = (sectionId: string) => {
    const sectionVotes = getSectionVotes(sectionId);
    return sectionVotes.up + sectionVotes.down;
  };

  const voteScore = (sectionId: string) => {
    const sectionVotes = getSectionVotes(sectionId);
    return sectionVotes.up - sectionVotes.down;
  };

  // Сортируем разделы по количеству голосов
  const sortedSections = [...devSections].sort((a, b) => voteScore(b.id) - voteScore(a.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
      {/* Шапка страницы */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={18} />
            Назад
          </Button>
          <h1 className="text-xl font-bold">В разработке</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6 max-w-6xl mt-16">
        {/* Заголовок */}
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-lg px-4 py-2">
            <Icon name="Construction" size={18} className="mr-2" />
            {devSections.length} разделов в разработке
          </Badge>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Будущие возможности приложения
          </h1>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Эти разделы находятся в активной разработке. Проголосуйте за те функции, 
            которые важны для вашей семьи, и мы приоритизируем их реализацию!
          </p>
        </div>

        {/* Инструкция */}
        <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Icon name="Info" size={24} />
              Как это работает?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-blue-800">
            <div className="flex items-start gap-3">
              <Icon name="ThumbsUp" size={20} className="mt-1 flex-shrink-0" />
              <div>
                <strong>Голосуйте "За"</strong> — если раздел нужен вашей семье
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="ThumbsDown" size={20} className="mt-1 flex-shrink-0" />
              <div>
                <strong>Голосуйте "Против"</strong> — если считаете раздел неважным
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="MessageSquare" size={20} className="mt-1 flex-shrink-0" />
              <div>
                <strong>Оставляйте комментарии</strong> — расскажите, какие функции хотели бы видеть
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="TrendingUp" size={20} className="mt-1 flex-shrink-0" />
              <div>
                <strong>Следите за рейтингом</strong> — самые популярные разделы будут реализованы быстрее
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Список разделов */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedSections.map((section, index) => {
              const sectionVotes = getSectionVotes(section.id);
              const isExpanded = expandedSections.includes(section.id);
              const score = voteScore(section.id);
              const total = totalVotes(section.id);

              return (
                <Card 
                  key={section.id}
                  className="shadow-lg hover:shadow-xl transition-shadow border-2"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <Icon name={section.icon} size={28} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <CardTitle className="text-2xl">{section.title}</CardTitle>
                            <Badge variant="outline" className="text-sm">
                              #{index + 1}
                            </Badge>
                          </div>
                          <CardDescription className="text-base">
                            {section.description}
                          </CardDescription>
                        </div>
                      </div>

                      {/* Счётчик голосов */}
                      <div className="flex flex-col items-center gap-1 bg-gray-100 rounded-lg px-4 py-2 min-w-[100px]">
                        <div className={`text-2xl font-bold ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {score > 0 ? '+' : ''}{score}
                        </div>
                        <div className="text-xs text-gray-500">
                          {total} {total === 1 ? 'голос' : total < 5 ? 'голоса' : 'голосов'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Icon name="ThumbsUp" size={12} className="text-green-600" />
                            {sectionVotes.up}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="ThumbsDown" size={12} className="text-red-600" />
                            {sectionVotes.down}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    {/* Кнопка раскрытия функций */}
                    <Button
                      variant="ghost"
                      onClick={() => toggleSection(section.id)}
                      className="w-full mb-4 justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name="ListChecks" size={18} />
                        Планируемые функции ({section.features.length})
                      </span>
                      <Icon 
                        name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                        size={18} 
                      />
                    </Button>

                    {/* Список функций */}
                    {isExpanded && (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <ul className="space-y-2">
                          {section.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Icon name="Check" size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Комментарий */}
                    <div className="mb-4">
                      <Textarea
                        placeholder="Оставьте комментарий или предложение по этому разделу (необязательно)"
                        value={comments[section.id] || ''}
                        onChange={(e) => setComments(prev => ({ ...prev, [section.id]: e.target.value }))}
                        className="resize-none"
                        rows={2}
                      />
                    </div>

                    {/* Кнопки голосования */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleVote(section.id, 'up')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                        size="lg"
                      >
                        <Icon name="ThumbsUp" size={18} className="mr-2" />
                        За ({sectionVotes.up})
                      </Button>
                      
                      <Button
                        onClick={() => handleVote(section.id, 'down')}
                        variant="outline"
                        className="flex-1 border-2"
                        size="lg"
                      >
                        <Icon name="ThumbsDown" size={18} className="mr-2" />
                        Против ({sectionVotes.down})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Футер */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-6 text-center">
            <Icon name="Heart" size={32} className="mx-auto mb-3 text-purple-600" />
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              Спасибо за участие!
            </h3>
            <p className="text-purple-700 mb-4">
              Ваше мнение помогает нам создавать приложение, которое действительно нужно семьям
            </p>
            <Button
              onClick={() => navigate('/feedback')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Icon name="MessageSquare" size={18} className="mr-2" />
              Оставить отзыв
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}