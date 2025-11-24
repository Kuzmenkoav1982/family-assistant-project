import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { FamilyMember } from '@/types/family.types';

interface MoodOption {
  emoji: string;
  label: string;
}

interface RightSidebarProps {
  isVisible: boolean;
  autoHide: boolean;
  familyMembers: FamilyMember[];
  selectedMemberForMood: string | null;
  moodOptions: MoodOption[];
  showRightPanelSettings: boolean;
  onVisibilityChange: (visible: boolean) => void;
  onMemberMoodSelect: (memberId: string | null) => void;
  onMoodChange: (memberId: string, mood: MoodOption) => void;
  onRightPanelSettingsToggle: (show: boolean) => void;
}

export default function RightSidebar({
  isVisible,
  autoHide,
  familyMembers,
  selectedMemberForMood,
  moodOptions,
  showRightPanelSettings,
  onVisibilityChange,
  onMemberMoodSelect,
  onMoodChange,
  onRightPanelSettingsToggle
}: RightSidebarProps) {
  const getTimeSinceMood = (timestamp?: string) => {
    if (!timestamp) return 'Давно';
    const now = new Date();
    const moodTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - moodTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`;
    return `${Math.floor(diffInMinutes / 1440)} дн назад`;
  };

  return (
    <>
      <div
        className={`fixed right-0 top-16 bottom-0 z-40 bg-white/95 backdrop-blur-md shadow-lg transition-transform duration-300 hidden lg:block ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        onMouseEnter={() => autoHide && onVisibilityChange(true)}
      >
        <div className="h-full w-80 flex flex-col p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-700">Настроение</h2>
            <Button
              onClick={() => onRightPanelSettingsToggle(!showRightPanelSettings)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Настроить виджет"
            >
              <Icon name="Settings2" size={16} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {familyMembers.map((member) => (
              <Card 
                key={member.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onMemberMoodSelect(member.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="relative">
                      {(member as any).photoUrl ? (
                        <img 
                          src={(member as any).photoUrl} 
                          alt={member.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-purple-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-xl border-2 border-purple-300">
                          {member.avatar}
                        </div>
                      )}
                    </div>
                    <span>{member.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {member.moodStatus ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{member.moodStatus.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{member.moodStatus.label}</div>
                          <div className="text-xs text-gray-500">
                            {getTimeSinceMood(member.moodStatus.timestamp)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMemberMoodSelect(member.id);
                        }}
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <Badge variant="outline" className="text-xs">
                        Нажмите, чтобы установить
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={selectedMemberForMood !== null} onOpenChange={() => onMemberMoodSelect(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Smile" size={24} />
              Как настроение?
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {moodOptions.map((mood) => {
              const member = familyMembers.find(m => m.id === selectedMemberForMood);
              if (!member) return null;
              
              return (
                <button
                  key={mood.label}
                  onClick={() => onMoodChange(member.id, mood)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <span className="text-4xl">{mood.emoji}</span>
                  <span className="text-sm font-medium">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}