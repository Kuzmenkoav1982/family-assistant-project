import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import HubLayoutV2 from '@/components/hub/HubLayoutV2';
import HubInstructionBlock from '@/components/hub/HubInstructionBlock';
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
        description="Панорама развития, практика и навыки, диалог с семейным ИИ-помощником, рефлексия родителя. Образование, рост и путь жизни в одном месте."
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
        bannerUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/febb4193-0344-42b6-8a2c-0ac0907ea80a.jpg"
        bannerAlt="Развитие — личностный рост семьи"
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
          label: 'ИИ-помощник',
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
        <HubInstructionBlock
          accent="violet"
          intro="«Развитие» — смысловой хаб личностного и семейного роста. Четыре слоя ведут от живой картины семьи к ежедневной практике, бережному диалогу и честной рефлексии."
          steps={[
            { number: 1, title: 'Панорама', description: 'Откройте «Портфолио развития» — живую карту по 8 сферам для каждого члена семьи. Видим картину целиком.' },
            { number: 2, title: 'Практика', description: 'Превращайте картину в шаги: планы развития, навыки, достижения, мастерская жизни.' },
            { number: 3, title: 'Диалог', description: 'Семейный ИИ-помощник, техники релаксации, упражнения для семьи и справочник кризисов. Бережный собеседник для тонких вопросов.' },
            { number: 4, title: 'Рефлексия', description: 'Зеркало родителя: научный тест PARI, радар-диаграмма установок, ИИ-разбор. Тихий взгляд внутрь — без оценок.' },
          ]}
          tips={[
            { text: 'Переключайте слои кнопками ниже — каждый открывает свои сервисы.' },
            { text: 'Здесь нет правильных и неправильных ответов — только наблюдение и осознанные шаги.' },
          ]}
        />
        <LayerTabs layers={layers} activeLayer={activeLayer} onChange={setActiveLayer} />
        <LayerDescription layer={currentLayer} />
        <LayerSections sections={currentLayer.sections} onSelect={navigate} />
      </HubLayoutV2>
    </>
  );
}