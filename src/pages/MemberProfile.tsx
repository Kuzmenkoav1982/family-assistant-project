import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { useTasks } from '@/hooks/useTasks';
import { MemberProfileHeader } from '@/components/MemberProfile/MemberProfileHeader';
import { MemberProfileInstruction } from '@/components/MemberProfile/MemberProfileInstruction';
import { MemberProfileContent } from '@/components/MemberProfile/MemberProfileContent';
import type { Dream, FamilyMember, MemberProfile as MemberProfileType } from '@/types/family.types';

export default function MemberProfile() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { members, updateMember } = useFamilyMembersContext();
  const { saveProfile } = useMemberProfile();
  const { tasks, toggleTask, deleteTask } = useTasks();
  const [memberProfile, setMemberProfile] = useState<MemberProfileType | null>(null);
  const loadedMemberRef = useRef<string | null>(null);
  
  const member = members.find(m => m.id === memberId);

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-4">Член семьи не найден</p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </div>
      </div>
    );
  }

  const isChild = member.age && member.age < 18;
  const isOwner = member.role === 'Папа' || member.role.toLowerCase().includes('владел');
  
  const memberTasks = tasks.filter(task => task.assignee_id === memberId);

  const handleAddDream = async (dream: Omit<Dream, 'id' | 'createdAt'>) => {
    const newDream: Dream = {
      ...dream,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    await updateMember({
      id: member.id,
      dreams: [...(member.dreams || []), newDream]
    });
  };

  const handleUpdateDream = async (dreamId: string, updates: Partial<Dream>) => {
    const updatedDreams = (member.dreams || []).map(d => 
      d.id === dreamId ? { ...d, ...updates } : d
    );

    await updateMember({
      id: member.id,
      dreams: updatedDreams
    });
  };

  const handleUpdateBalance = async (newBalance: number) => {
    await updateMember({
      id: member.id,
      piggyBank: newBalance
    });
  };

  useEffect(() => {
    if (!memberId) {
      loadedMemberRef.current = null;
      setMemberProfile(null);
      return;
    }
    
    if (loadedMemberRef.current === memberId) return;
    
    loadedMemberRef.current = memberId;
    
    const loadProfile = async () => {
      console.log('[MemberProfile] Loading profile for:', memberId);
      
      const token = localStorage.getItem('authToken') || '';
      if (!token) return;
      
      try {
        const response = await fetch(`https://functions.poehali.dev/84bdef99-0e4b-420f-af04-60ac37c6af1c?memberId=${memberId}`, {
          method: 'GET',
          headers: {
            'X-Auth-Token': token
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[MemberProfile] Loaded profile:', data.profile);
          if (data.profile) {
            setMemberProfile(data.profile);
          }
        }
      } catch (err) {
        console.error('[MemberProfile] Error loading profile:', err);
      }
    };
    
    loadProfile();
  }, [memberId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <MemberProfileHeader />
        <MemberProfileInstruction />
        <MemberProfileContent
          member={member}
          isChild={isChild}
          isOwner={isOwner}
          memberTasks={memberTasks}
          memberProfile={memberProfile}
          toggleTask={toggleTask}
          deleteTask={deleteTask}
          handleAddDream={handleAddDream}
          handleUpdateDream={handleUpdateDream}
          handleUpdateBalance={handleUpdateBalance}
          saveProfile={saveProfile}
        />
      </div>
    </div>
  );
}