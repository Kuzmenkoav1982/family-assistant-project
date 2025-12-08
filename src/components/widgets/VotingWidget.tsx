import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useVotings } from '@/hooks/useVotings';

export function VotingWidget() {
  const navigate = useNavigate();
  const { votings } = useVotings('active');

  const activeVotings = votings.filter(v => v.status === 'active');

  const getTopOption = (voting: typeof votings[0]) => {
    if (voting.options.length === 0) return null;
    return voting.options.reduce((prev, current) => 
      current.yes_votes > prev.yes_votes ? current : prev
    );
  };

  const getTotalVotes = (voting: typeof votings[0]) => {
    return voting.options.reduce((sum, opt) => sum + opt.yes_votes, 0);
  };

  return (
    <Card 
      className="animate-fade-in border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate('/voting')}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="ThumbsUp" size={24} />
          Голосование
          {activeVotings.length > 0 && (
            <Badge className="ml-auto bg-indigo-500">
              {activeVotings.length} активн.
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeVotings.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="Vote" size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">Нет активных голосований</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeVotings.slice(0, 2).map((voting) => {
              const topOption = getTopOption(voting);
              const totalVotes = getTotalVotes(voting);
              
              return (
                <div
                  key={voting.id}
                  className="p-3 rounded-lg border-2 bg-white border-indigo-100 hover:shadow transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/voting');
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-sm">{voting.title}</h4>
                    <Badge variant="outline" className="text-[10px] bg-indigo-50">
                      <Icon name="Users" size={10} className="mr-1" />
                      {totalVotes}
                    </Badge>
                  </div>
                  
                  {voting.description && (
                    <p className="text-xs text-gray-600 mb-3">{voting.description}</p>
                  )}

                  {topOption && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-700">
                          {topOption.option_text}
                        </span>
                        <span className="text-gray-500">
                          {topOption.yes_votes} голос{topOption.yes_votes !== 1 ? 'ов' : ''}
                        </span>
                      </div>
                      <Progress 
                        value={totalVotes > 0 ? (topOption.yes_votes / totalVotes) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {voting.end_date && (
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                      <Icon name="Clock" size={10} />
                      <span>До {new Date(voting.end_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                </div>
              );
            })}
            
            {activeVotings.length > 2 && (
              <p className="text-xs text-center text-gray-500 pt-2">
                +{activeVotings.length - 2} еще...
              </p>
            )}
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-indigo-600"
          onClick={(e) => {
            e.stopPropagation();
            navigate('/voting');
          }}
        >
          Все голосования →
        </Button>
      </CardContent>
    </Card>
  );
}