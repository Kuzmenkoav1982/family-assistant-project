export const availableSections = [
  { id: 'family', icon: 'Users', label: 'Профили семьи' },
  { id: 'tasks', icon: 'CheckSquare', label: 'Задачи' },
  { id: 'recipes', icon: 'ChefHat', label: 'Рецепты' },
  { id: 'trips', icon: 'Plane', label: 'Путешествия' },
  { id: 'health', icon: 'Heart', label: 'Здоровье' },
  { id: 'analytics', icon: 'BarChart3', label: 'Аналитика' },
  { id: 'calendar', icon: 'Calendar', label: 'Календарь' },
  { id: 'goals', icon: 'Target', label: 'Цели' },
  { id: 'values', icon: 'HeartHandshake', label: 'Ценности' },
  { id: 'traditions', icon: 'Sparkles', label: 'Традиции' },
  { id: 'shopping', icon: 'ShoppingCart', label: 'Покупки' },
  { id: 'meals', icon: 'UtensilsCrossed', label: 'Меню' },
];

export const availableTopPanelSections = [
  { id: 'stats', icon: 'Users', label: 'Счётчик семей' },
  { id: 'voting', icon: 'Vote', label: 'Голосования' },
  { id: 'auth', icon: 'LogIn', label: 'Вход/Выход' },
  { id: 'reset', icon: 'RotateCcw', label: 'Сбросить демо' },
  { id: 'settings', icon: 'Settings', label: 'Настройки' },
  { id: 'instructions', icon: 'BookOpen', label: 'Инструкции' },
  { id: 'presentation', icon: 'FileText', label: 'Презентация' },
  { id: 'profile', icon: 'UserCircle', label: 'Профиль' },
  { id: 'familySwitcher', icon: 'Users', label: 'Переключатель семьи' },
  { id: 'language', icon: 'Languages', label: 'Язык' },
  { id: 'style', icon: 'Palette', label: 'Стиль' },
  { id: 'appearance', icon: 'Moon', label: 'Оформление' },
];

