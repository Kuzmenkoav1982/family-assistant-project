import { useNavigate } from 'react-router-dom';
import { Helmet } from '@/lib/helmet';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import { FAMILY_CODE_SECTIONS } from '@/components/family-code/hubSections';
import HubHowItWorks from '@/components/family-code/HubHowItWorks';
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
        <HubHowItWorks />
        <HubDisclaimer />
        <HubSectionsGrid sections={FAMILY_CODE_SECTIONS} onSelect={navigate} />
      </HubLayoutV2>
    </>
  );
}
