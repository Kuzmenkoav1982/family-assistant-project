import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddFamilyMemberForm } from '@/components/AddFamilyMemberForm';

interface NewChildFormPayload {
  name: string;
  role: string;
  age?: number | string;
  avatar?: string;
  avatarType?: string;
  photoUrl?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: NewChildFormPayload) => Promise<void> | void;
  variant?: 'compact' | 'full';
}

export default function AddChildDialog({ open, onOpenChange, onSubmit, variant = 'full' }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={variant === 'compact'
        ? 'max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100vw-1rem)] sm:w-full'
        : 'max-w-2xl max-h-[90vh] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>Добавить ребёнка</DialogTitle>
        </DialogHeader>
        <AddFamilyMemberForm
          isChild={true}
          onSubmit={async (newChild) => {
            await onSubmit(newChild);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
