import type { LifeEvent } from '@/components/life-road/types';

// Фото через wsrv.nl прокси — работает без ограничений hotlink во всех браузерах
const u = (id: string) => `https://wsrv.nl/?url=images.unsplash.com/photo-${id}&w=800&output=jpg&q=80`;
const PHOTOS = {
  birth:        u('1519689373023-dd07c7988603'),
  childhood:    u('1503454537195-1dcabb73ffb9'),
  school:       u('1580582932707-520aed937b7b'),
  university:   u('1523050854058-8df90110c9f1'),
  wedding:      u('1519741497674-611481863552'),
  wedding2:     u('1465495976277-4387d4b0b4c6'),
  baby:         u('1491013516836-7db643ee125a'),
  baby2:        u('1555252333-9f8e92e65df9'),
  career:       u('1454165804606-c3d57bc86b40'),
  apartment:    u('1560448204-e02f11c3d0e2'),
  travel_paris: u('1511739001486-6bfe10ce785f'),
  travel_rome:  u('1552832230-c0197dd311b5'),
  family_dinner:u('1529543544282-ea669407fca3'),
  dacha:        u('1416879595882-3373a0480b5b'),
  sport:        u('1571019613454-1cb2f99b2d8b'),
  future_house: u('1558618666-fcd25c85cd64'),
};

export const demoLifeEvents: LifeEvent[] = [
  {
    id: 'demo-ev-1',
    date: '1987-03-15',
    title: 'Рождение Алексея',
    description: 'Родился ранней весной в роддоме №7. Мама говорит, что за окном ещё лежал снег, а папа нервно ходил по коридору с букетом тюльпанов.',
    category: 'birth',
    importance: 'critical',
    participants: ['demo_1'],
    photos: [PHOTOS.birth],
    quote: 'Жизнь — это то, что случается с тобой, пока ты строишь другие планы.',
  },
  {
    id: 'demo-ev-2',
    date: '1994-09-01',
    title: 'Первый день в школе',
    description: 'Школа №47. Белая рубашка, огромный букет астр и полный портфель на весь класс. Учительница Надежда Ивановна.',
    category: 'education',
    importance: 'high',
    participants: ['demo_1'],
    photos: [PHOTOS.school],
  },
  {
    id: 'demo-ev-3',
    date: '2004-06-25',
    title: 'Окончание университета',
    description: 'Диплом по специальности «Менеджмент». Пять лет — и вот долгожданный красный диплом. Праздновали всей семьёй на даче.',
    category: 'education',
    importance: 'high',
    participants: ['demo_1'],
    photos: [PHOTOS.university],
    quote: 'Образование — это то, что остаётся после того, как забывается всё выученное.',
  },
  {
    id: 'demo-ev-4',
    date: '2006-04-10',
    title: 'Первая работа в компании',
    description: 'Устроился менеджером по продажам в крупную IT-компанию. Первая зарплата — 23 000 рублей, казалась огромной.',
    category: 'career',
    importance: 'medium',
    participants: ['demo_1'],
    photos: [PHOTOS.career],
  },
  {
    id: 'demo-ev-5',
    date: '2009-08-22',
    title: 'Свадьба с Анастасией',
    description: 'Венчались в церкви Святой Троицы. 78 гостей, живая музыка, белые пионы. Танцевали до 4 утра. Медовый месяц провели в Праге.',
    category: 'wedding',
    importance: 'critical',
    participants: ['demo_1', 'demo_2'],
    photos: [PHOTOS.wedding, PHOTOS.wedding2],
    quote: 'Самое важное решение в жизни — с кем разделить её.',
  },
  {
    id: 'demo-ev-6',
    date: '2010-11-05',
    title: 'Покупка первой квартиры',
    description: 'Двушка на Ленинском проспекте. Ипотека на 15 лет, но своё. Делали ремонт сами по выходным — 8 месяцев.',
    category: 'achievement',
    importance: 'high',
    participants: ['demo_1', 'demo_2'],
    photos: [PHOTOS.apartment],
  },
  {
    id: 'demo-ev-7',
    date: '2013-07-12',
    title: 'Рождение Матвея',
    description: 'Долгожданный первенец. 3.8 кг, 54 см. Анастасия была невероятно храброй. Назвали в честь деда по маминой линии.',
    category: 'family',
    importance: 'critical',
    participants: ['demo_1', 'demo_2', 'demo_3'],
    photos: [PHOTOS.baby],
    quote: 'Стать родителем — значит навсегда отдать своё сердце.',
  },
  {
    id: 'demo-ev-8',
    date: '2015-05-01',
    title: 'Путешествие в Париж',
    description: 'Первая большая семейная поездка за границу. Эйфелева башня, Лувр, круиз по Сене. Матвею было 2 года — ничего не запомнил, но фото остались.',
    category: 'travel',
    importance: 'medium',
    participants: ['demo_1', 'demo_2', 'demo_3'],
    photos: [PHOTOS.travel_paris],
  },
  {
    id: 'demo-ev-9',
    date: '2017-02-14',
    title: 'Рождение Даши',
    description: 'Доченька родилась в День святого Валентина — настоящий подарок судьбы. Матвей сразу стал «старшим братом» и очень гордится этим.',
    category: 'family',
    importance: 'critical',
    participants: ['demo_1', 'demo_2', 'demo_4'],
    photos: [PHOTOS.baby2],
    quote: 'Дети — якорь, удерживающий мать в жизни.',
  },
  {
    id: 'demo-ev-10',
    date: '2019-09-15',
    title: 'Повышение до директора',
    description: 'После 13 лет в компании — назначен коммерческим директором. Команда из 40 человек, ответственность выросла, но и возможности тоже.',
    category: 'career',
    importance: 'high',
    participants: ['demo_1'],
    photos: [PHOTOS.career],
  },
  {
    id: 'demo-ev-11',
    date: '2021-07-20',
    title: 'Поездка в Рим всей семьёй',
    description: 'Рим, Флоренция, Венеция — три недели по Италии. Дети влюбились в пиццу и мороженое. Матвей сфотографировал каждый фонтан в городе.',
    category: 'travel',
    importance: 'medium',
    participants: ['demo_1', 'demo_2', 'demo_3', 'demo_4'],
    photos: [PHOTOS.travel_rome],
  },
  {
    id: 'demo-ev-12',
    date: '2023-06-05',
    title: '30-летие Анастасии',
    description: 'Большой праздник на даче — 50 гостей, живая группа, фейерверк. Дети подготовили концерт. Анастасия плакала от счастья.',
    category: 'family',
    importance: 'high',
    participants: ['demo_1', 'demo_2', 'demo_3', 'demo_4'],
    photos: [PHOTOS.family_dinner],
  },
  {
    id: 'demo-ev-13',
    date: '2027-01-01',
    title: 'Цель: дом за городом',
    description: 'Мечтаем о своём доме в Подмосковье. 150 кв.м., большой сад, баня. Откладываем уже 3 года — скоро сможем начать стройку.',
    category: 'achievement',
    importance: 'high',
    participants: ['demo_1', 'demo_2'],
    photos: [PHOTOS.future_house],
    isFuture: true,
    quote: 'Дом — это не место. Это чувство.',
  },
];

