import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import FamilyInviteManager from '@/components/FamilyInviteManager';
import AssistantTypeSelectorDialog from '@/components/AssistantTypeSelectorDialog';

interface IndexDialogsProps {
  showFamilyInvite: boolean;
  showAssistantSelector: boolean;
  onFamilyInviteChange: (show: boolean) => void;
  onAssistantSelectorChange: (show: boolean) => void;
}

export function IndexDialogs({
  showFamilyInvite,
  showAssistantSelector,
  onFamilyInviteChange,
  onAssistantSelectorChange,
}: IndexDialogsProps) {
  return (
    <>
      <Dialog open={showFamilyInvite} onOpenChange={onFamilyInviteChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
              <Icon name="UserPlus" size={24} />
              Управление семьёй
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <FamilyInviteManager />
          </div>
        </DialogContent>
      </Dialog>

      <AssistantTypeSelectorDialog
        isOpen={showAssistantSelector}
        onClose={() => onAssistantSelectorChange(false)}
      />
    </>
  );
}
