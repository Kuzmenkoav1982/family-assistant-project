import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface FamilyMember {
  id: string;
  name: string;
  role: string;
  relationship?: string;
  photo_url?: string;
  avatar?: string;
}

interface FamilyMembersCardProps {
  members: FamilyMember[];
  onDeleteMember: (memberId: string, memberName: string) => Promise<void>;
}

/**
 * Массовое удаление дубликатов убрано намеренно.
 * Помеченные записи изолированы на сервере (member_status='duplicate_review'),
 * не выдаются в списке участников и разбираются вручную: пометка в имени
 * не доказывает, что на запись не ссылаются пользовательские данные.
 */
export function FamilyMembersCard({ 
  members, 
  onDeleteMember
}: FamilyMembersCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={24} />
            Члены семьи ({members.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map(member => (
            <Card key={member.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {member.photo_url ? (
                      <img 
                        src={member.photo_url} 
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover border-2"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {member.avatar || '👤'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.relationship || member.role}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteMember(member.id, member.name)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}