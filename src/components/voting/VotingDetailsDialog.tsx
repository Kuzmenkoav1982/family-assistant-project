import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface VotingDetailsDialogProps {
  voting: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVote: (votingId: string, optionId: string, value: boolean) => Promise<void>;
  progress: {
    votedCount: number;
    totalMembers: number;
    percentage: number;
  };
}

export function VotingDetailsDialog({ 
  voting, 
  open, 
  onOpenChange, 
  onVote,
  progress 
}: VotingDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getVotingColor(voting.voting_type)} flex items-center justify-center`}>
              <Icon name={getVotingIcon(voting.voting_type)} size={20} className="text-white" />
            </div>
            {voting.title}
          </DialogTitle>
        </DialogHeader>
        
        {voting.description && (
          <p className="text-sm text-gray-600 -mt-2">{voting.description}</p>
        )}

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4 -mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-900">Прогресс голосования</span>
            <span className="text-sm font-bold text-purple-600">{progress.percentage}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="flex items-start gap-2">
            <Icon name="Users" size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-purple-700">
              <p className="font-medium">Проголосовало {progress.votedCount} из {progress.totalMembers}</p>
              <p className="text-purple-500 mt-0.5">Учитываются только полноценные аккаунты. Профили детей без доступа не участвуют в голосовании.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {voting.options.map((option: any) => {
            const totalVotes = option.yes_votes + option.no_votes;
            const yesPercent = totalVotes > 0 ? (option.yes_votes / totalVotes) * 100 : 0;
            
            return (
              <Card key={option.id} className="p-4">
                <div className="mb-3">
                  <h5 className="font-semibold mb-1">{option.option_text}</h5>
                  {option.description && (
                    <p className="text-sm text-gray-600">{option.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Голосов: {totalVotes}</span>
                    <span>За: {yesPercent.toFixed(0)}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all"
                      style={{ width: `${yesPercent}%` }}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => onVote(voting.id, option.id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Icon name="ThumbsUp" size={14} className="mr-1" />
                      За ({option.yes_votes})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onVote(voting.id, option.id, false)}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <Icon name="ThumbsDown" size={14} className="mr-1" />
                      Против ({option.no_votes})
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mt-4">
          <p className="text-xs text-blue-800 flex items-center gap-2">
            <Icon name="Info" size={14} />
            Голосование завершится {new Date(voting.end_date).toLocaleString('ru-RU')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}