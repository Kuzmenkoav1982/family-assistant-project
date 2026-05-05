import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import WebhookConnector from '@/components/admin/max/WebhookConnector';

const SITEMAP_URL = 'https://nasha-semiya.ru/sitemap-blog.xml';

export default function AdminMaxInstructions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 pb-12">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              📖 Инструкция: МАХ-канал и Блог
            </h1>
            <p className="text-gray-600 mt-1">
              Как работает связка «МАХ → Сайт → SEO → Регистрации»
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate('/admin/max')}>
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад в МАХ-канал
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="text-3xl">🎯</div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  Главная цель системы
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  МАХ-каналы <strong>не индексируются</strong> Google и Яндексом. Все ваши посты живут 24 часа и теряются.
                  Решение — каждый пост из МАХ автоматически зеркалится на <strong>nasha-semiya.ru/blog</strong>,
                  где его находят люди через поисковики и регистрируются на платформе.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold">1</span>
              Архитектура — как всё связано
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="font-mono text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto leading-relaxed">
{`┌─────────────────────┐     ┌───────────────────────┐
│  МАХ-канал          │     │  Админ-панель сайта   │
│  «Наша Семья»       │     │  /admin/max           │
│  1632 подписчика    │     │  (вы пишете пост)     │
└──────────┬──────────┘     └──────────┬────────────┘
           │ webhook                    │ API call
           │ message_created            │ ?action=send
           ▼                            ▼
        ┌──────────────────────────────────┐
        │  Backend max-bot                  │
        │  (зеркалит и публикует)           │
        │  • парсит заголовок, теги         │
        │  • определяет категорию           │
        │  • извлекает картинки             │
        │  • сохраняет в БД                 │
        └──────────┬────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────┐
        │  PostgreSQL                       │
        │  public_blog_posts (38 шт)        │
        │  + categories + tags + views      │
        └──────────┬────────────────────────┘
                   │
        ┌──────────┴───────────┬─────────────────┐
        ▼                      ▼                 ▼
┌────────────────┐  ┌─────────────────┐  ┌──────────────┐
│ /blog          │  │ sitemap.xml     │  │ Яндекс       │
│ (читатели)     │  │ (для роботов)   │  │ Google       │
└────────────────┘  └─────────────────┘  └──────────────┘`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold">2</span>
              Два способа публикации поста
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="border border-green-200 bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600 text-white">Сценарий A</Badge>
                <h4 className="font-bold text-gray-900">Публикация через админку сайта</h4>
                <Badge variant="outline" className="ml-auto text-green-700">✅ работает</Badge>
              </div>
              <ol className="space-y-2 text-sm text-gray-700 ml-5 list-decimal">
                <li>Заходите в <code className="bg-white px-1.5 py-0.5 rounded text-xs">/admin/max</code></li>
                <li>Пишете текст поста (можно с картинкой по URL)</li>
                <li>Нажимаете «Отправить в канал»</li>
                <li><strong>Backend max-bot</strong> делает 2 действия одновременно:
                  <ul className="ml-5 mt-1 list-disc text-gray-600">
                    <li>Отправляет POST в МАХ API → пост появляется в канале</li>
                    <li>Парсит текст и сохраняет в БД блога → пост появляется на /blog</li>
                  </ul>
                </li>
                <li>Через 1–7 дней Яндекс/Google индексируют пост</li>
              </ol>
            </div>

            <div className="border border-amber-300 bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-amber-600 text-white">Сценарий Б</Badge>
                <h4 className="font-bold text-gray-900">Публикация прямо из МАХ-приложения</h4>
                <Badge variant="outline" className="ml-auto text-amber-700">⚠️ требует настройки</Badge>
              </div>
              <ol className="space-y-2 text-sm text-gray-700 ml-5 list-decimal">
                <li>Вы пишете пост прямо в МАХ-приложении на телефоне или ПК</li>
                <li>МАХ должен отправить вебхук <code className="bg-white px-1.5 py-0.5 rounded text-xs">message_created</code> на наш backend</li>
                <li><strong>Backend max-bot</strong> ловит вебхук → парсит → сохраняет в БД</li>
                <li>Пост появляется на /blog автоматически с обложкой из МАХ</li>
              </ol>
              <div className="mt-3 p-3 bg-white rounded-lg border border-amber-200">
                <p className="text-xs text-amber-800 font-semibold mb-1">⚠️ Текущий статус:</p>
                <p className="text-xs text-gray-700">
                  Backend готов и ждёт вебхуки. <strong>Но в МАХ Bot API нужно зарегистрировать webhook URL</strong> — иначе МАХ не знает, куда слать события. Инструкция → блок 5.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-700 font-bold">3</span>
              Что происходит с постом после публикации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-700">
              Парсер <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">blog_parser.py</code> разбирает текст поста по структуре:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <PostFieldCard
                icon="Heading1"
                title="Заголовок"
                desc="Первая значимая строка (без эмодзи)"
                example='"СМЕХ — ЛУЧШЕЕ ЛЕКАРСТВО..."'
              />
              <PostFieldCard
                icon="Link"
                title="URL-адрес (slug)"
                desc="Транслит заголовка для красивого URL"
                example="smeh-luchshee-lekarstvo"
              />
              <PostFieldCard
                icon="FileText"
                title="Excerpt"
                desc="Первый абзац для SEO-описания (~160 симв)"
                example='"Mayo Clinic (2024): смех снижает кортизол на 23%..."'
              />
              <PostFieldCard
                icon="Tag"
                title="Категория"
                desc="Авто-определение по ключевым словам"
                example="🧠 Психология / 👶 Дети / 💰 Финансы"
              />
              <PostFieldCard
                icon="Hash"
                title="Теги"
                desc="3-5 тегов из словаря (семья, дети, наука...)"
                example="#наука #семья #юмор #дети"
              />
              <PostFieldCard
                icon="Image"
                title="Обложка"
                desc="Первая картинка из attachments МАХ"
                example="image/photo → cover_image_url"
              />
              <PostFieldCard
                icon="Search"
                title="SEO Title"
                desc="Заголовок для Google/Яндекса (до 70 симв)"
                example='"Смех в семье: что говорит наука — Наша Семья"'
              />
              <PostFieldCard
                icon="Clock"
                title="Время чтения"
                desc="По числу слов (~200 слов/мин)"
                example="3 мин"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">4</span>
              Картинки — да, выгружаются автоматически
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700 leading-relaxed">
            <p>
              <strong>Когда МАХ отправит нам вебхук с постом</strong>, в нём будет поле <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">attachments</code>.
              Если в посте была картинка — мы найдём её URL и подставим в <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">cover_image_url</code> поста на сайте.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg font-mono text-xs">
{`def extract_image_from_attachments(attachments):
    for att in attachments:
        if att.type in ('image', 'photo'):
            return att.payload.url`}
            </div>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>📌 Важно про 38 исторических постов:</strong> они залиты миграцией ДО включения зеркала, поэтому без картинок.
                В админке <code className="bg-white px-1.5 py-0.5 rounded text-xs">/admin/blog</code> есть кнопка
                «<strong>ИИ-обложки</strong>» — она через YandexART сгенерирует красивые обложки в стиле каждой категории.
                Для новых постов из МАХ это не нужно — картинка из МАХ уйдёт сразу.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-300">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold">5</span>
              ⚡ Включение автоматического зеркала
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                <Icon name="Info" size={16} />
                Что это и зачем нужно
              </h4>
              <p className="text-sm text-blue-900 leading-relaxed">
                Сейчас, когда вы пишете пост <strong>прямо в МАХ-приложении</strong> (с телефона или max.ru), он остаётся <strong>только в канале</strong> и пропадает за 24 часа.
                Поисковики его не видят, новых регистраций он не приносит.
              </p>
              <p className="text-sm text-blue-900 leading-relaxed mt-2">
                «Автоматическое зеркало» — это связь между МАХ и нашим сайтом. После включения, как только вы написали пост в канале — он мгновенно появляется на nasha-semiya.ru/blog со всеми SEO-настройками. Через 1–7 дней Яндекс начинает приводить читателей через поиск.
              </p>
            </div>

            <WebhookConnector />

            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Icon name="HelpCircle" size={16} />
                Часто задаваемые вопросы
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <details className="group">
                  <summary className="cursor-pointer font-medium hover:text-purple-600">
                    🔒 Это безопасно?
                  </summary>
                  <p className="mt-1 ml-4 text-gray-600 text-xs leading-relaxed">
                    Да. Кнопка использует ваш собственный бот МАХ (токен лежит в защищённых секретах проекта). Связь односторонняя: МАХ присылает нам уведомления о новых постах, мы их сохраняем. Никто посторонний не может ничего отправить.
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-medium hover:text-purple-600">
                    💸 Это платно?
                  </summary>
                  <p className="mt-1 ml-4 text-gray-600 text-xs leading-relaxed">
                    Нет. Webhook у МАХ бесплатный. На нашей стороне — копеечные затраты на cloud-функцию (1 запуск ≈ 0,001 ₽).
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-medium hover:text-purple-600">
                    ↩️ Можно отключить?
                  </summary>
                  <p className="mt-1 ml-4 text-gray-600 text-xs leading-relaxed">
                    Да, в любой момент — кнопкой «Отключить». После этого посты из МАХ перестанут попадать на сайт автоматически (но сценарий А через админку будет работать).
                  </p>
                </details>
                <details className="group">
                  <summary className="cursor-pointer font-medium hover:text-purple-600">
                    🐌 А если МАХ-бот сбросит подписку?
                  </summary>
                  <p className="mt-1 ml-4 text-gray-600 text-xs leading-relaxed">
                    Зайдите сюда снова и нажмите «Включить» ещё раз. Кнопка «Проверить ещё раз» показывает, в каком сейчас состоянии связка.
                  </p>
                </details>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">6</span>
              SEO — как Яндекс и Google находят посты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-700">
            <p>На каждый пост работает 4-уровневая SEO-обвязка:</p>
            <div className="space-y-2">
              <SeoItem
                title="sitemap-blog.xml"
                desc="Карта сайта со всеми 38 постами + 8 категорий + теги. Лежит на /sitemap-blog.xml"
              />
              <SeoItem
                title="robots.txt"
                desc="Разрешает Яндексу/Google индексировать /blog и указывает на sitemap"
              />
              <SeoItem
                title="meta-теги (react-helmet-async)"
                desc="На каждой странице поста: title, description, OG, Twitter, canonical, article:tags"
              />
              <SeoItem
                title="JSON-LD schema.org"
                desc="Article + BreadcrumbList — для красивых сниппетов в выдаче с хлебными крошками"
              />
            </div>

            <YandexWebmasterGuide />
            <GoogleSearchConsoleGuide />

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-bold text-sm text-purple-900 mb-2 flex items-center gap-2">
                <Icon name="Calendar" size={16} />
                Чего ждать по срокам
              </h4>
              <div className="text-xs text-gray-700 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">1–3 дня</Badge>
                  <span>Яндекс «увидит» sitemap, начнёт обход. В разделе «Индексирование → Файлы Sitemap» появится зелёная галочка</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">5–14 дней</Badge>
                  <span>В разделе «Страницы в поиске» появятся первые проиндексированные посты</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">2–6 недель</Badge>
                  <span>Посты начнут появляться в реальной выдаче по запросам типа «семья развод что делать», «финансы для семьи»</span>
                </div>
                <div className="flex items-start gap-2">
                  <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">3–6 месяцев</Badge>
                  <span>Стабильный органический трафик 100–500 человек/день при условии регулярных публикаций (3–5 постов/неделю)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold">7</span>
              CTA-блоки — как трафик превращается в регистрации
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>Каждый пост на /blog содержит 2 призыва к действию:</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="font-bold text-orange-700 text-sm mb-1">🟧 «Создать Семейный ID»</div>
                <p className="text-xs text-gray-600">Главная цель — приводит человека на /register. Отображается в hero-блоке и в конце поста.</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="font-bold text-purple-700 text-sm mb-1">🟪 «Подписаться на МАХ-канал»</div>
                <p className="text-xs text-gray-600">Возвращает читателя в канал. Ссылка max.ru/id231805288780_biz открывается прямо в МАХ.</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              Дополнительно: связанные посты (4 шт по той же категории) → удержание читателя на сайте → лучшее SEO.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">8</span>
              Управление контентом блога
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-700">
            <p>Все посты можно редактировать в админке <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">/admin/blog</code>:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li><strong>Изменить</strong> заголовок, slug, контент, обложку, категорию</li>
              <li><strong>SEO-блок</strong> — отдельные поля title/description/keywords с подсчётом символов</li>
              <li><strong>Скрыть</strong> пост (черновик) — он исчезнет из публичного блога и из sitemap</li>
              <li><strong>Архивировать</strong> — то же что скрыть, но помечает «устаревший»</li>
              <li><strong>ИИ-обложка</strong> — кнопка генерации картинки через YandexART прямо в редакторе</li>
              <li><strong>Массовая ИИ-генерация</strong> — кнопка «ИИ-обложки» в шапке /admin/blog для всех постов без картинок (фоновая задача с прогресс-баром)</li>
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={() => navigate('/admin/blog')}>
                <Icon name="LayoutGrid" size={14} className="mr-1.5" />
                Открыть управление блогом
              </Button>
              <Button size="sm" variant="outline" onClick={() => window.open('/blog', '_blank')}>
                <Icon name="ExternalLink" size={14} className="mr-1.5" />
                Открыть публичный блог
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">9</span>
              Подсказки и частые вопросы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FaqItem
              q="Могу ли я писать в МАХ как обычно, и пост появится на сайте?"
              a="Да, после настройки webhook (блок 5). Сейчас webhook не зарегистрирован у МАХ — поэтому посты из МАХ автоматически НЕ попадают на сайт. Через админку (Сценарий А) — работает уже сейчас."
            />
            <FaqItem
              q="А если я уже опубликовал в МАХ, могу ли скопировать в блог вручную?"
              a="Да, через /admin/max → форма публикации. Текст уйдёт в канал ещё раз — и сразу попадёт на сайт. Или: backend имеет endpoint POST /?action=mirror — добавит пост только в блог, минуя МАХ."
            />
            <FaqItem
              q="Дубликаты — что если webhook прилетит дважды?"
              a="Защита есть: backend проверяет max_message_id перед сохранением. Если такой пост уже есть — он не создаётся повторно."
            />
            <FaqItem
              q="Что делать с постом, который прошёл плохо (опечатки, не та категория)?"
              a="В /admin/blog → меню «...» рядом с постом → «Редактировать». Там можно поменять что угодно — слаг, текст, категорию, SEO-поля. Изменения сразу видны на сайте."
            />
            <FaqItem
              q="Как часто обновлять sitemap?"
              a="Файл /sitemap-blog.xml сейчас статичный (генерируется при заливе). Для актуализации запросите у разработчика обновить файл, или добавьте в админку кнопку «Перегенерировать sitemap» — могу сделать одним движением."
            />
            <FaqItem
              q="Что если МАХ-канал упадёт/закроется?"
              a="Блог продолжит работать независимо. Все посты в нашей БД. Можно публиковать через /admin/max используя форму (она пишет в БД даже если МАХ недоступен)."
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-3">📝 Чек-лист: что нужно проверить сейчас</h3>
            <div className="space-y-2">
              <ChecklistItem text="Backend max-bot задеплоен и работает (логи без ошибок)" done />
              <ChecklistItem text="Backend blog-api отвечает (38 постов в БД)" done />
              <ChecklistItem text="Sitemap /sitemap-blog.xml доступен с 47 URL" done />
              <ChecklistItem text="Robots.txt разрешает индексацию /blog" done />
              <ChecklistItem text="Публикация через /admin/max → пишет и в МАХ, и в БД блога" done />
              <ChecklistItem text="Webhook от МАХ зарегистрирован (Сценарий Б)" />
              <ChecklistItem text="Sitemap отправлен в Яндекс.Вебмастер" />
              <ChecklistItem text="Sitemap отправлен в Google Search Console" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PostFieldCard({ icon, title, desc, example }: { icon: string; title: string; desc: string; example: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-white">
      <div className="flex items-start gap-2.5">
        <Icon name={icon} size={18} className="text-pink-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-sm text-gray-900">{title}</div>
          <div className="text-xs text-gray-600 mt-0.5">{desc}</div>
          <div className="text-xs text-gray-500 italic mt-1 truncate">{example}</div>
        </div>
      </div>
    </div>
  );
}

function SeoItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <Icon name="CheckCircle2" size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
      <div>
        <div className="font-mono text-xs font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-200 rounded-lg overflow-hidden">
      <summary className="cursor-pointer p-3 hover:bg-gray-50 transition-colors flex items-start gap-2">
        <Icon name="ChevronRight" size={16} className="mt-0.5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-90" />
        <span className="font-medium text-sm text-gray-900">{q}</span>
      </summary>
      <div className="px-3 pb-3 pl-9 text-sm text-gray-700 leading-relaxed">{a}</div>
    </details>
  );
}

