import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SectionAIAdvisor from '@/components/SectionAIAdvisor';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubCardV2 from '@/components/hub/HubCardV2';
import HowItWorksBlock from '@/components/hub/HowItWorksBlock';

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
        <HowItWorksBlock
          accent="rose"
          intro="«Здоровье» — единое пространство заботы о теле и самочувствии всей семьи. Медкарты, прививки, лекарства и ИИ-доктор — всё, чтобы держать здоровье под контролем без хаоса."
          steps={[
            {
              icon: 'FileText',
              title: 'Шаг 1. Медкарты',
              description:
                'Заведите электронную медкарту на каждого члена семьи: анамнез, аллергии, хронические заболевания.',
            },
            {
              icon: 'Syringe',
              title: 'Шаг 2. Прививки и лекарства',
              description:
                'Календарь вакцинации, аптечка, напоминания о приёме препаратов — ничего не забыто.',
            },
            {
              icon: 'Activity',
              title: 'Шаг 3. ИИ-доктор',
              description:
                'Задавайте вопросы ИИ-помощнику: расшифровка анализов, симптомы, рекомендации (не заменяет врача).',
            },
            {
              icon: 'HeartPulse',
              title: 'Шаг 4. Здоровые привычки',
              description:
                'Фитнес-трекинг, режим сна и питания, спортивные цели — здоровье как ежедневная практика.',
            },
          ]}
          footer="Все данные хранятся приватно и доступны только членам вашей семьи."
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