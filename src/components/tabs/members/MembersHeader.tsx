import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';
import { useNavigate } from 'react-router-dom';
import type { FamilyMember } from '@/types/family.types';

interface MembersHeaderProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  addMemberDialogOpen: boolean;
  setAddMemberDialogOpen: (open: boolean) => void;
  addChildDialogOpen: boolean;
  setAddChildDialogOpen: (open: boolean) => void;
  editingMember: FamilyMember | undefined;
  setEditingMember: (member: FamilyMember | undefined) => void;
}

export function MembersHeader({
  familyMembers,
  setFamilyMembers,
  addMemberDialogOpen,
  setAddMemberDialogOpen,
  addChildDialogOpen,
  setAddChildDialogOpen,
  editingMember,
  setEditingMember,
}: MembersHeaderProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Icon name="Users" size={24} className="text-purple-600" />
              Профили семьи
            </h3>
            <p className="text-sm text-gray-600">Просмотр и редактирование профилей всех членов семьи</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => navigate('/permissions')}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Icon name="Shield" size={16} className="mr-2" />
              Управление правами
            </Button>
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
                  onClick={() => {
                    setAddChildDialogOpen(true);
                  }}
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
      </CardContent>
    </Card>
  );
}
