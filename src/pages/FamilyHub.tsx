import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubInstructionBlock from '@/components/hub/HubInstructionBlock';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { useFamilyHubData } from '@/components/family-hub/useFamilyHubData';
import { useFamilyHubAttention } from '@/components/family-hub/useFamilyHubAttention';
import FamilyHubSections from '@/components/family-hub/FamilyHubSections';

const BANNER_URL = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/085ddc0a-aabd-4e26-ab31-0d1efb4f31bd.jpg';

export default function FamilyHub() {
  const navigate = useNavigate();
  const {
    members,
    membersLoading,
    tasks,
    calendarEvents,
    familyCount,
    childrenCount,
    treeCount,
    subSections,
  } = useFamilyHubData();

  const { attentionItems, nextStep } = useFamilyHubAttention({
    familyCount,
    childrenCount,
    treeCount,
    membersLoading,
  });

  return (
    <>
      <SEOHead
        title="Семья — профили и управление семьёй"
        description="Профили членов семьи, семейное древо, дети, семейный маячок. Центр управления вашей семьёй."
        path="/family-hub"
        breadcrumbs={[{ name: 'Семья', path: '/family-hub' }]}
      />
      <HubLayoutV2
        title="Семья"
        subtitle="Операционный хаб — Цикл: Сбор"
        description="Профили, дети, древо и связь между всеми членами семьи."
        icon="Users"
        iconColor="text-blue-600"
        iconBg="bg-blue-100 dark:bg-blue-900/40"
        modalities={['family', 'service']}
        cycleHint="Здесь начинается семейная ОС: данные отсюда питают все остальные хабы"
        backgroundClass="bg-gradient-to-b from-blue-50 via-indigo-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        bannerUrl={BANNER_URL}
        bannerAlt="Семья — профили и управление"
        quickFacts={[
          { label: 'Профилей',  value: familyCount,   icon: 'Users' },
          { label: 'Детей',     value: childrenCount, icon: 'Baby' },
          { label: 'В древе',   value: treeCount,     icon: 'GitBranch' },
          { label: 'Связь',     value: 'Все хабы',    icon: 'Network' },
        ]}
        primaryAction={
          familyCount === 0
            ? { label: 'Добавить семью', icon: 'UserPlus', onClick: () => navigate('/family-management') }
            : { label: 'Открыть чат', icon: 'MessagesSquare', onClick: () => navigate('/family-chat') }
        }
        secondaryAction={{
          label: 'Древо',
          icon: 'GitBranch',
          onClick: () => navigate('/tree'),
        }}
        attention={attentionItems}
        nextStep={nextStep}
        relatedLinks={[
          { label: 'Планирование', icon: 'Target', path: '/planning-hub' },
          { label: 'Здоровье',     icon: 'HeartPulse', path: '/health-hub' },
          { label: 'Развитие',     icon: 'Brain', path: '/development-hub' },
          { label: 'Семейный код', icon: 'Sparkles', path: '/family-matrix' },
        ]}
      >
        <div className="space-y-6">
          <HubInstructionBlock
            accent="blue"
            intro="«Семья» — центральное пространство, где живёт состав, связи и совместная жизнь. Добавьте близких, опишите отношения — и все остальные разделы оживут вашими реальными данными."
            steps={[
              { number: 1, title: 'Добавьте членов семьи', description: 'Заполните имена, даты рождения и роли. Это база для всех расчётов: от планов до семейного кода.' },
              { number: 2, title: 'Постройте дерево связей', description: 'Укажите родственные отношения — кто кому кем приходится. Это раскрывает картину семьи целиком.' },
              { number: 3, title: 'Ведите общую жизнь', description: 'Календарь событий, задачи, праздники, традиции — всё, что объединяет семью в одном месте.' },
              { number: 4, title: 'Связи с другими разделами', description: 'Данные о семье автоматически подтягиваются в «Развитие», «Семейный код», «Ценности» и другие хабы.' },
            ]}
            tips={[
              { text: 'Чем подробнее заполнен профиль — тем точнее работают ИИ-советы во всех разделах.' },
              { text: 'Укажите дату рождения каждого: это запускает нумерологию и астрологию в Семейном коде.' },
            ]}
          />

          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Члены семьи
              </div>
              <div className="text-[11px] text-gray-400 dark:text-gray-500">
                {familyCount > 0 ? `${familyCount} участников` : 'Никого не добавлено'}
              </div>
            </div>
            <FamilyMembersGrid
              members={Array.isArray(members) ? members : []}
              onMemberClick={(member) => navigate(`/member/${member.id}`)}
              tasks={tasks}
              events={calendarEvents}
            />
          </div>

          <FamilyHubSections sections={subSections} onSelect={navigate} />
        </div>
      </HubLayoutV2>
    </>
  );
}
