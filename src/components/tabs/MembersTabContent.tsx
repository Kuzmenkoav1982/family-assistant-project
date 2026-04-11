import { TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';
import type { FamilyMember } from '@/types/family.types';
import { MembersHeader } from './members/MembersHeader';
import { MembersToolbar } from './members/MembersToolbar';
import { MemberCard } from './members/MemberCard';

interface MembersTabContentProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  getWorkloadColor: (workload: number) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateMember?: (memberData: Partial<FamilyMember> & { id?: string; member_id?: string }) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteMember?: (memberId: string) => Promise<any>;
  currentUserId?: string;
}

export function MembersTabContent({
  familyMembers,
  setFamilyMembers,
  getWorkloadColor,
  updateMember,
  deleteMember,
  currentUserId,
}: MembersTabContentProps) {
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [addChildDialogOpen, setAddChildDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | undefined>(undefined);

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setAddMemberDialogOpen(true);
  };

  const displayMembers = familyMembers;

  return (
    <TabsContent value="members" className="space-y-4">
      <MembersHeader
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        addMemberDialogOpen={addMemberDialogOpen}
        setAddMemberDialogOpen={setAddMemberDialogOpen}
        addChildDialogOpen={addChildDialogOpen}
        setAddChildDialogOpen={setAddChildDialogOpen}
        editingMember={editingMember}
        setEditingMember={setEditingMember}
      />

      <MembersToolbar
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        addMemberDialogOpen={addMemberDialogOpen}
        setAddMemberDialogOpen={setAddMemberDialogOpen}
        addChildDialogOpen={addChildDialogOpen}
        setAddChildDialogOpen={setAddChildDialogOpen}
        editingMember={editingMember}
        setEditingMember={setEditingMember}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayMembers.map((member, index) => (
          <MemberCard
            key={member.id}
            member={member}
            index={index}
            familyMembers={familyMembers}
            setFamilyMembers={setFamilyMembers}
            getWorkloadColor={getWorkloadColor}
            updateMember={updateMember}
            deleteMember={deleteMember}
            currentUserId={currentUserId}
            onEditMember={handleEditMember}
          />
        ))}
      </div>
    </TabsContent>
  );
}
