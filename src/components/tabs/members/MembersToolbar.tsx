import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import { WidgetSettingsDialog } from '@/components/WidgetSettingsDialog';
import type { FamilyMember } from '@/types/family.types';

interface MembersToolbarProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  addMemberDialogOpen: boolean;
  setAddMemberDialogOpen: (open: boolean) => void;
  addChildDialogOpen: boolean;
  setAddChildDialogOpen: (open: boolean) => void;
  editingMember: FamilyMember | undefined;
  setEditingMember: (member: FamilyMember | undefined) => void;
}

export function MembersToolbar({
  familyMembers,
  setFamilyMembers,
  addMemberDialogOpen,
  setAddMemberDialogOpen,
  addChildDialogOpen,
  setAddChildDialogOpen,
  editingMember,
  setEditingMember,
}: MembersToolbarProps) {
  return (
    <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
      <h3 className="text-xl font-semibold">Все члены семьи</h3>
      <div className="flex gap-2">
        <WidgetSettingsDialog />
        <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-orange-500 to-pink-500"
              onClick={() => {
                setEditingMember(undefined);
                setAddMemberDialogOpen(true);
              }}
            >
              <Icon name="UserPlus" className="mr-2" size={16} />
              Добавить члена семьи
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Редактировать члена семьи' : 'Добавить нового члена семьи'}</DialogTitle>
            </DialogHeader>
            <AddFamilyMemberForm
              editingMember={editingMember}
              onSubmit={(newMember) => {
                if (editingMember) {
                  setFamilyMembers(familyMembers.map(m => m.id === newMember.id ? newMember : m));
                } else {
                  setFamilyMembers([...familyMembers, newMember]);
                }
                setAddMemberDialogOpen(false);
                setEditingMember(undefined);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={addChildDialogOpen} onOpenChange={setAddChildDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={() => setAddChildDialogOpen(true)}
            >
              <Icon name="Baby" className="mr-2" size={16} />
              Добавить ребёнка
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Добавить ребёнка</DialogTitle>
            </DialogHeader>
            <AddFamilyMemberForm
              editingMember={undefined}
              isChild={true}
              onSubmit={(newChild) => {
                setFamilyMembers([...familyMembers, { ...newChild, relationship: 'Ребёнок' }]);
                setAddChildDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
