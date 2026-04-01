import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Icon from '@/components/ui/icon';

const faqs = [
  {
    q: 'Как скачать мобильное приложение на смартфон?',
    a: 'Скачивать из магазина не нужно. Откройте сайт nasha-semiya.ru в браузере телефона, нажмите «Добавить на главный экран» — и приложение появится как обычное. Работает на Android и iPhone.',
  },
  {
    q: 'Как воспользоваться бесплатной версией?',
    a: 'Зарегистрируйтесь на сайте — бесплатная версия активируется автоматически. Она включает все основные функции: задачи, календарь, здоровье, питание и семейный маячок.',
  },
  {
    q: 'Сколько аккаунтов могут пользоваться приложением?',
    a: 'В бесплатной версии — до 4 членов семьи. Каждый получает личный профиль с индивидуальными настройками и доступом к общим разделам.',
  },
  {
    q: 'Подойдёт ли мне сервис для планирования семейного бюджета?',
    a: 'Да. В разделе «Планирование» есть учёт семейных финансов, трат и покупок. Можно вести общий бюджет, фиксировать расходы и анализировать их по категориям.',
  },
  {
    q: 'Как отменить подписку на семейное приложение?',
    a: 'Подписку можно отменить в любой момент в разделе «Настройки → Подписка». После отмены доступ сохраняется до конца оплаченного периода.',
  },
  {
    q: 'Какие категории для планирования доступны в бесплатном приложении?',
    a: 'В бесплатной версии доступны: задачи, цели, календарь, список покупок, базовые разделы здоровья и питания. Расширенные функции — в платных тарифах.',
  },
  {
    q: 'Позволяет ли сервис отслеживать местоположение членов семьи?',
    a: 'Да, в разделе «Семья» есть семейный маячок — он показывает местоположение всех членов семьи на карте в режиме реального времени. Каждый сам управляет своей геолокацией.',
  },
  {
    q: 'Есть ли функция для составления графика домашних дел для детей?',
    a: 'Да. В разделе «Быт и хозяйство» можно создавать списки домашних дел и назначать их конкретным членам семьи, включая детей. Удобно для выработки привычек и ответственности.',
  },
];

export default function WelcomeFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Icon name="HelpCircle" size={16} />
            FAQ
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Частые вопросы
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 text-sm sm:text-base">{faq.q}</span>
                <Icon
                  name={open === idx ? 'Minus' : 'Plus'}
                  size={18}
                  className="flex-shrink-0 text-gray-400"
                />
              </button>
              {open === idx && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 bg-gray-50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}