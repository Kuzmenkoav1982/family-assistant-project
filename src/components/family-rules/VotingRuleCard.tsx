import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import type { FamilyRule } from './types';

interface VotingRuleCardProps {
  rule: FamilyRule;
  currentUser: string;
  canApproveAlone?: boolean;
  onVote: (ruleId: string, vote: 'for' | 'against') => void;
  onDelete: (ruleId: string) => void;
}

export default function VotingRuleCard({ rule, currentUser, canApproveAlone, onVote, onDelete }: VotingRuleCardProps) {
  if (!rule.votes) return null;
  const hasVoted = rule.votes.for.includes(currentUser) || rule.votes.against.includes(currentUser);

  return (
    <Card className="border-2 border-amber-200 bg-amber-50/30">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{rule.category}</Badge>
              <Badge className="bg-amber-500">Голосование</Badge>
            </div>
            <CardTitle className="text-lg mb-1">{rule.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{rule.description}</p>
            <p className="text-xs text-muted-foreground mt-2">Предложил: {rule.author} • {rule.createdDate}</p>
          </div>
          {(rule.author === currentUser || canApproveAlone) && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(rule.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Icon name="Trash2" size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Голосов ЗА: {rule.votes.for.length}</span>
            <span>Нужно: {rule.votes.required}</span>
          </div>
          <Progress value={(rule.votes.for.length / rule.votes.required) * 100} className="h-2" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium mb-1">За ({rule.votes.for.length}):</p>
            <div className="flex flex-wrap gap-1">
              {rule.votes.for.map(name => (
                <Badge key={name} variant="secondary" className="bg-green-100 text-green-700 text-xs">{name}</Badge>
              ))}
            </div>
          </div>
          {rule.votes.against.length > 0 && (
            <div className="flex-1">
              <p className="text-xs font-medium mb-1">Против ({rule.votes.against.length}):</p>
              <div className="flex flex-wrap gap-1">
                {rule.votes.against.map(name => (
                  <Badge key={name} variant="secondary" className="bg-red-100 text-red-700 text-xs">{name}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        {!hasVoted && (
          <div className="flex gap-2 pt-2">
            <Button onClick={() => onVote(rule.id, 'for')} className="flex-1 bg-green-500 hover:bg-green-600" size="sm">
              <Icon name="ThumbsUp" className="mr-2" size={16} />За
            </Button>
            <Button onClick={() => onVote(rule.id, 'against')} variant="outline" className="flex-1" size="sm">
              <Icon name="ThumbsDown" className="mr-2" size={16} />Против
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
