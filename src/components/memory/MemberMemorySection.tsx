import MemorySection from './MemorySection';

interface MemberMemorySectionProps {
  memberId: number;
  memberName?: string;
  previewLimit?: number;
}

export default function MemberMemorySection({
  memberId,
  memberName,
  previewLimit = 4,
}: MemberMemorySectionProps) {
  return (
    <MemorySection
      previewLimit={previewLimit}
      config={{
        fetchParams: { member_id: memberId },
        linkMode: 'person',
        linkTargetId: memberId,
        linkTargetLabel: memberName || 'этому человеку',
        allMemoriesHref: `/memory?memberId=${memberId}`,
        emptyLabel: `Пока нет воспоминаний${memberName ? `, связанных с ${memberName}` : ''}`,
        createDialogProps: { initialMemberId: memberId },
      }}
    />
  );
}
