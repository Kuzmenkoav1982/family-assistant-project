import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { DEMO_MEAL_VOTES, type MealVote } from '@/data/demoRecipes';
import { DEMO_FAMILY, getCurrentMember } from '@/data/demoFamily';

export default function MealVotingWidget() {
  const [votes, setVotes] = useState<MealVote[]>(DEMO_MEAL_VOTES);
  const currentMember = getCurrentMember();
  
  if (!currentMember) return null;

  const activeVote = votes.find(v => v.status === 'active');
  
  if (!activeVote) return null;

  const getMealTypeLabel = (type: string) => {
    const labels = {
      breakfast: 'Завтрак',
      lunch: 'Обед',
      dinner: 'Ужин'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleVote = (recipeId: string) => {
    setVotes(votes.map(vote => {
      if (vote.id === activeVote.id) {
        return {
          ...vote,
          options: vote.options.map(opt => {
            const hasVoted = opt.votes.includes(currentMember.id);
            const isThisOption = opt.recipeId === recipeId;
            
            if (isThisOption && !hasVoted) {
              return {
                ...opt,
                votes: [...opt.votes, currentMember.id]
              };
            }
            
            if (!isThisOption && hasVoted) {
              return {
                ...opt,
                votes: opt.votes.filter(v => v !== currentMember.id)
              };
            }
            
            return opt;
          })
        };
      }
      return vote;
    }));
  };

  const totalVotes = activeVote.options.reduce((sum, opt) => sum + opt.votes.length, 0);
  const currentUserVote = activeVote.options.find(opt => opt.votes.includes(currentMember.id));

  return (
    <Card className="border-2 border-orange-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon name="ChefHat" size={24} className="text-orange-600" />
          Голосование за {getMealTypeLabel(activeVote.mealType)}
          <Badge className="ml-auto bg-orange-500">
            {new Date(activeVote.date).toLocaleDateString('ru-RU')}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="text-sm text-muted-foreground mb-3">
          <Icon name="Users" size={16} className="inline mr-1" />
          Проголосовало: {totalVotes} из {DEMO_FAMILY.members.length}
        </div>

        <div className="space-y-3">
          {activeVote.options.map(option => {
            const votePercentage = totalVotes > 0 
              ? Math.round((option.votes.length / totalVotes) * 100) 
              : 0;
            const isVoted = option.votes.includes(currentMember.id);

            return (
              <button
                key={option.recipeId}
                onClick={() => handleVote(option.recipeId)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  isVoted
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{option.recipeName}</span>
                  {isVoted && (
                    <Badge className="bg-orange-500">
                      <Icon name="Check" size={14} className="mr-1" />
                      Ваш выбор
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Progress value={votePercentage} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-gray-600">
                    {option.votes.length} ({votePercentage}%)
                  </span>
                </div>

                {option.votes.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {option.votes.map(voterId => {
                      const voter = DEMO_FAMILY.members.find(m => m.id === voterId);
                      return voter ? (
                        <div
                          key={voterId}
                          className="flex items-center gap-1 bg-white rounded-full px-2 py-0.5 text-xs border"
                        >
                          <img
                            src={voter.avatar}
                            alt={voter.name}
                            className="w-4 h-4 rounded-full"
                          />
                          {voter.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {!currentUserVote && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
            <Icon name="AlertCircle" size={16} />
            <span>Выберите блюдо для голосования</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
