import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { useFamilyMembersContext } from '@/contexts/FamilyMembersContext';
import { FamilyMemberPermissions, DEFAULT_PERMISSIONS } from './access-control/types';
import MemberCard from './access-control/MemberCard';

export default function AccessControlManager() {
  const { members: familyMembers, loading } = useFamilyMembersContext();
  const [membersWithPermissions, setMembersWithPermissions] = useState<FamilyMemberPermissions[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberPermissions | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null);

  useEffect(() => {
    if (familyMembers.length > 0) {
      const enriched = familyMembers.map((member: any) => {
        let accessRole = member.access_role;
        
        if (accessRole === 'parent' || accessRole === 'guardian') {
          accessRole = 'editor';
        } else if (accessRole === 'child') {
          accessRole = 'viewer';
        }
        
        if (!accessRole || !['admin', 'editor', 'viewer'].includes(accessRole)) {
          accessRole = 'viewer';
        }
        
        return {
          id: member.id,
          name: member.name,
          relationship: member.relationship || member.role || 'Член семьи',
          avatarUrl: member.photo_url || member.avatar,
          avatar: member.avatar,
          role: accessRole as 'admin' | 'editor' | 'viewer',
          permissions: member.permissions || DEFAULT_PERMISSIONS[accessRole as 'admin' | 'editor' | 'viewer']
        };
      });
      setMembersWithPermissions(enriched);
    }
  }, [familyMembers]);

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('⚠️ Ошибка авторизации. Войдите в систему заново.');
      return;
    }

    setSavingMemberId(memberId);

    const updatedMembers = membersWithPermissions.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          role: newRole,
          permissions: DEFAULT_PERMISSIONS[newRole]
        };
      }
      return member;
    });
    setMembersWithPermissions(updatedMembers);
    
    const dbRole = newRole === 'editor' ? 'parent' : newRole;
    
    try {
      const response = await fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({
          action: 'update',
          member_id: memberId,
          access_role: dbRole,
          permissions: DEFAULT_PERMISSIONS[newRole]
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Не удалось сохранить роль');
      }
      
      console.log('✅ Роль успешно сохранена');
    } catch (error: any) {
      console.error('❌ Ошибка сохранения роли:', error);
      alert(`⚠️ Не удалось сохранить роль: ${error.message || 'Неизвестная ошибка'}`);
      
      const originalMembers = familyMembers.map((member: any) => {
        let accessRole = member.access_role;
        
        if (accessRole === 'parent' || accessRole === 'guardian') {
          accessRole = 'editor';
        } else if (accessRole === 'child') {
          accessRole = 'viewer';
        }
        
        if (!accessRole || !['admin', 'editor', 'viewer'].includes(accessRole)) {
          accessRole = 'viewer';
        }
        
        return {
          id: member.id,
          name: member.name,
          relationship: member.relationship || member.role || 'Член семьи',
          avatarUrl: member.photo_url || member.avatar,
          avatar: member.avatar,
          role: accessRole as 'admin' | 'editor' | 'viewer',
          permissions: member.permissions || DEFAULT_PERMISSIONS[accessRole as 'admin' | 'editor' | 'viewer']
        };
      });
      setMembersWithPermissions(originalMembers);
    } finally {
      setSavingMemberId(null);
    }
  };

  const updateMemberPermission = async (memberId: string, permission: keyof FamilyMemberPermissions['permissions'], value: boolean) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      alert('⚠️ Ошибка авторизации. Войдите в систему заново.');
      return;
    }

    const updatedMembers = membersWithPermissions.map(member => {
      if (member.id === memberId) {
        return {
          ...member,
          permissions: {
            ...member.permissions,
            [permission]: value
          }
        };
      }
      return member;
    });
    setMembersWithPermissions(updatedMembers);
    
    const memberData = updatedMembers.find(m => m.id === memberId);
    if (!memberData) return;

    try {
      const response = await fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({
          action: 'update',
          member_id: memberId,
          permissions: memberData.permissions
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Не удалось сохранить права');
      }
      
      console.log('✅ Права успешно сохранены');
    } catch (error: any) {
      console.error('❌ Ошибка сохранения прав:', error);
      alert(`⚠️ Не удалось сохранить права: ${error.message || 'Неизвестная ошибка'}`);
      
      const originalMembers = familyMembers.map((member: any) => {
        const accessRole = (member.access_role || 'viewer') as 'admin' | 'editor' | 'viewer';
        return {
          id: member.id,
          name: member.name,
          relationship: member.relationship || member.role || 'Член семьи',
          avatarUrl: member.photo_url || member.avatar,
          avatar: member.avatar,
          role: accessRole,
          permissions: member.permissions || DEFAULT_PERMISSIONS[accessRole]
        };
      });
      setMembersWithPermissions(originalMembers);
    }
  };

  const openPermissionsDialog = (member: FamilyMemberPermissions) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setSelectedMember(null);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Icon name="Loader2" size={48} className="text-blue-500 mx-auto mb-3 animate-spin" />
        <p className="text-gray-500">Загрузка членов семьи...</p>
      </div>
    );
  }

  if (membersWithPermissions.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="Users" size={48} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">Нет членов семьи для управления</p>
        <p className="text-sm text-gray-400">Пригласите родственников, чтобы настроить их права доступа</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {membersWithPermissions.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            savingMemberId={savingMemberId}
            isDialogOpen={isDialogOpen}
            selectedMemberId={selectedMember?.id ?? null}
            onOpenDialog={openPermissionsDialog}
            onDialogChange={handleDialogChange}
            onRoleChange={updateMemberRole}
            onPermissionChange={updateMemberPermission}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Рекомендации по настройке прав:</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Администратор</strong> — для родителей и доверенных членов семьи</li>
              <li>• <strong>Редактор</strong> — для взрослых членов семьи, которые активно участвуют</li>
              <li>• <strong>Наблюдатель</strong> — для детей и гостей, которым нужен только просмотр</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
