import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SectionAIAdvisor from '@/components/SectionAIAdvisor';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import HubInstructionBlock from '@/components/hub/HubInstructionBlock';

const BANNER_URL = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/47bb70ad-a80f-4f77-8588-d3d8e12dff45.jpg';

export default function HealthHub() {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead
        title="Здоровье — центр управления здоровьем семьи"
        description="Медицинские карты, прививки, лекарства, телемедицина, страховки. Полный контроль здоровья всей семьи."
        path="/health-hub"
        breadcrumbs={[{ name: 'Здоровье', path: '/health-hub' }]}
      />
      <HubLayoutV2
        title="Здоровье"
        subtitle="Хаб заботы — Цикл: Сбор → Осмысление"
        description="Медицинские карты, прививки, лекарства и поддержка от ИИ-доктора. Состояние и забота о здоровье всей семьи."
        icon="HeartPulse"
        iconColor="text-rose-600"
        iconBg="bg-rose-100 dark:bg-rose-900/40"
        modalities={['service', 'ai']}
        cycleHint="Здесь собираются факты о здоровье и переходят в действия и привычки"
        backgroundClass="bg-gradient-to-b from-rose-50 via-red-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        bannerUrl={BANNER_URL}
        bannerAlt="Здоровье семьи — медицина, питание и забота о себе"
        quickFacts={[
          { label: 'Подход',     value: 'Семейный',   icon: 'Users' },
          { label: 'Помощник',   value: 'ИИ-доктор',  icon: 'Brain' },
          { label: 'Хранение',   value: 'Защищено',   icon: 'ShieldCheck' },
          { label: 'Доступ',     value: 'По ролям',   icon: 'KeyRound' },
        ]}
        primaryAction={{
          label: 'Открыть карту здоровья',
          icon: 'HeartPulse',
          onClick: () => navigate('/health'),
        }}
        relatedLinks={[
          { label: 'Питание',    icon: 'Apple',      path: '/nutrition' },
          { label: 'Питомцы',    icon: 'PawPrint',   path: '/pets' },
          { label: 'Семья',      icon: 'Users',      path: '/family-hub' },
          { label: 'Развитие',   icon: 'Brain',      path: '/development-hub' },
        ]}
      >
        <HubInstructionBlock
          accent="rose"
          intro="«Здоровье» — единое пространство для медицинских данных всей семьи. Медкарты, прививки, лекарства и ИИ-доктор — всё под рукой, без хаоса и бумажных папок."
          steps={[
            {
              number: 1,
              title: 'Откройте карту здоровья',
              description: 'Перейдите в «Здоровье семьи» и выберите нужного члена семьи.',
            },
            {
              number: 2,
              title: 'Заполните медкарту',
              description: 'Добавьте анамнез, аллергии, хронические заболевания — это основа для ИИ-советов.',
            },
            {
              number: 3,
              title: 'Настройте прививки и лекарства',
              description: 'Ведите календарь вакцинации и аптечку. Система напомнит о приёме препаратов.',
            },
            {
              number: 4,
              title: 'Спросите ИИ-доктора',
              description: 'Задайте вопрос: симптомы, анализы, профилактика. Ответ за секунды — в чате ниже.',
            },
          ]}
          sections={[
            {
              icon: 'FileText',
              title: 'Что хранится в медкарте',
              content: 'Анамнез, аллергии, хронические заболевания, результаты анализов, история обращений к врачу. Карта создаётся отдельно на каждого члена семьи. Данные видят только те, кому вы дали доступ.',
            },
            {
              icon: 'Syringe',
              title: 'Прививки и лекарства',
              content: 'Календарь вакцинации по возрасту и медицинскому плану. Аптечка семьи — что есть, что нужно обновить, срок годности. Напоминания о приёме препаратов с нужной периодичностью.',
            },
            {
              icon: 'Brain',
              title: 'Что умеет ИИ-доктор',
              content: 'Расшифровывает анализы на понятном языке. Помогает разобраться в симптомах и найти возможные причины. Подсказывает вопросы для врача. Не ставит диагнозы и не заменяет специалиста.',
            },
            {
              icon: 'HeartPulse',
              title: 'Здоровые привычки',
              content: 'Трекинг физической активности, режима сна и питания. Спортивные цели и прогресс. Раздел работает совместно с хабом «Питание».',
            },
            {
              icon: 'ShieldCheck',
              title: 'Приватность данных',
              content: 'Все медицинские данные хранятся в зашифрованном виде. Доступ настраивается по ролям: взрослые видят карты детей, дети — только свою. Никакие данные не передаются третьим лицам.',
            },
          ]}
          tips={[
            { text: 'Заполните медкарту на каждого — ИИ-советы станут точнее.' },
            { text: 'Назначайте лекарства с напоминаниями, чтобы не пропускать приём.' },
            { text: 'Перед визитом к врачу спросите ИИ-доктора: он поможет сформулировать вопросы.' },
          ]}
        />

        <SectionAIAdvisor
          role="fitness-trainer"
          title="ИИ-Доктор и Фитнес-тренер"
          description="Здоровье, тренировки, симптомы, профилактика"
          gradientFrom="from-red-500"
          gradientTo="to-rose-600"
          accentBg="bg-red-50"
          accentText="text-red-700"
          accentBorder="border-red-200"
          placeholder="Спросите о здоровье..."
          quickQuestions={[
            'Какие анализы сдать для профилактики?',
            'Как приучить семью к спорту?',
            'Что делать при простуде?',
            'Когда нужно обновить прививки?',
            'Как нормализовать сон?',
          ]}
        />

        <div>
          <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
            Сервисы
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <HubCardV2
              icon="HeartPulse"
              iconColor="text-rose-600"
              iconBg="bg-rose-50 dark:bg-rose-950/40"
              title="Здоровье семьи"
              description="Медкарты, анализы, прививки, лекарства и телемедицина"
              modality="service"
              status="ready"
              cta="Открыть"
              onClick={() => navigate('/health')}
            />
          </div>
        </div>
      </HubLayoutV2>
    </>
  );
}
