import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubInstructionBlock from '@/components/hub/HubInstructionBlock';
import { useHouseholdSignals } from '@/components/household/useHouseholdSignals';
import HouseholdGroupedGrid from '@/components/household/HouseholdGroupedGrid';

import type { SubGroup } from '@/components/household/types';

export default function HouseholdHub() {
  const navigate = useNavigate();
  const { householdSubSections, transportSubSections, totalSections, unpaidCount } = useHouseholdSignals();

  const subGroups: SubGroup[] = [
    {
      id: 'home-group',
      title: 'Дом и хозяйство',
      subtitle: 'Повседневные совместные дела',
      sections: householdSubSections,
    },
    {
      id: 'transport-group',
      title: 'Транспорт',
      subtitle: 'Машины и поездки',
      sections: transportSubSections,
    },
  ];

  return (
    <>
      <SEOHead
        title="Дом и быт — покупки, голосования, транспорт"
        description="Списки покупок, семейные голосования, управление автомобилем и домом. Организация повседневного быта семьи."
        path="/household-hub"
        breadcrumbs={[{ name: 'Дом и быт', path: '/household-hub' }]}
      />
      <HubLayoutV2
        title="Дом и быт"
        subtitle="Операционный хаб — Цикл: Договорённости → Исполнение"
        description="Покупки, домашние решения и транспорт — всё, что делает быт семьи спокойным и понятным."
        icon="Home"
        iconColor="text-amber-600"
        iconBg="bg-amber-100 dark:bg-amber-900/40"
        modalities={['service', 'family']}
        cycleHint="Связан с Финансами и Планированием: расходы и задачи стекаются в общую картину"
        backgroundClass="bg-gradient-to-b from-amber-50 via-orange-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        bannerUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/e059a05c-4936-4b0e-819a-98a00b4a8c3d.jpg"
        bannerAlt="Дом и быт — организация семейного хозяйства"
        quickFacts={[
          { label: 'Сервисов',  value: totalSections,                 icon: 'LayoutGrid' },
          { label: 'К оплате',  value: unpaidCount > 0 ? `${unpaidCount} счёт${unpaidCount === 1 ? '' : 'ов'}` : '—', icon: 'Receipt' },
          { label: 'Подход',    value: 'Семейный',                    icon: 'Users' },
          { label: 'Связь',     value: 'Финансы',                     icon: 'Wallet' },
        ]}
        primaryAction={{
          label: 'Открыть «Дом»',
          icon: 'Building',
          onClick: () => navigate('/home-hub'),
        }}
        secondaryAction={{
          label: 'Список покупок',
          icon: 'ShoppingCart',
          onClick: () => navigate('/shopping'),
        }}
        relatedLinks={[
          { label: 'Финансы',     icon: 'Wallet',  path: '/finance' },
          { label: 'Планирование', icon: 'Target', path: '/planning-hub' },
          { label: 'Семья',       icon: 'Users',   path: '/family-hub' },
          { label: 'Питание',     icon: 'Apple',   path: '/nutrition' },
        ]}
      >
        <HubInstructionBlock
          accent="amber"
          intro="«Дом» — операционная система быта. Покупки, голосования, транспорт, ремонт и хозяйство — всё, что делает дом удобным и организованным без хаоса."
          steps={[
            { number: 1, title: 'Списки покупок', description: 'Общий список для всей семьи. Кто-то добавил молоко — другой увидит в магазине. Без чатов и звонков.' },
            { number: 2, title: 'Семейные голосования', description: 'Спорный вопрос — куда поехать, что купить? Голосуем семьёй, решаем вместе.' },
            { number: 3, title: 'Дом и транспорт', description: 'Учёт техники, ремонт, машины, ТО, страховки — все важные даты и документы в одном месте.' },
            { number: 4, title: 'Быт без рутины', description: 'Графики уборки, дежурства, поручения — распределение задач, чтобы никто не выгорал.' },
          ]}
          tips={[
            { text: '«Дом» снимает с памяти бытовую нагрузку — освобождает время и силы для главного.' },
            { text: 'Расходы по дому автоматически попадают в хаб «Финансы».' },
          ]}
        />

        <HouseholdGroupedGrid groups={subGroups} onSelect={navigate} />
      </HubLayoutV2>
    </>
  );
}