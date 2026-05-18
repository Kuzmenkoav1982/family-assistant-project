import CollapsibleBlock from '@/components/ui/collapsible-block';

export default function HubDisclaimer() {
  return (
    <CollapsibleBlock
      icon="Info"
      iconBg="bg-blue-100 text-blue-600"
      title="Дисклеймер"
      borderColor="border-blue-200"
      bgGradient="bg-gradient-to-r from-blue-50 to-indigo-50"
    >
      <p className="text-xs text-blue-800/80 leading-relaxed">
        «Семейный код» носит <strong>развлекательно-познавательный характер</strong> и основан на традиционных эзотерических системах (пифагорейская нумерология, астрология, Бацзы, Таро).
        Результаты не являются научно доказанными и <strong>не заменяют консультацию психолога, врача или другого специалиста</strong>.
        Используйте как инструмент для самопознания и вдохновения.
      </p>
    </CollapsibleBlock>
  );
}
