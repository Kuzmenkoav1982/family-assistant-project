import SectionAIAdvisor from '@/components/SectionAIAdvisor';
import type { FamilyMember } from '@/types/family.types';

export default function ChildrenAIAdvisor({ children }: { children: FamilyMember[] }) {
  const sectionContext = children.length > 0
    ? `Дети в семье: ${children.map(c => `${c.name || ''}${c.birth_date ? ` (род. ${c.birth_date})` : ''}${c.role ? ` — ${c.role}` : ''}`).join('; ')}.`
    : undefined;

  return (
    <SectionAIAdvisor
      role="child-educator"
      title="ИИ-Воспитатель"
      description="Развитие, возрастные кризисы, воспитание"
      gradientFrom="from-amber-500"
      gradientTo="to-orange-600"
      accentBg="bg-amber-50"
      accentText="text-amber-700"
      accentBorder="border-amber-200"
      placeholder="Спросите о ребёнке..."
      quickQuestions={[
        'Как мотивировать к учёбе?',
        'Как пережить возрастной кризис?',
        'Как развивать самостоятельность?',
        'Как установить границы?',
        'Ребёнок не хочет в школу — что делать?',
      ]}
      sectionContext={sectionContext}
    />
  );
}