function ChecklistItem({ text, done = false }: { text: string; done?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {done ? (
        <Icon name="CheckCircle2" size={18} className="text-green-200 mt-0.5 flex-shrink-0" />
      ) : (
        <Icon name="Circle" size={18} className="text-white/60 mt-0.5 flex-shrink-0" />
      )}
      <span className={done ? '' : 'text-white/90'}>{text}</span>
    </div>
  );
}

function CopyableUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Скопировано!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Не удалось скопировать');
    }
  };
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-2 my-2">
      <code className="flex-1 text-xs md:text-sm font-mono text-gray-800 break-all px-1">{url}</code>
      <Button
        size="sm"
        variant={copied ? 'default' : 'outline'}
        onClick={handleCopy}
        className={copied ? 'bg-green-500 hover:bg-green-600 flex-shrink-0' : 'flex-shrink-0'}
      >
        <Icon name={copied ? 'Check' : 'Copy'} size={14} className="mr-1" />
        {copied ? 'Скопировано' : 'Копировать'}
      </Button>
    </div>
  );
}

function YandexWebmasterGuide() {
  return (
    <div className="border-2 border-red-200 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">Я</div>
        <h3 className="font-bold">Яндекс.Вебмастер — пошаговая инструкция</h3>
      </div>
      <div className="p-4 space-y-4 bg-white">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800 text-sm font-semibold">
            <Icon name="CheckCircle2" size={16} />
            Сайт уже верифицирован — ничего настраивать заново не нужно
          </div>
          <p className="text-xs text-green-700 mt-1">На скриншоте видно «Ошибок нет», 21 показ за неделю — Яндекс уже видит главную. Осталось показать ему блог.</p>
        </div>

        <p className="text-sm text-gray-700">
          <strong>Зайдите на</strong>{' '}
          <a href="https://webmaster.yandex.ru" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">webmaster.yandex.ru</a>{' '}
          и выберите сайт <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">https://nasha-semiya.ru</code>
        </p>

        <Step num={1} title="Откройте раздел «Файлы Sitemap»">
          <p>В левом меню кликните <strong>«Индексирование»</strong> → раскроется подменю → выберите <strong>«Файлы Sitemap»</strong></p>
          <p className="text-xs text-gray-500 mt-1">Прямая ссылка: <a href="https://webmaster.yandex.ru/site/https:nasha-semiya.ru:443/indexing/sitemap/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">webmaster.yandex.ru → Индексирование → Файлы Sitemap</a></p>
        </Step>

        <Step num={2} title="Добавьте sitemap блога">
          <p>В верхней части страницы вы увидите поле «Добавить файл Sitemap». Скопируйте этот URL и вставьте в поле:</p>
          <CopyableUrl url={SITEMAP_URL} />
          <p>Нажмите кнопку <strong>«Добавить»</strong>.</p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
            ⚠️ Если рядом увидите старый sitemap (например, <code>/sitemap.xml</code>) — оставьте его, не удаляйте. У сайта может быть несколько карт.
          </p>
        </Step>

        <Step num={3} title="Дождитесь обработки (1–24 часа)">
          <p>Сначала Яндекс покажет статус «<strong>В очереди</strong>» — это нормально. Через несколько часов статус сменится на:</p>
          <ul className="ml-4 mt-1 space-y-1 text-xs">
            <li>✅ <strong>«ОК, 47 ссылок»</strong> — всё хорошо, Яндекс прочитал карту</li>
            <li>⚠️ <strong>«Не удалось загрузить»</strong> — крайне маловероятно, но если так — напиши мне, проверю</li>
          </ul>
        </Step>

        <Step num={4} title="Запустите переобход страниц (ускоряет индексацию)">
          <p>В левом меню: <strong>«Индексирование» → «Переобход страниц»</strong>.</p>
          <p>В поле «Адрес страницы» по очереди вставьте и нажимайте «Отправить» — для каждого URL:</p>
          <CopyableUrl url="https://nasha-semiya.ru/blog" />
          <CopyableUrl url="https://nasha-semiya.ru/" />
          <p className="text-xs text-gray-600 mt-1">Лимит: 30 URL в день. Этого хватит — потом Яндекс сам найдёт остальные через sitemap.</p>
        </Step>

        <Step num={5} title="Проверьте robots.txt (если возникнут вопросы)">
          <p>В разделе <strong>«Инструменты» → «Анализ robots.txt»</strong> можно убедиться, что блог разрешён для индексации.</p>
          <p>В поле «Список URL» вставьте: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">https://nasha-semiya.ru/blog</code> → нажмите «Проверить» → должно быть <strong>«разрешён»</strong>.</p>
        </Step>

        <Step num={6} title="Проверка через 7 дней">
          <p>Зайдите снова в Вебмастер → <strong>«Индексирование» → «Страницы в поиске»</strong>. Должны появиться записи вида:</p>
          <ul className="ml-4 text-xs text-gray-600 space-y-0.5">
            <li>• <code className="bg-gray-100 px-1 rounded">/blog</code></li>
            <li>• <code className="bg-gray-100 px-1 rounded">/blog/post/...</code> (38 шт)</li>
            <li>• <code className="bg-gray-100 px-1 rounded">/blog/category/...</code> (8 шт)</li>
          </ul>
        </Step>

        <Button
          asChild
          className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
        >
          <a href="https://webmaster.yandex.ru/site/https:nasha-semiya.ru:443/indexing/sitemap/" target="_blank" rel="noopener noreferrer">
            <Icon name="ExternalLink" size={16} className="mr-2" />
            Открыть «Файлы Sitemap» в Вебмастере
          </a>
        </Button>
      </div>
    </div>
  );
}