// Демо-данные для семейного дерева
export interface DemoTreeMember {
  id: number;
  family_id: number;
  name: string;
  relation: string;
  birth_year: number | null;
  death_year: number | null;
  bio: string | null;
  photo_url: string | null;
  parent_id: number | null;
  parent2_id: number | null;
  spouse_id: number | null;
  gender: string;
  birth_date: string | null;
  death_date: string | null;
  occupation: string | null;
  avatar: string;
  photos: Array<{id: number; photo_url: string; caption: string | null; sort_order: number; created_at: string}>;
  created_at: string;
  updated_at: string;
}

export const demoFamilyTreeMembers: DemoTreeMember[] = [
  // Прародители
  {
    id: 101, family_id: 1, name: 'Иван Петрович Кузнецов', relation: 'Дедушка',
    birth_year: 1928, death_year: 2001, gender: 'male',
    bio: 'Ветеран Великой Отечественной войны. Работал инженером на заводе «Серп и Молот» 40 лет. Любил рыбалку и шахматы.',
    photo_url: 'https://wsrv.nl/?url=images.unsplash.com/photo-1556157382-97eda2f9e2bf&w=400&output=jpg&q=80',
    parent_id: null, parent2_id: null, spouse_id: 102,
    birth_date: '1928-05-09', death_date: '2001-11-14', occupation: 'Инженер',
    avatar: '👴', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 102, family_id: 1, name: 'Мария Ивановна Кузнецова', relation: 'Бабушка',
    birth_year: 1932, death_year: 2018, gender: 'female',
    bio: 'Учитель начальных классов. 35 лет в школе. Её ученики до сих пор приходили на юбилей. Великолепно пекла пироги.',
    photo_url: 'https://wsrv.nl/?url=images.unsplash.com/photo-1566616213894-2d4e1baee5d8&w=400&output=jpg&q=80',
    parent_id: null, parent2_id: null, spouse_id: 101,
    birth_date: '1932-08-20', death_date: '2018-03-12', occupation: 'Учитель',
    avatar: '👵', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  // Родители
  {
    id: 103, family_id: 1, name: 'Сергей Иванович Кузнецов', relation: 'Папа',
    birth_year: 1958, death_year: null, gender: 'male',
    bio: 'Строитель, мастер на все руки. Построил дачу своими руками. Увлекается садоводством и рыбалкой как дед.',
    photo_url: 'https://wsrv.nl/?url=images.unsplash.com/photo-1472099645785-5658abf4ff4e&w=400&output=jpg&q=80',
    parent_id: 101, parent2_id: 102, spouse_id: 104,
    birth_date: '1958-04-22', death_date: null, occupation: 'Строитель',
    avatar: '👨', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 104, family_id: 1, name: 'Татьяна Николаевна Кузнецова', relation: 'Мама',
    birth_year: 1962, death_year: null, gender: 'female',
    bio: 'Врач-педиатр с 30-летним стажем. Посвятила себя детям — и своим, и чужим. Любит цветы и читает детективы.',
    photo_url: 'https://wsrv.nl/?url=images.unsplash.com/photo-1438761681033-6461ffad8d80&w=400&output=jpg&q=80',
    parent_id: null, parent2_id: null, spouse_id: 103,
    birth_date: '1962-11-07', death_date: null, occupation: 'Врач-педиатр',
    avatar: '👩', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  // Текущее поколение
  {
    id: 105, family_id: 1, name: 'Алексей Сергеевич Кузнецов', relation: 'Я',
    birth_year: 1987, death_year: null, gender: 'male',
    bio: 'Коммерческий директор. Люблю путешествия, спорт и семейные вечера с настольными играми. Отец Матвея и Даши.',
    photo_url: 'https://cdn.poehali.dev/files/fb82400e-4e48-4d25-9de7-a9991f13aa29.png',
    parent_id: 103, parent2_id: 104, spouse_id: 106,
    birth_date: '1987-03-15', death_date: null, occupation: 'Коммерческий директор',
    avatar: '👨‍💼', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 106, family_id: 1, name: 'Анастасия Владимировна Кузнецова', relation: 'Жена',
    birth_year: 1990, death_year: null, gender: 'female',
    bio: 'Дизайнер интерьеров. Превратила нашу квартиру в уютный дом. Любит йогу, готовку и фотографию.',
    photo_url: 'https://cdn.poehali.dev/files/3a7d0304-7fd5-4cd7-ac79-f4c235eb7484.png',
    parent_id: null, parent2_id: null, spouse_id: 105,
    birth_date: '1990-02-14', death_date: null, occupation: 'Дизайнер',
    avatar: '👩‍🎨', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  // Дети
  {
    id: 107, family_id: 1, name: 'Матвей Алексеевич Кузнецов', relation: 'Сын',
    birth_year: 2013, death_year: null, gender: 'male',
    bio: 'Увлекается футболом и программированием. Хочет стать разработчиком игр. Лучший друг папы.',
    photo_url: 'https://cdn.poehali.dev/files/2c506753-6a4d-447e-a8b2-294bceb38a95.png',
    parent_id: 105, parent2_id: 106, spouse_id: null,
    birth_date: '2013-07-12', death_date: null, occupation: 'Школьник',
    avatar: '👦', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 108, family_id: 1, name: 'Даша Алексеевна Кузнецова', relation: 'Дочь',
    birth_year: 2017, death_year: null, gender: 'female',
    bio: 'Любит рисовать и танцевать. Ходит в художественную школу и на бальные танцы. Папина любимица.',
    photo_url: 'https://cdn.poehali.dev/files/fcce342c-9b14-420d-b3eb-97084a3bbe08.png',
    parent_id: 105, parent2_id: 106, spouse_id: null,
    birth_date: '2017-02-14', death_date: null, occupation: 'Школьник',
    avatar: '👧', photos: [], created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
];

// Демо-данные для Альбома поколений
export const demoMemoryEntries = [
  {
    id: 'demo-mem-1',
    title: 'Свадьба Алексея и Анастасии',
    caption: 'Один из самых счастливых дней в нашей жизни',
    story: 'Венчались в церкви Святой Троицы. 78 гостей, живая музыка, белые пионы. Танцевали до рассвета. Это был самый длинный и самый короткий день в жизни — одновременно.',
    memory_date: '2009-08-22',
    memory_period_label: 'Август 2009',
    location_label: 'Москва',
    event_id: null,
    cover_asset_id: 'demo-asset-1',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    assets: [
      { id: 'demo-asset-1', file_url: PHOTOS.wedding, sort_order: 0, width: 800, height: 600, mime_type: 'image/jpeg' },
      { id: 'demo-asset-2', file_url: PHOTOS.wedding2, sort_order: 1, width: 800, height: 600, mime_type: 'image/jpeg' },
    ],
    member_ids: [1, 2],
    album_ids: ['demo-album-1'],
  },
  {
    id: 'demo-mem-2',
    title: 'Рождение Матвея',
    caption: 'Долгожданный первенец — 3.8 кг, 54 см',
    story: 'Мы ждали этого момента так долго. Анастасия была невероятно храброй. Когда впервые взял его на руки — понял, что жизнь делится на "до" и "после".',
    memory_date: '2013-07-12',
    memory_period_label: 'Июль 2013',
    location_label: 'Москва, Роддом №3',
    event_id: null,
    cover_asset_id: 'demo-asset-3',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    assets: [
      { id: 'demo-asset-3', file_url: PHOTOS.baby, sort_order: 0, width: 800, height: 600, mime_type: 'image/jpeg' },
    ],
    member_ids: [1, 2, 3],
    album_ids: ['demo-album-1', 'demo-album-2'],
  },
  {
    id: 'demo-mem-3',
    title: 'Италия всей семьёй',
    caption: 'Три недели, три города, бесчисленные воспоминания',
    story: 'Рим, Флоренция, Венеция. Матвей сфотографировал каждый фонтан. Даша научилась говорить "gelato" раньше, чем "buongiorno". Лучший отпуск в нашей жизни.',
    memory_date: '2021-07-20',
    memory_period_label: 'Лето 2021',
    location_label: 'Италия',
    event_id: null,
    cover_asset_id: 'demo-asset-5',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    assets: [
      { id: 'demo-asset-5', file_url: PHOTOS.travel_rome, sort_order: 0, width: 800, height: 600, mime_type: 'image/jpeg' },
      { id: 'demo-asset-6', file_url: PHOTOS.travel_paris, sort_order: 1, width: 800, height: 600, mime_type: 'image/jpeg' },
    ],
    member_ids: [1, 2, 3, 4],
    album_ids: ['demo-album-3'],
  },
  {
    id: 'demo-mem-4',
    title: 'Дедушка Иван — ветеран',
    caption: 'Помним и гордимся',
    story: 'Дедушка Иван прошёл всю войну. Никогда особо не рассказывал — говорил, незачем вспоминать плохое. Но на параде Победы всегда плакал. Мы помним.',
    memory_date: '1945-05-09',
    memory_period_label: '9 мая 1945',
    location_label: null,
    event_id: null,
    cover_asset_id: 'demo-asset-7',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    assets: [
      { id: 'demo-asset-7', file_url: 'https://wsrv.nl/?url=images.unsplash.com/photo-1561488111-5d800fd56b8a&w=800&output=jpg&q=80', sort_order: 0, width: 800, height: 600, mime_type: 'image/jpeg' },
    ],
    member_ids: [],
    album_ids: ['demo-album-2'],
  },
  {
    id: 'demo-mem-5',
    title: 'День рождения Анастасии — 30 лет',
    caption: 'Юбилей на даче с самыми близкими',
    story: 'Праздновали на даче. Живая группа, фейерверк, 50 гостей. Дети подготовили концерт — Матвей читал стихи, Даша танцевала. Настя плакала от счастья.',
    memory_date: '2023-06-05',
    memory_period_label: 'Июнь 2023',
    location_label: 'Дача, Подмосковье',
    event_id: null,
    cover_asset_id: 'demo-asset-8',
    status: 'published',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    assets: [
      { id: 'demo-asset-8', file_url: PHOTOS.family_dinner, sort_order: 0, width: 800, height: 600, mime_type: 'image/jpeg' },
      { id: 'demo-asset-9', file_url: PHOTOS.dacha, sort_order: 1, width: 800, height: 600, mime_type: 'image/jpeg' },
    ],
    member_ids: [1, 2, 3, 4],
    album_ids: ['demo-album-1'],
  },
];

export const demoMemoryAlbums = [
  {
    id: 'demo-album-1', title: 'Наша семья', description: 'Самые важные моменты',
    cover_asset: { id: 'demo-asset-1', file_url: PHOTOS.wedding, width: 800, height: 600, source: 'manual' as const },
    entry_count: 3, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-album-2', title: 'Предки', description: 'История рода',
    cover_asset: { id: 'demo-asset-7', file_url: 'https://wsrv.nl/?url=images.unsplash.com/photo-1561488111-5d800fd56b8a&w=800&output=jpg&q=80', width: 800, height: 600, source: 'manual' as const },
    entry_count: 2, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'demo-album-3', title: 'Путешествия', description: 'Наши поездки по миру',
    cover_asset: { id: 'demo-asset-5', file_url: PHOTOS.travel_rome, width: 800, height: 600, source: 'manual' as const },
    entry_count: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
];