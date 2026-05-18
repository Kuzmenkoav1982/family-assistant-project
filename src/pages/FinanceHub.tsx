import { useState } from 'react';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HowItWorksBlock from '@/components/hub/HowItWorksBlock';
import { subSections, OWNER_ONLY_SECTIONS, HOW_IT_WORKS_STEPS } from '@/components/finance/hubSections';
import HubPrivacyNote from '@/components/finance/HubPrivacyNote';
import HubGroupedGrid from '@/components/finance/HubGroupedGrid';
import HubAiBanner from '@/components/finance/HubAiBanner';
import HubAiDialog from '@/components/finance/HubAiDialog';
import { useFinanceAi } from '@/components/finance/useFinanceAi';

export default function FinanceHub() {
  const navigate = useNavigate();
  const isOwner = useIsFamilyOwner();
  const [showAI, setShowAI] = useState(false);
  const { aiQuestion, setAiQuestion, aiAdvice, aiLoading, askAI } = useFinanceAi();

  const visibleSections = subSections.filter(s => isOwner || !OWNER_ONLY_SECTIONS.includes(s.id));

  const openAi = () => {
    setShowAI(true);
    if (!aiAdvice) askAI();
  };

  return (
    <>
      <SEOHead
        title="Финансы — центр управления семейным бюджетом"
        description="Бюджет, счета, кредиты, финансовые цели, имущество, скидочные карты. Всё для финансового благополучия семьи."
        path="/finance"
        breadcrumbs={[{ name: 'Финансы', path: '/finance' }]}
      />
      <HubLayoutV2
        title="Финансы"
        subtitle="Операционный хаб — Цикл: Сбор → Панорама → Исполнение"
        description="Бюджет, счета, кредиты, цели и защита. Всё для финансового благополучия семьи."
        icon="Wallet"
        iconColor="text-emerald-600"
        iconBg="bg-emerald-100 dark:bg-emerald-900/40"
        modalities={['service', 'ai']}
        cycleHint="Связан с Домом, Покупками, Питанием — расходы стекаются сюда"
        backgroundClass="bg-gradient-to-b from-emerald-50 via-green-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Сервисов',  value: visibleSections.length, icon: 'LayoutGrid' },
          { label: 'Защита',    value: 'Шифрование',           icon: 'ShieldCheck' },
          { label: 'Доступ',    value: isOwner ? 'Полный' : 'Член семьи', icon: 'KeyRound' },
          { label: 'Помощник',  value: 'ИИ-советник',          icon: 'BrainCircuit' },
        ]}
        primaryAction={{
          label: 'Финансовый пульс',
          icon: 'Activity',
          onClick: () => navigate('/finance/analytics'),
        }}
        secondaryAction={{
          label: 'Спросить ИИ',
          icon: 'BrainCircuit',
          onClick: openAi,
        }}
        relatedLinks={[
          { label: 'Дом',       icon: 'Building',     path: '/home-hub' },
          { label: 'Покупки',   icon: 'ShoppingCart', path: '/shopping' },
          { label: 'Питание',   icon: 'Apple',        path: '/nutrition' },
          { label: 'Госуслуги', icon: 'Landmark',     path: '/state-hub' },
        ]}
      >
        <HowItWorksBlock
          accent="emerald"
          intro="«Финансы» — центр управления семейным благополучием. Бюджет, счета, кредиты, цели и защита от мошенников — всё в одном месте, под рукой и под контролем."
          steps={HOW_IT_WORKS_STEPS}
          footer="12 модулей подключаются автоматически по мере заполнения. Начните с одного — остальное подтянется."
        />

        <HubPrivacyNote />

        <HubGroupedGrid sections={visibleSections} onSelect={navigate} />

        <HubAiBanner onClick={openAi} />
      </HubLayoutV2>

      <HubAiDialog
        open={showAI}
        onOpenChange={setShowAI}
        aiQuestion={aiQuestion}
        setAiQuestion={setAiQuestion}
        aiAdvice={aiAdvice}
        aiLoading={aiLoading}
        askAI={askAI}
      />
    </>
  );
}
