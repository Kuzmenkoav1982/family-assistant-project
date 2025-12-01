import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useVotings } from '@/hooks/useVotings';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { getCurrentMember } from '@/data/demoFamily';
import { VotingCard } from '@/components/voting/VotingCard';
import { VotingCreateDialog } from '@/components/voting/VotingCreateDialog';
import { VotingDetailsDialog } from '@/components/voting/VotingDetailsDialog';
import { VotingContextMenu } from '@/components/voting/VotingContextMenu';

export function VotingWidget() {
  const { votings, loading, createVoting, castVote, deleteVoting } = useVotings('active');
  const { members } = useFamilyMembers();
  const currentUser = getCurrentMember();
  
  const getCurrentUserId = () => {
    try {
      const authUserStr = localStorage.getItem('authUser');
      if (authUserStr) {
        const authUser = JSON.parse(authUserStr);
        return authUser.member_id || authUser.id;
      }
    } catch (e) {
      console.error('[ERROR getCurrentUserId] Error parsing auth user:', e);
    }
    return null;
  };
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedVoting, setSelectedVoting] = useState<string | null>(null);
  const [contextMenuVoting, setContextMenuVoting] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [longPressActive, setLongPressActive] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

  const handleCreateVoting = async (data: any) => {
    const result = await createVoting(data);
    
    if (result.success) {
      alert('✅ Голосование создано!');
      setShowCreateDialog(false);
    } else {
      alert('❌ Ошибка: ' + result.error);
    }
    
    return result;
  };

  const handleVote = async (votingId: string, optionId: string, value: boolean) => {
    const result = await castVote(votingId, optionId, value);
    if (!result.success) {
      alert('❌ Ошибка голосования: ' + result.error);
    }
  };

  const handleDelete = async (votingId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это голосование?')) {
      return;
    }

    setDeletingId(votingId);
    const result = await deleteVoting(votingId);
    
    if (result.success) {
      alert('✅ Голосование удалено');
      setContextMenuVoting(null);
    } else {
      alert('❌ Ошибка удаления: ' + result.error);
    }
    
    setDeletingId(null);
  };

  const handleLongPressStart = (votingId: string) => {
    longPressTriggered.current = false;
    setLongPressActive(votingId);
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setLongPressActive(null);
      setContextMenuVoting(votingId);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setLongPressActive(null);
  };

  const handleCardClick = (votingId: string) => {
    if (!longPressTriggered.current) {
      setSelectedVoting(votingId);
    }
    longPressTriggered.current = false;
  };

  const getVotingProgress = (voting: any) => {
    if (!voting.options || voting.options.length === 0) return { votedCount: 0, totalMembers: members.length, percentage: 0 };
    
    const votedUserIds = new Set<string>();
    voting.options.forEach((option: any) => {
      if (option.votes) {
        option.votes.forEach((vote: any) => {
          votedUserIds.add(vote.user_id);
        });
      }
    });
    
    const votedCount = votedUserIds.size;
    const totalMembers = members.length || 1;
    const percentage = Math.round((votedCount / totalMembers) * 100);
    
    return { votedCount, totalMembers, percentage };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Vote" size={20} />
            Голосования
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader" className="animate-spin" size={32} />
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedVotingData = votings.find(v => v.id === selectedVoting);
  const contextVotingData = votings.find(v => v.id === contextMenuVoting);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Vote" size={20} />
            Активные голосования
            {votings.length > 0 && (
              <Badge className="bg-purple-600">{votings.length}</Badge>
            )}
          </CardTitle>
          
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => setShowCreateDialog(true)}
          >
            <Icon name="Plus" size={16} className="mr-1" />
            Создать
          </Button>
        </div>
      </CardHeader>
      
      <VotingCreateDialog 
        showCreateDialog={showCreateDialog}
        setShowCreateDialog={setShowCreateDialog}
        onCreateVoting={handleCreateVoting}
      />
      
      <CardContent>
        {votings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Icon name="Vote" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="mb-2">Нет активных голосований</p>
            <p className="text-sm">Создайте первое голосование для семьи</p>
          </div>
        ) : (
          <div className="space-y-3">
            {votings.map(voting => (
              <VotingCard
                key={voting.id}
                voting={voting}
                progress={getVotingProgress(voting)}
                longPressActive={longPressActive === voting.id}
                onClick={() => handleCardClick(voting.id)}
                onLongPressStart={() => handleLongPressStart(voting.id)}
                onLongPressEnd={handleLongPressEnd}
              />
            ))}
          </div>
        )}
      </CardContent>

      <VotingContextMenu
        voting={contextVotingData || null}
        open={!!contextMenuVoting}
        onOpenChange={(open) => !open && setContextMenuVoting(null)}
        onView={() => {
          setContextMenuVoting(null);
          if (contextMenuVoting) {
            setSelectedVoting(contextMenuVoting);
          }
        }}
        onDelete={() => contextMenuVoting ? handleDelete(contextMenuVoting) : Promise.resolve()}
        deleting={deletingId === contextMenuVoting}
        currentUser={currentUser}
        getCurrentUserId={getCurrentUserId}
      />

      <VotingDetailsDialog
        voting={selectedVotingData || null}
        open={!!selectedVoting}
        onOpenChange={(open) => !open && setSelectedVoting(null)}
        onVote={handleVote}
        progress={selectedVotingData ? getVotingProgress(selectedVotingData) : { votedCount: 0, totalMembers: 0, percentage: 0 }}
      />
    </Card>
  );
}