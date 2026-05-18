import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HowItWorksCollapsible from '@/components/development-hub/HowItWorksCollapsible';
import LayerTabs from '@/components/development-hub/LayerTabs';
import LayerDescription from '@/components/development-hub/LayerDescription';
import LayerSections from '@/components/development-hub/LayerSections';
import { layers } from '@/components/development-hub/layers';
import type { LayerId } from '@/components/development-hub/types';

export default function DevelopmentHub() {
  const navigate = useNavigate();
  const [activeLayer, setActiveLayer] = useState<LayerId>('panorama');
  const currentLayer = layers.find(l => l.id === activeLayer)!;

  return (
    <>
      <SEOHead
        title="Развитие — центр личностного роста семьи"
        description="Панорама развития, практика и навыки, диалог с ИИ-психологом, рефлексия родителя. Образование, рост и путь жизни в одном месте."
        path="/development-hub"
        breadcrumbs={[{ name: 'Развитие', path: '/development-hub' }]}
      />
      <HubLayoutV2
        title="Развитие"
        subtitle="Смысловой хаб — Цикл: Осмысление"
        description="От картины — к практике, диалогу и рефлексии. Четыре слоя личностного и семейного роста."
        icon="Brain"
        iconColor="text-violet-600"
        iconBg="bg-violet-100 dark:bg-violet-900/40"
        modalities={['reflect', 'ai']}
        cycleHint="Здесь рождаются смыслы, которые потом становятся договорённостями и действиями"
        backgroundClass="bg-gradient-to-b from-violet-50 via-fuchsia-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
        quickFacts={[
          { label: 'Слоёв',     value: layers.length, icon: 'Layers' },
          { label: 'Сервисов',  value: layers.reduce((s, l) => s + l.sections.length, 0), icon: 'LayoutGrid' },
          { label: 'Активный', value: currentLayer.title, icon: currentLayer.icon },
          { label: 'Подход',    value: 'Без оценок', icon: 'Heart' },
        ]}
        primaryAction={{
          label: 'Открыть портфолио',
          icon: 'Sparkles',
          onClick: () => navigate('/portfolio'),
        }}
        secondaryAction={{
          label: 'Психолог',
          icon: 'Brain',
          onClick: () => navigate('/psychologist'),
        }}
        relatedLinks={[
          { label: 'Семейный код',  icon: 'Sparkles',       path: '/family-matrix' },
          { label: 'Ценности',      icon: 'Heart',          path: '/values-hub' },
          { label: 'Семья',         icon: 'Users',          path: '/family-hub' },
          { label: 'Зеркало родителя', icon: 'HeartHandshake', path: '/pari-test' },
        ]}
      >
        <HowItWorksCollapsible />
        <LayerTabs layers={layers} activeLayer={activeLayer} onChange={setActiveLayer} />
        <LayerDescription layer={currentLayer} />
        <LayerSections sections={currentLayer.sections} onSelect={navigate} />
      </HubLayoutV2>
    </>
  );
}
