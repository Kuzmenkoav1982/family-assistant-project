import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VotingContextMenuProps {
  voting: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onView: () => void;
  onDelete: () => Promise<void>;
  deleting: boolean;
  currentUser: any;
  getCurrentUserId: () => string | null;
}

export function VotingContextMenu({
  voting,
  open,
  onOpenChange,
  onView,
  onDelete,
  deleting,
  currentUser,
  getCurrentUserId
}: VotingContextMenuProps) {
  if (!voting) return null;

  const getVotingIcon = (type: string) => {
    switch (type) {
      case 'meal': return 'Utensils';
      case 'rule': return 'Scale';
      default: return 'Vote';
    }
  };

  const getVotingColor = (type: string) => {
    switch (type) {
      case 'meal': return 'from-orange-500 to-red-500';
      case 'rule': return 'from-blue-500 to-indigo-500';
      default: return 'from-purple-500 to-pink-500';
    }
  };

  const handleDelete = async () => {
    if (!currentUser) {
      alert('❌ Пользователь не определён');
      return;
    }
    
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      alert('❌ Не удалось определить ID пользователя');
      return;
    }
    
    const userRole = currentUser.role || '';
    const isOwner = userRole === 'owner' || userRole === 'Папа' || userRole.toLowerCase().includes('владелец');
    const isAuthor = voting.created_by === currentUserId;
    
    if (!isOwner && !isAuthor) {
      alert(`❌ У вас нет прав на удаление.\n\nВаша роль: ${userRole}\nВаш ID: ${currentUserId}\nАвтор голосования: ${voting.created_by}\n\nУдалять могут только Владелец семьи и автор вопроса.`);
      return;
    }
    
    await onDelete();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getVotingColor(voting.voting_type)} flex items-center justify-center`}>
              <Icon name={getVotingIcon(voting.voting_type)} size={20} className="text-white" />
            </div>
            {voting.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 pt-4">
          <Button
            onClick={onView}
            className="w-full justify-start bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200"
            variant="outline"
          >
            <Icon name="Eye" size={18} className="mr-2" />
            Открыть голосование
          </Button>
          
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full justify-start bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
            variant="outline"
          >
            {deleting ? (
              <>
                <Icon name="Loader" size={18} className="mr-2 animate-spin" />
                Удаление...
              </>
            ) : (
              <>
                <Icon name="Trash2" size={18} className="mr-2" />
                Удалить голосование
              </>
            )}
          </Button>
          
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
          >
            Отмена
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}