import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  avatar_type?: string;
}

interface ParticipantsPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function ParticipantsPicker({ selectedIds, onChange }: ParticipantsPickerProps) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
      const response = await fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
        headers: {
          'X-Auth-Token': token || ''
        }
      });
      const data = await response.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      onChange(selectedIds.filter(id => id !== memberId));
    } else {
      onChange([...selectedIds, memberId]);
    }
  };

  const getSelectedNames = () => {
    return members
      .filter(m => selectedIds.includes(m.id))
      .map(m => m.name)
      .join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Icon name="Loader2" size={14} className="animate-spin" />
        Загрузка...
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Icon name="Users" size={16} />
          {selectedIds.length === 0 
            ? 'Выберите участников' 
            : `${selectedIds.length} участников: ${getSelectedNames()}`
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium text-sm mb-2">Кто участвует?</h4>
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">Нет участников семьи</p>
          ) : (
            <div className="space-y-1">
              {members.map(member => (
                <div
                  key={member.id}
                  onClick={() => toggleMember(member.id)}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedIds.includes(member.id)
                      ? 'bg-purple-50 border border-purple-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                    {member.avatar_type === 'emoji' && member.avatar 
                      ? member.avatar 
                      : member.name[0].toUpperCase()
                    }
                  </div>
                  <span className="text-sm flex-1">{member.name}</span>
                  {selectedIds.includes(member.id) && (
                    <Icon name="Check" size={16} className="text-purple-600" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}