export const inDevelopmentSections = [
  {
    id: 'blog',
    icon: 'BookOpen',
    label: 'Блог',
    description: 'Семейный блог для публикации историй, рецептов и важных событий',
    features: [
      { icon: '\u270D\uFE0F', title: 'Публикации', description: 'Делитесь историями, рецептами, фотографиями' },
      { icon: '\u{1F4AC}', title: 'Комментарии', description: 'Обсуждение публикаций всей семьёй' },
      { icon: '\u2764\uFE0F', title: 'Реакции', description: 'Лайки и реакции на посты' },
      { icon: '\u{1F3F7}\uFE0F', title: 'Категории', description: 'Сортировка по темам: путешествия, кулинария, дети' },
      { icon: '\u{1F516}', title: 'Избранное', description: 'Сохраняйте важные публикации' },
      { icon: '\u{1F4C5}', title: 'Архив', description: 'История всех публикаций по годам' },
    ]
  },
  {
    id: 'tree',
    icon: 'GitBranch',
    label: 'Древо',
    description: 'Генеалогическое древо семьи с историей поколений',
    features: [
      { icon: '\u{1F333}', title: 'Визуализация древа', description: 'Красивое графическое отображение родословной' },
      { icon: '\u{1F464}', title: 'Профили предков', description: 'Детальная информация о каждом члене рода' },
      { icon: '\u{1F4F8}', title: 'Фото и документы', description: 'Прикрепляйте фотографии и архивные документы' },
      { icon: '\u{1F4D6}', title: 'Истории жизни', description: 'Биографии и истории родственников' },
      { icon: '\u{1F50D}', title: 'Поиск родственников', description: 'Найдите связи между членами семьи' },
      { icon: '\u{1F4E4}', title: 'Экспорт GEDCOM', description: 'Совместимость с другими программами' },
    ]
  },
  {
    id: 'cohesion',
    icon: 'TrendingUp',
    label: 'Сплочённость',
    description: 'Отслеживание уровня сплочённости семьи через совместные активности, задачи и время вместе',
    features: [
      { icon: '\u{1F4CA}', title: 'Индекс сплочённости', description: 'Автоматический расчёт уровня сплочённости на основе активностей семьи' },
      { icon: '\u{1F3AF}', title: 'Совместные цели', description: 'Задачи которые выполняются всей семьёй вместе' },
      { icon: '\u23F1\uFE0F', title: 'Время вместе', description: 'Учёт совместно проведённого времени, рекомендации' },
      { icon: '\u{1F4C8}', title: 'Динамика отношений', description: 'Графики изменения сплочённости по месяцам' },
      { icon: '\u{1F3C6}', title: 'Семейные челленджи', description: 'Задания для укрепления связей: игры, квесты' },
      { icon: '\u{1F4AC}', title: 'Обратная связь', description: 'Опросы о качестве отношений в семье' },
    ]
  },
  {
    id: 'chat',
    icon: 'MessageCircle',
    label: 'Чат',
    description: 'Внутренний семейный мессенджер для быстрого общения и обмена важной информацией',
    features: [
      { icon: '\u{1F4AC}', title: 'Личные и групповые чаты', description: 'Общение один на один или со всей семьёй' },
      { icon: '\u{1F4F8}', title: 'Фото и видео', description: 'Быстрый обмен медиафайлами внутри семьи' },
      { icon: '\u{1F514}', title: 'Push-уведомления', description: 'Мгновенные оповещения о новых сообщениях' },
      { icon: '\u{1F4CD}', title: 'Геолокация', description: 'Делитесь местоположением с семьёй' },
      { icon: '\u{1F4CE}', title: 'Файлы и документы', description: 'Обмен любыми файлами: документы, чеки, билеты' },
      { icon: '\u23F0', title: 'Отложенные сообщения', description: 'Запланируйте отправку на нужное время' },
    ]
  },
  {
    id: 'community',
    icon: 'Users2',
    label: 'Сообщество',
    description: 'Общение с другими семьями, обмен опытом и советами',
    features: [
      { icon: '\u{1F465}', title: 'Форумы по интересам', description: 'Обсуждения воспитания, путешествий, хобби' },
      { icon: '\u{1F4DD}', title: 'Статьи и советы', description: 'Полезные материалы от экспертов и родителей' },
      { icon: '\u{1F389}', title: 'Семейные мероприятия', description: 'Совместные выезды, праздники, встречи' },
      { icon: '\u2B50', title: 'Рейтинг семей', description: 'Система достижений и мотивации' },
      { icon: '\u{1F91D}', title: 'Взаимопомощь', description: 'Попросить или предложить помощь соседям' },
      { icon: '\u{1F5FA}\uFE0F', title: 'Карта сообщества', description: 'Найдите семьи рядом с вами' },
    ]
  },
  {
    id: 'album',
    icon: 'Image',
    label: 'Альбом',
    description: 'Семейный фотоальбом для хранения важных воспоминаний',
    features: [
      { icon: '\u{1F4F8}', title: 'Неограниченное хранение', description: 'Загружайте сколько угодно фото и видео' },
      { icon: '\u{1F4C1}', title: 'Альбомы по событиям', description: 'Организация по датам: отпуск, день рождения, школа' },
      { icon: '\u{1F3F7}\uFE0F', title: 'Теги и метки', description: 'Пометьте кто на фото, где и когда снято' },
      { icon: '\u{1F916}', title: 'Умная сортировка', description: 'Автоматическая группировка по лицам и датам' },
      { icon: '\u{1F3AC}', title: 'Слайдшоу и коллажи', description: 'Создание красивых подборок из фото' },
      { icon: '\u{1F512}', title: 'Приватность', description: 'Доступ только членам вашей семьи' },
    ]
  },
  {
    id: 'complaints',
    icon: 'MessageSquareWarning',
    label: 'Жалобная книга',
    description: 'Анонимный способ высказать недовольство и решить конфликты',
    features: [
      { icon: '\u{1F512}', title: 'Анонимность', description: 'Жалобы могут быть анонимными для честности' },
      { icon: '\u{1F4DD}', title: 'Структурированные жалобы', description: 'Опишите проблему, предложите решение' },
      { icon: '\u{1F465}', title: 'Семейное обсуждение', description: 'Обсудите проблему вместе без конфликтов' },
      { icon: '\u2705', title: 'Отслеживание решений', description: 'Контроль что жалобы не игнорируются' },
      { icon: '\u{1F4CA}', title: 'Статистика проблем', description: 'Какие вопросы возникают чаще всего' },
      { icon: '\u{1F4A1}', title: 'Предложения улучшений', description: 'Не только жалобы, но и идеи' },
    ]
  },
  {
    id: 'psychologist',
    icon: 'Brain',
    label: 'Психолог ИИ',
    description: 'Искусственный интеллект для консультаций и эмоциональной поддержки',
    features: [
      { icon: '\u{1F916}', title: 'ИИ-консультант 24/7', description: 'Помощь в любое время дня и ночи' },
      { icon: '\u{1F4AC}', title: 'Конфиденциальные беседы', description: 'Поговорите о проблемах анонимно' },
      { icon: '\u{1F9E0}', title: 'Анализ эмоций', description: 'ИИ распознаёт эмоциональное состояние' },
      { icon: '\u{1F4DA}', title: 'База знаний', description: 'Советы по воспитанию, отношениям, стрессу' },
      { icon: '\u{1F3AF}', title: 'Персональные рекомендации', description: 'Советы основанные на вашей ситуации' },
      { icon: '\u{1F4C8}', title: 'Трекинг настроения', description: 'Отслеживание эмоционального состояния семьи' },
    ]
  },
  {
    id: 'garage',
    icon: 'Car',
    label: 'Гараж',
    description: 'Управление автомобилями семьи',
    features: [
      { icon: '\u{1F697}', title: 'Учёт автомобилей', description: 'Все авто семьи: марка, модель, год, VIN' },
      { icon: '\u{1F527}', title: 'График ТО', description: 'Напоминания о техобслуживании' },
      { icon: '\u{1F6DE}', title: 'Замена шин', description: 'Сезонная смена резины' },
      { icon: '\u26FD', title: 'Расход топлива', description: 'Журнал заправок и статистика' },
      { icon: '\u{1F4CB}', title: 'История обслуживания', description: 'Все ремонты и замены запчастей' },
      { icon: '\u{1F4B0}', title: 'Расходы на авто', description: 'Бензин, ремонт, страховка, штрафы' },
    ]
  },
  {
    id: 'health',
    icon: 'HeartPulse',
    label: 'Здоровье',
    description: 'Медицинские карты и здоровье семьи',
    features: [
      { icon: '\u{1F4CB}', title: 'Медицинские карты', description: 'История болезней, анализы, операции' },
      { icon: '\u{1F489}', title: 'График прививок', description: 'Календарь вакцинации с напоминаниями' },
      { icon: '\u{1F468}\u200D\u2695\uFE0F', title: 'База врачей', description: 'Контакты семейных врачей' },
      { icon: '\u{1F48A}', title: 'Аптечка', description: 'Лекарства дома, сроки годности' },
      { icon: '\u{1F4CA}', title: 'Показатели здоровья', description: 'Вес, рост, давление, сахар' },
      { icon: '\u{1F514}', title: 'Напоминания', description: 'О приёме лекарств и визитах' },
    ]
  },
  {
    id: 'finance',
    icon: 'Wallet',
    label: 'Финансы',
    description: 'Семейный бюджет и финансовое планирование',
    features: [
      { icon: '\u{1F4B0}', title: 'Семейный бюджет', description: 'Учёт доходов и расходов' },
      { icon: '\u{1F4CA}', title: 'Категории расходов', description: 'Продукты, жильё, транспорт, развлечения' },
      { icon: '\u{1F3E6}', title: 'Счета и карты', description: 'Все банковские счета в одном месте' },
      { icon: '\u{1F3AF}', title: 'Финансовые цели', description: 'Квартира, машина, отпуск' },
      { icon: '\u{1F4B3}', title: 'Кредиты и займы', description: 'График платежей, расчёт переплат' },
      { icon: '\u{1F4C8}', title: 'Накопления', description: 'Подушка безопасности, инвестиции' },
    ]
  },
  {
    id: 'education',
    icon: 'GraduationCap',
    label: 'Образование',
    description: 'Школа, кружки и развитие детей',
    features: [
      { icon: '\u{1F393}', title: 'Школьное расписание', description: 'Уроки по дням недели' },
      { icon: '\u{1F4DA}', title: 'Домашние задания', description: 'Контроль ДЗ с напоминаниями' },
      { icon: '\u{1F4CA}', title: 'Успеваемость', description: 'Электронный дневник с оценками' },
      { icon: '\u{1F3A8}', title: 'Кружки и секции', description: 'Расписание допзанятий' },
      { icon: '\u{1F3C6}', title: 'Достижения детей', description: 'Грамоты, дипломы, победы' },
      { icon: '\u{1F4B0}', title: 'Расходы на образование', description: 'Учебники, форма, кружки' },
    ]
  },
  {
    id: 'pets',
    icon: 'PawPrint',
    label: 'Питомцы',
    description: 'Уход за домашними животными',
    features: [
      { icon: '\u{1F43E}', title: 'Профили питомцев', description: 'Кличка, порода, возраст, фото' },
      { icon: '\u{1F489}', title: 'Вакцинация', description: 'График прививок с напоминаниями' },
      { icon: '\u{1F468}\u200D\u2695\uFE0F', title: 'Визиты к ветеринару', description: 'История осмотров' },
      { icon: '\u{1F356}', title: 'Питание', description: 'Рацион, любимый корм' },
      { icon: '\u{1F4B0}', title: 'Расходы', description: 'Корм, ветеринар, игрушки' },
      { icon: '\u{1F4F8}', title: 'Фотоальбом', description: 'Милые фото питомцев' },
    ]
  },
];

export const moodOptions = [
  { emoji: '\u{1F60A}', label: 'Отлично' },
  { emoji: '\u{1F603}', label: 'Хорошо' },
  { emoji: '\u{1F610}', label: 'Нормально' },
  { emoji: '\u{1F614}', label: 'Грустно' },
  { emoji: '\u{1F62B}', label: 'Устал' },
  { emoji: '\u{1F624}', label: 'Раздражён' },
  { emoji: '\u{1F912}', label: 'Болею' },
  { emoji: '\u{1F973}', label: 'Празднично' },
];

export default availableSections;
