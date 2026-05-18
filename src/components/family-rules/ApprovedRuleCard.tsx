import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { FamilyRule } from './types';

interface ApprovedRuleCardProps {
  rule: FamilyRule;
  canApproveAlone?: boolean;
  onDelete: (ruleId: string) => void;
}

export default function ApprovedRuleCard({ rule, canApproveAlone, onDelete }: ApprovedRuleCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{rule.category}</Badge>
              <Badge className="bg-green-500">Действует</Badge>
            </div>
            <CardTitle className="text-lg mb-1">{rule.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{rule.description}</p>
            <p className="text-xs text-muted-foreground mt-2">Утвердил: {rule.author} • {rule.createdDate}</p>
          </div>
          {canApproveAlone && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(rule.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Icon name="Trash2" size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
