import { useNavigate } from 'react-router-dom';
import { Helmet } from '@/lib/helmet';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import { FAMILY_CODE_SECTIONS } from '@/components/family-code/hubSections';
import HubInstructionBlock from '@/components/hub/HubInstructionBlock';
import HubDisclaimer from '@/components/family-code/HubDisclaimer';
import HubSectionsGrid from '@/components/family-code/HubSectionsGrid';

export default function FamilyCodeHub() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Семейный код — Нумерология, Астрология, Бацзы, Таро | Наша Семья</title>
        <meta
          name="description"
          content="Семейный код — полный эзотерический портрет вашей семьи: числа судьбы, квадрат Пифагора, зодиак, карта Бацзы, арканы Таро, ИИ-анализ конфликтов и персональные прогнозы."
        />
      </Helmet>

      <HubLayoutV2
        title="Семейный код"
        subtitle="Смысловой хаб — Цикл: Осмысление → Договорённости"
        description="Нумерология, астрология, Бацзы, арканы Таро и ИИ-советник. Глубокий портрет вашей семьи и совместимости."
        icon="Sparkles"
        iconColor="text-purple-600"
        iconBg="bg-purple-100 dark:bg-purple-900/40"
        modalities={['reflect', 'ai', 'family']}
        cycleHint="Здесь рождается понимание себя и пары — основа семейных договорённостей"
        backgroundClass="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        bannerUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/bedee241-80d3-490d-bc41-2c23df988155.jpg"
        bannerAlt="Семейный код — нумерология и астрология"
        quickFacts={[
          { label: 'Сервисов',  value: FAMILY_CODE_SECTIONS.length, icon: 'LayoutGrid' },
          { label: 'Систем',    value: 4,                  icon: 'Layers' },
          { label: 'Помощник',  value: 'Домовой ИИ',       icon: 'Brain' },
          { label: 'Характер',  value: 'Развлек. + ИИ',    icon: 'Sparkles' },
        ]}
        primaryAction={{
          label: 'Открыть личный код',
          icon: 'UserCircle2',
          onClick: () => navigate('/family-matrix/personal'),
        }}
        secondaryAction={{
          label: 'Код пары',
          icon: 'Heart',
          onClick: () => navigate('/family-matrix/couple'),
        }}
        relatedLinks={[
          { label: 'Семья',      icon: 'Users',          path: '/family-hub' },
          { label: 'Развитие',   icon: 'Brain',          path: '/development-hub' },
          { label: 'Ценности',   icon: 'Heart',          path: '/values-hub' },
          { label: 'Зеркало родителя', icon: 'HeartHandshake', path: '/pari-test' },
        ]}
      >
        <HubInstructionBlock
          accent="violet"
          intro="«Семейный код» — объединённая система глубокого анализа: нумерология, астрология, карта Бацзы, арканы Таро и ИИ-советник. Всё рассчитывается автоматически по имени и дате рождения."
          steps={[
            { number: 1, title: 'Заполните профили', description: 'Укажите дату рождения и ФИО каждого члена семьи в разделе «Семья». Этого достаточно для полного расчёта.' },
            { number: 2, title: 'Автоматический расчёт', description: 'Система рассчитает числа судьбы, квадрат Пифагора, знак зодиака, карту Бацзы и 4 аркана Таро.' },
            { number: 3, title: 'Совместимость пары', description: 'Совместимость считается по 4 пластам: числа + стихии + арканы + психотипы. Оценка 0–100% по каждому.' },
            { number: 4, title: 'Персональные советы', description: 'Домовой даёт рекомендации, анализирует конфликты и составляет прогнозы на основе всех расчётов.' },
          ]}
          tips={[
            { text: 'Раздел носит развлекательный характер и не является научным инструментом.' },
            { text: 'Чем точнее данные профиля — тем интереснее и детальнее результаты анализа.' },
          ]}
        />
        <HubDisclaimer />
        <HubSectionsGrid sections={FAMILY_CODE_SECTIONS} onSelect={navigate} />
      </HubLayoutV2>
    </>
  );
}