function GoogleSearchConsoleGuide() {
  return (
    <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">G</div>
        <h3 className="font-bold">Google Search Console — пошаговая инструкция</h3>
      </div>
      <div className="p-4 space-y-4 bg-white">
        <p className="text-sm text-gray-700">
          Для русскоязычной аудитории Яндекс важнее, но Google тоже даёт 20–30% трафика. Делается так же быстро.
        </p>

        <Step num={1} title="Зайдите и добавьте сайт">
          <p>Откройте <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">search.google.com/search-console</a>, войдите через гугл-аккаунт.</p>
          <p>Если сайт ещё не добавлен — нажмите «Добавить ресурс» → выберите тип <strong>«Префикс URL»</strong> → введите <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">https://nasha-semiya.ru</code></p>
        </Step>

        <Step num={2} title="Подтвердите права (если ещё не подтверждены)">
          <p>Google предложит несколько способов. Самый простой — <strong>HTML-тег</strong>:</p>
          <ol className="ml-4 mt-1 list-decimal text-xs space-y-1 text-gray-600">
            <li>Скопируйте предложенный мета-тег вида <code className="bg-gray-100 px-1 rounded">&lt;meta name="google-site-verification" content="..."&gt;</code></li>
            <li>Пришлите его мне в этот чат</li>
            <li>Я добавлю его в <code className="bg-gray-100 px-1 rounded">index.html</code></li>
            <li>Через 5 минут вернётесь в Google и нажмёте «Подтвердить»</li>
          </ol>
        </Step>

        <Step num={3} title="Отправьте sitemap">
          <p>В левом меню → <strong>«Файлы Sitemap»</strong> → введите в поле:</p>
          <CopyableUrl url="sitemap-blog.xml" />
          <p className="text-xs text-gray-600">Google добавит к нему ваш домен автоматически. Нажмите «Отправить».</p>
        </Step>

        <Step num={4} title="Запросите индексацию ключевых страниц">
          <p>В верхней строке поиска (внутри Search Console) вставьте URL и нажмите Enter:</p>
          <CopyableUrl url="https://nasha-semiya.ru/blog" />
          <p>Откроется страница «Проверка URL». Нажмите кнопку <strong>«Запросить индексирование»</strong>. Повторите для главной страницы.</p>
        </Step>

        <Step num={5} title="Через 7–14 дней проверьте результат">
          <p>В разделе <strong>«Индексирование страниц»</strong> увидите количество проиндексированных URL.</p>
        </Step>
      </div>
    </div>
  );
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
        {num}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900 mb-1">{title}</h4>
        <div className="text-sm text-gray-700 space-y-1 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}