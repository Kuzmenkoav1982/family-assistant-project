import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface ScamScheme {
  id: string;
  title: string;
  category: string;
  danger: 'high' | 'medium' | 'low';
  icon: string;
  summary: string;
  signs: string[];
  howToProtect: string[];
  example: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Все', icon: 'Shield' },
  { id: 'phone', label: 'Звонки', icon: 'Phone' },
  { id: 'sms', label: 'SMS/Мессенджеры', icon: 'MessageSquare' },
  { id: 'internet', label: 'Интернет', icon: 'Globe' },
  { id: 'card', label: 'Карты/Банки', icon: 'CreditCard' },
  { id: 'social', label: 'Соцсети', icon: 'Users' },
  { id: 'marketplace', label: 'Маркетплейсы', icon: 'ShoppingBag' },
];

const DANGER_MAP = {
  high: { label: 'Высокая опасность', color: 'bg-red-100 text-red-700 border-red-200' },
  medium: { label: 'Средняя опасность', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  low: { label: 'Низкая опасность', color: 'bg-green-100 text-green-700 border-green-200' },
};

const SCAM_SCHEMES: ScamScheme[] = [
  {
    id: '1',
    title: 'Звонок из «службы безопасности банка»',
    category: 'phone',
    danger: 'high',
    icon: 'PhoneCall',
    summary: 'Мошенники представляются сотрудниками банка и сообщают о «подозрительной операции». Просят назвать код из SMS или перевести деньги на «безопасный счёт».',
    signs: [
      'Звонят с неизвестного номера, представляются банком',
      'Торопят, создают панику: «деньги списываются прямо сейчас»',
      'Просят назвать код из SMS, CVV или пароль',
      'Предлагают перевести деньги на «безопасный счёт»',
      'Угрожают блокировкой карты',
    ],
    howToProtect: [
      'Положите трубку и перезвоните в банк по номеру с карты',
      'Никогда не называйте коды из SMS и CVV',
      'Банк никогда не просит переводить деньги',
      'Установите определитель номера (Яндекс, Касперский)',
    ],
    example: '«Здравствуйте, это служба безопасности Сбербанка. С вашего счёта пытаются списать 45 000 рублей. Для отмены операции назовите код из SMS...»',
  },
  {
    id: '2',
    title: 'Звонок от «следователя» или «ФСБ»',
    category: 'phone',
    danger: 'high',
    icon: 'ShieldAlert',
    summary: 'Звонят якобы из полиции/ФСБ/прокуратуры. Говорят что на вас оформляют кредит или вы проходите по уголовному делу.',
    signs: [
      'Представляются полицией, ФСБ, прокуратурой',
      'Говорят про уголовное дело или мошеннический кредит',
      'Запрещают кому-либо рассказывать (подписка о неразглашении)',
      'Просят перевести деньги для «защиты» или «проверки»',
      'Могут прислать фото «удостоверения» в мессенджер',
    ],
    howToProtect: [
      'Настоящие следователи вызывают повесткой, а не звонят',
      'Никакой «подписки о неразглашении» по телефону не бывает',
      'Положите трубку и позвоните в полицию по 102',
      'Расскажите близким — мошенники боятся огласки',
    ],
    example: '«Капитан Петров, управление МВД. На ваше имя оформляют кредит. Вам нужно срочно перевести деньги на защищённый счёт, иначе вы станете соучастником...»',
  },
  {
    id: '3',
    title: 'SMS «Мама, я попал в беду»',
    category: 'sms',
    danger: 'high',
    icon: 'MessageCircleWarning',
    summary: 'Приходит SMS или сообщение в мессенджере от «родственника», который якобы попал в аварию или задержан полицией, и срочно нужны деньги.',
    signs: [
      'Пишут с незнакомого номера от имени родственника',
      'Срочность: «нужны деньги прямо сейчас»',
      'Просят не звонить, а просто перевести',
      'Сумма обычно 30 000–100 000 руб.',
    ],
    howToProtect: [
      'Позвоните родственнику на его номер',
      'Задайте вопрос, ответ на который знает только он',
      'Никогда не переводите деньги по SMS-просьбе',
      'Предупредите пожилых родственников об этой схеме',
    ],
    example: '«Мам, это я, попал в аварию. Телефон разбился, пишу с чужого. Срочно переведи 50 000 на карту 2200... Потом всё объясню, не звони мне!»',
  },
  {
    id: '4',
    title: 'Фишинговый сайт (поддельный банк/магазин)',
    category: 'internet',
    danger: 'high',
    icon: 'Globe',
    summary: 'Создают копию сайта банка, Госуслуг или популярного магазина. Вы вводите логин/пароль — и данные уходят мошенникам.',
    signs: [
      'Ссылка отличается от настоящей (sberbank-online.ru вместо sberbank.ru)',
      'Пришла по SMS/email с просьбой «подтвердить данные»',
      'Дизайн сайта похож, но есть мелкие отличия',
      'Просят ввести сразу все данные карты',
    ],
    howToProtect: [
      'Всегда проверяйте адрес сайта в браузере',
      'Заходите в банк через официальное приложение',
      'Не переходите по ссылкам из SMS и email',
      'Установите антивирус с защитой от фишинга',
    ],
    example: 'Приходит SMS: «Ваша карта заблокирована. Для разблокировки перейдите: sberbank-secure-online.ru». Сайт выглядит как настоящий Сбербанк, но это подделка.',
  },
  {
    id: '5',
    title: 'Предоплата за товар на Авито/Юле',
    category: 'marketplace',
    danger: 'medium',
    icon: 'ShoppingBag',
    summary: 'Продавец просит предоплату или «залог» за товар. После перевода исчезает. Или покупатель присылает фишинговую ссылку для «получения оплаты».',
    signs: [
      'Товар по подозрительно низкой цене',
      'Продавец просит предоплату на карту',
      'Отказывается от встречи или доставки через площадку',
      'Покупатель присылает ссылку «для получения денег»',
    ],
    howToProtect: [
      'Пользуйтесь встроенной «Безопасной сделкой»',
      'Не переводите предоплату на карту',
      'Не переходите по ссылкам из чата',
      'Встречайтесь в людном месте для передачи товара',
    ],
    example: '«Могу отправить завтра, но нужна предоплата 50%. Переведите на карту 4276... Я порядочный, у меня много отзывов (скриншот отзывов — поддельный).»',
  },
  {
    id: '6',
    title: 'Взлом аккаунта в соцсети',
    category: 'social',
    danger: 'medium',
    icon: 'UserX',
    summary: 'Мошенники взламывают аккаунт знакомого и пишут от его имени с просьбой одолжить денег или проголосовать по ссылке.',
    signs: [
      'Друг внезапно просит денег в долг',
      'Необычный стиль общения',
      'Просят перевести на карту незнакомого человека',
      'Присылают ссылку «проголосуй за меня»',
    ],
    howToProtect: [
      'Позвоните другу по телефону и спросите лично',
      'Не переходите по подозрительным ссылкам',
      'Включите двухфакторную аутентификацию на своих аккаунтах',
      'Не используйте один пароль для всех сервисов',
    ],
    example: '«Привет! Можешь одолжить 5000 до завтра? Карта заблокирована, переведи на карту жены: 2200...»',
  },
  {
    id: '7',
    title: 'Поддельный возврат налогов / выплата от государства',
    category: 'internet',
    danger: 'medium',
    icon: 'Landmark',
    summary: 'Сайт или рассылка обещает компенсацию, возврат налогов или социальную выплату. Для «получения» нужно ввести данные карты и оплатить «комиссию».',
    signs: [
      'Обещают крупную выплату от государства',
      'Для получения нужно оплатить «комиссию» или «госпошлину»',
      'Сайт похож на Госуслуги, но адрес другой',
      'Торопят: «выплата доступна ещё 24 часа»',
    ],
    howToProtect: [
      'Проверяйте информацию на официальных Госуслугах (gosuslugi.ru)',
      'Государство не просит комиссию для выплат',
      'Не вводите данные карты на незнакомых сайтах',
      'Позвоните в МФЦ для проверки',
    ],
    example: '«Вам начислена компенсация 28 340 руб. Для получения введите данные карты и оплатите госпошлину 299 руб.»',
  },
  {
    id: '8',
    title: 'Мошенничество с подменой номера карты',
    category: 'card',
    danger: 'high',
    icon: 'CreditCard',
    summary: 'При переводе через «безопасную сделку» мошенник подменяет реквизиты. Деньги уходят на чужой счёт.',
    signs: [
      'Предлагают перевести через «специальную систему»',
      'Присылают ссылку на оплату, похожую на банковскую',
      'Реквизиты для перевода приходят в чате, а не на сайте',
    ],
    howToProtect: [
      'Переводите только через официальное приложение банка',
      'Проверяйте реквизиты перед подтверждением',
      'Используйте оплату по QR-коду в магазинах',
    ],
    example: '«Оплатите через нашу безопасную систему: ссылка. Введите данные карты для перевода продавцу.» На самом деле деньги идут мошеннику.',
  },
  {
    id: '9',
    title: 'Инвестиции и «лёгкий заработок»',
    category: 'internet',
    danger: 'high',
    icon: 'TrendingUp',
    summary: 'Предлагают вложить деньги в «уникальный проект» с гарантированным доходом 300%+. Классическая финансовая пирамида.',
    signs: [
      'Обещают гарантированный высокий доход (более 30% годовых)',
      'Просят привлекать друзей для бонусов',
      'Нет лицензии ЦБ РФ',
      'Давят на срочность: «осталось 3 места»',
      'Показывают скриншоты «выплат» и «успешных инвесторов»',
    ],
    howToProtect: [
      'Проверьте компанию в реестре ЦБ РФ (cbr.ru)',
      'Гарантированный высокий доход — главный признак пирамиды',
      'Не вкладывайте деньги под давлением',
      'Посоветуйтесь с семьёй перед любыми инвестициями',
    ],
    example: '«Вложите 10 000 руб. и получайте 3 000 руб. ежедневно! Уже 50 000 людей зарабатывают с нами. Присоединяйтесь, осталось 5 мест!»',
  },
  {
    id: '10',
    title: 'Подмена QR-кода (терминалы, аренда самокатов)',
    category: 'card',
    danger: 'medium',
    icon: 'QrCode',
    summary: 'Мошенники наклеивают поддельный QR-код поверх настоящего на терминалах оплаты, самокатах, объявлениях.',
    signs: [
      'QR-код выглядит как наклейка поверх другого',
      'Ссылка ведёт на незнакомый сайт',
      'Сайт просит ввести данные карты полностью',
    ],
    howToProtect: [
      'Проверьте, не наклеен ли QR-код поверх оригинала',
      'Перед оплатой проверьте адрес сайта',
      'Используйте официальные приложения для аренды/оплаты',
    ],
    example: 'На электросамокате наклеен QR-код. Вы сканируете, открывается сайт, похожий на приложение. Вводите карту — деньги списываются мошенникам.',
  },
  {
    id: '11',
    title: 'Рассылка в мессенджерах «Проголосуй за ребёнка»',
    category: 'sms',
    danger: 'medium',
    icon: 'Heart',
    summary: 'В WhatsApp/Telegram приходит ссылка с просьбой проголосовать за ребёнка в конкурсе. Ссылка ведёт на фишинговый сайт, крадут аккаунт.',
    signs: [
      'Ссылка «проголосуй за моего ребёнка/племянника»',
      'Для голосования просят авторизоваться через Telegram/WhatsApp',
      'После «авторизации» теряете доступ к мессенджеру',
    ],
    howToProtect: [
      'Не переходите по таким ссылкам',
      'Не вводите код из SMS на незнакомых сайтах',
      'Включите двухфакторную аутентификацию в мессенджерах',
      'Предупредите знакомого, что его аккаунт взломан',
    ],
    example: '«Привет! Проголосуй, пожалуйста, за мою дочку в конкурсе рисунков: ссылка. Нужно просто авторизоваться через Telegram.»',
  },
  {
    id: '12',
    title: 'Мошенничество с «выигрышем» в лотерею',
    category: 'sms',
    danger: 'low',
    icon: 'Gift',
    summary: 'Сообщение о выигрыше приза, для получения которого нужно оплатить «доставку» или «налог».',
    signs: [
      'Вы не участвовали ни в какой лотерее',
      'Для получения приза нужна оплата',
      'Торопят: «приз ждёт вас только 24 часа»',
    ],
    howToProtect: [
      'Если не участвовали — значит не выиграли',
      'Никогда не платите за «получение приза»',
      'Проигнорируйте и заблокируйте отправителя',
    ],
    example: '«Поздравляем! Вы выиграли iPhone 16 Pro! Для доставки оплатите 990 руб. налога по ссылке...»',
  },
];

export default function AntiScam() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [openScheme, setOpenScheme] = useState<ScamScheme | null>(null);

  const filtered = SCAM_SCHEMES.filter(s => {
    const matchCategory = filter === 'all' || s.category === filter;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.summary.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const stats = {
    total: SCAM_SCHEMES.length,
    high: SCAM_SCHEMES.filter(s => s.danger === 'high').length,
    phone: SCAM_SCHEMES.filter(s => s.category === 'phone' || s.category === 'sms').length,
  };

  if (openScheme) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setOpenScheme(null)}>
              <Icon name="ArrowLeft" size={18} />
            </Button>
            <h1 className="text-lg font-bold flex-1">{openScheme.title}</h1>
          </div>

          <Badge className={DANGER_MAP[openScheme.danger].color}>
            {DANGER_MAP[openScheme.danger].label}
          </Badge>

          <Card>
            <CardContent className="p-4">
              <p className="text-sm leading-relaxed">{openScheme.summary}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="AlertTriangle" size={18} className="text-red-600" />
                <h3 className="font-semibold text-red-800">Признаки мошенничества</h3>
              </div>
              <ul className="space-y-2">
                {openScheme.signs.map((sign, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Icon name="X" size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="ShieldCheck" size={18} className="text-green-600" />
                <h3 className="font-semibold text-green-800">Как защититься</h3>
              </div>
              <ul className="space-y-2">
                {openScheme.howToProtect.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Icon name="Check" size={14} className="text-green-600 mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Quote" size={18} className="text-amber-600" />
                <h3 className="font-semibold text-amber-800">Пример сообщения мошенника</h3>
              </div>
              <p className="text-sm italic leading-relaxed bg-white/60 rounded-lg p-3 border border-amber-200">
                {openScheme.example}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpenScheme(null)}>
              <Icon name="ArrowLeft" size={16} className="mr-2" /> Назад
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/finance')}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Антимошенник</h1>
            <p className="text-xs text-muted-foreground">Защита семьи от мошенников</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Схем в базе</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.high}</p>
              <p className="text-xs text-muted-foreground">Очень опасных</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.phone}</p>
              <p className="text-xs text-muted-foreground">По телефону</p>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск схемы..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <Button
              key={cat.id}
              variant={filter === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat.id)}
              className="shrink-0 text-xs"
            >
              <Icon name={cat.icon} size={14} className="mr-1" />
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(scheme => (
            <Card
              key={scheme.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setOpenScheme(scheme)}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    scheme.danger === 'high' ? 'bg-red-100' :
                    scheme.danger === 'medium' ? 'bg-amber-100' : 'bg-green-100'
                  }`}>
                    <Icon name={scheme.icon} size={20} className={
                      scheme.danger === 'high' ? 'text-red-600' :
                      scheme.danger === 'medium' ? 'text-amber-600' : 'text-green-600'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{scheme.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{scheme.summary}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-[10px] ${DANGER_MAP[scheme.danger].color}`}>
                        {DANGER_MAP[scheme.danger].label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {CATEGORIES.find(c => c.id === scheme.category)?.label}
                      </Badge>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground shrink-0 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Icon name="SearchX" size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Ничего не найдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
