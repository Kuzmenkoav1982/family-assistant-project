import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { InviteListCard } from './family-invite/InviteListCard';
import { CreateInviteDialog } from './family-invite/CreateInviteDialog';
import { JoinFamilyDialog } from './family-invite/JoinFamilyDialog';
import { FamilySettingsCard } from './family-invite/FamilySettingsCard';
import { FamilyMembersCard } from './family-invite/FamilyMembersCard';

const INVITE_API = 'https://functions.poehali.dev/c30902b1-40c9-48c1-9d81-b0fab5788b9d';

const isValidImageUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    return (
      pathname.endsWith('.jpg') || 
      pathname.endsWith('.jpeg') || 
      pathname.endsWith('.png') || 
      pathname.endsWith('.gif') || 
      pathname.endsWith('.webp') ||
      url.includes('cdn.poehali.dev')
    );
  } catch {
    return false;
  }
};

interface Invite {
  id: string;
  code: string;
  max_uses: number;
  uses_count: number;
  days_valid: number;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  qr_code?: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  relationship?: string;
  photo_url?: string;
  avatar?: string;
}

export default function FamilyInviteManager() {
  const navigate = useNavigate();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [familyName, setFamilyName] = useState(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.family_name || 'Наша семья';
      } catch {
        return 'Наша семья';
      }
    }
    return 'Наша семья';
  });
  const [familyLogo, setFamilyLogo] = useState(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.logo_url || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [isUpdatingFamily, setIsUpdatingFamily] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const getAuthToken = () => localStorage.getItem('authToken') || '';

  const fetchInvites = async () => {
    try {
      const response = await fetch(INVITE_API, {
        headers: { 'X-Auth-Token': getAuthToken() }
      });
      const data = await response.json();
      if (data.success) {
        setInvites(data.invites || []);
      }
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  useEffect(() => {
    fetchInvites();
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
        headers: { 'X-Auth-Token': getAuthToken() }
      });
      const data = await response.json();
      if (data.members) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const createInvite = async (newInvite: { maxUses: number; daysValid: number }) => {
    setIsLoading(true);
    try {
      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'create',
          max_uses: newInvite.maxUses,
          days_valid: newInvite.daysValid
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Код приглашения создан: ${data.invite.code}`);
        fetchInvites();
        setShowCreateDialog(false);
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка создания приглашения');
    } finally {
      setIsLoading(false);
    }
  };

  const joinFamily = async (joinData: {
    inviteCode: string;
    memberName: string;
    relationship: string;
    customRelationship: string;
  }, forceLeave = false) => {
    setIsLoading(true);
    try {
      const relationship = joinData.relationship === 'Другое' 
        ? joinData.customRelationship 
        : joinData.relationship;

      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'join',
          invite_code: joinData.inviteCode.toUpperCase(),
          member_name: joinData.memberName,
          relationship: relationship,
          force_leave: forceLeave
        })
      });
      const data = await response.json();
      
      if (data.warning) {
        const confirmed = confirm(
          `⚠️ ${data.message}\n\n` +
          `Текущая семья: "${data.current_family}"\n\n` +
          `Вы уверены что хотите покинуть текущую семью и присоединиться к новой?`
        );
        
        if (confirmed) {
          await joinFamily(joinData, true);
        } else {
          setIsLoading(false);
        }
        return;
      }
      
      if (data.success) {
        alert(`✅ Вы присоединились к семье: ${data.family.name}`);
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          family_id: data.family.id,
          family_name: data.family.name,
          member_id: data.family.member_id
        }));
        window.location.reload();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка присоединения к семье');
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('✅ Код скопирован в буфер обмена!');
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/join?code=${code}`;
    navigator.clipboard.writeText(link);
    alert('✅ Ссылка скопирована в буфер обмена!');
  };

  const shareInviteLink = (code: string) => {
    const link = `${window.location.origin}/join?code=${code}`;
    const text = `👨‍👩‍👧‍👦 Присоединяйся к нашей семье!\n\n${familyName}\n\n${link}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Приглашение в ${familyName}`,
        text: text
      }).catch(() => {
        copyInviteLink(code);
      });
    } else {
      copyInviteLink(code);
    }
  };

  const shareViaMax = (code: string) => {
    const link = `${window.location.origin}/join?code=${code}`;
    const message = `👨‍👩‍👧‍👦 Присоединяйся к нашей семье!\n\n${familyName}\n\n${link}`;
    const maxUrl = `https://tamtam.chat/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
    window.open(maxUrl, '_blank');
  };

  const shareViaTelegram = (code: string) => {
    const link = `${window.location.origin}/join?code=${code}`;
    const message = `👨‍👩‍👧‍👦 Присоединяйся к нашей семье!\n\n${familyName}\n\n${link}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const deleteInvite = async (inviteId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это приглашение?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(INVITE_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'delete',
          invite_id: inviteId
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Приглашение удалено');
        fetchInvites();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка удаления приглашения');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить члена семьи "${memberName}"?\n\nЭто действие нельзя отменить.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'delete_member',
          member_id: memberId
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Член семьи удалён');
        fetchFamilyMembers();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка удаления члена семьи');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllDuplicates = async () => {
    if (!confirm('⚠️ Удалить ВСЕ дубликаты?\n\nБудут удалены все члены семьи с пометкой [ДУБЛИКАТ - УДАЛИТЬ].\n\nЭто действие нельзя отменить!')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'delete_all_duplicates'
        })
      });
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ Удалено дубликатов: ${data.deleted_count}`);
        fetchFamilyMembers();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка удаления дубликатов');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFamilySettings = async () => {
    if (familyLogo && !isValidImageUrl(familyLogo)) {
      alert('❌ Некорректный URL изображения. Убедитесь, что ссылка ведет напрямую на изображение (.jpg, .png, .gif) или загрузите файл.');
      return;
    }

    setIsUpdatingFamily(true);
    try {
      const response = await fetch('https://functions.poehali.dev/db70be67-64af-4e9d-ab90-8485ed49c99f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          action: 'update_family',
          family_name: familyName,
          logo_url: familyLogo
        })
      });
      const data = await response.json();
      
      if (data.success) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.family_name = familyName;
        userData.logo_url = familyLogo;
        localStorage.setItem('userData', JSON.stringify(userData));
        alert('✅ Настройки семьи обновлены!');
        window.location.reload();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ Ошибка обновления настроек');
    } finally {
      setIsUpdatingFamily(false);
    }
  };

  const uploadLogoFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('❌ Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Размер файла не должен превышать 5 МБ');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileBase64 = await base64Promise;

      const response = await fetch('https://functions.poehali.dev/159c1ff5-fd0b-4564-b93b-55b81348c9a0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': getAuthToken()
        },
        body: JSON.stringify({
          file: fileBase64,
          fileName: file.name,
          folder: 'family-logos'
        })
      });

      const data = await response.json();
      
      if (data.url) {
        setFamilyLogo(data.url);
        alert('✅ Логотип загружен! Не забудьте сохранить изменения.');
      } else {
        alert(`❌ ${data.error || 'Ошибка загрузки'}`);
      }
    } catch (error) {
      alert('❌ Ошибка загрузки файла');
      console.error(error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadLogoFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadLogoFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <Icon name="ArrowLeft" size={16} />
          Назад
        </Button>
      </div>

      <InviteListCard
        invites={invites}
        familyName={familyName}
        isInstructionOpen={isInstructionOpen}
        onInstructionToggle={setIsInstructionOpen}
        onCopyCode={copyInviteCode}
        onCopyLink={copyInviteLink}
        onShare={shareInviteLink}
        onShareViaTelegram={shareViaTelegram}
        onShareViaMax={shareViaMax}
        onDelete={deleteInvite}
      />

      <div className="flex gap-2">
        <CreateInviteDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          isLoading={isLoading}
          onCreate={createInvite}
        />
        <JoinFamilyDialog
          open={showJoinDialog}
          onOpenChange={setShowJoinDialog}
          isLoading={isLoading}
          onJoin={(data) => joinFamily(data)}
        />
      </div>

      <FamilySettingsCard
        familyName={familyName}
        familyLogo={familyLogo}
        isUpdating={isUpdatingFamily}
        isUploading={isUploadingLogo}
        isDragging={isDragging}
        onFamilyNameChange={setFamilyName}
        onFamilyLogoChange={setFamilyLogo}
        onUpdate={updateFamilySettings}
        onLogoUpload={handleLogoUpload}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <FamilyMembersCard
        members={members}
        onDeleteMember={deleteMember}
        onDeleteAllDuplicates={deleteAllDuplicates}
      />
    </div>
  );
}