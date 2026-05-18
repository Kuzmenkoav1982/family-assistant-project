import MemorySection from './MemorySection';

interface EventMemorySectionProps {
  eventId: string;
  eventTitle?: string;
  eventDate?: string;
  previewLimit?: number;
}

export default function EventMemorySection({
  eventId,
  eventTitle,
  eventDate,
  previewLimit = 4,
}: EventMemorySectionProps) {
  return (
    <MemorySection
      previewLimit={previewLimit}
      config={{
        fetchParams: { event_id: eventId },
        linkMode: 'event',
        linkTargetId: eventId,
        linkTargetLabel: eventTitle || 'этому событию',
        allMemoriesHref: `/memory?eventId=${eventId}`,
        emptyLabel: 'Пока нет воспоминаний об этом моменте',
        createDialogProps: {
          initialEventId: eventId,
          suggestedTitle: eventTitle,
          suggestedDate: eventDate,
        },
      }}
    />
  );
}