import { useContext } from 'react';
import SEOHead from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import MemoryAlbumBanner from '@/components/memory/MemoryAlbumBanner';
import { getGeneration } from './tree/treeUtils';
import { FamilyTreeCanvas } from './tree/FamilyTreeCanvas';
import { MemberDetailDialog, MemberFormDialog } from './tree/TreeDialogs';
import { useTreePageState } from './tree/useTreePageState';
import TreeToolbar from './tree/TreeToolbar';
import ClanInviteBanner from './tree/ClanInviteBanner';
import ClanPanel from './tree/ClanPanel';
import TreeEmptyState from './tree/TreeEmptyState';
import TreeLinkRequests from './tree/TreeLinkRequests';
import { FamilyMembersContext } from '@/contexts/FamilyMembersContext';

const GEN_LABELS: Record<number, string> = {
  0: 'Прадеды',
  1: 'Дедушки и бабушки',
  2: 'Родители',
  3: 'Наше поколение',
  4: 'Дети',
  5: 'Внуки',
};

export default function Tree() {
  const s = useTreePageState();
  const familyCtx = useContext(FamilyMembersContext);

  // Роль из контекста (данные API), fallback — localStorage для SSR
  const currentAccessRole = familyCtx?.currentAccessRole || (() => {
    try { return JSON.parse(localStorage.getItem('userData') || '{}').role || ''; } catch { return ''; }
  })();
  const isOwnerOrAdmin = currentAccessRole === 'admin' || currentAccessRole === 'owner'
    || currentAccessRole === 'Владелец' || currentAccessRole === 'Администратор';

  const generations = new Map<number, typeof s.members[0][]>();
  s.members.forEach(member => {
    const gen = getGeneration(member, s.members);
    if (!generations.has(gen)) generations.set(gen, []);
    generations.get(gen)!.push(member);
  });
  const sortedGenerations = Array.from(generations.entries()).sort(([a], [b]) => a - b);

  const BG = 'bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900';

  if (s.loading) {
    return (
      <SectionPageFrame
        title="Семейное древо"
        backPath="/family-hub"
        variant="light"
        backgroundClass={BG}
      >
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <Icon name="TreePine" size={48} className="text-amber-400 mx-auto mb-3 animate-pulse" />
            <p className="text-amber-700">Загрузка древа...</p>
          </div>
        </div>
      </SectionPageFrame>
    );
  }

  return (
    <>
      <SEOHead
        title="Семейное древо — родословная вашей семьи"
        description="Создайте генеалогическое древо семьи: добавляйте родственников, стройте связи между поколениями, сохраняйте историю рода."
        path="/tree"
        breadcrumbs={[{ name: 'Семья', path: '/family-hub' }, { name: 'Семейное древо', path: '/tree' }]}
      />
      <SectionPageFrame
        title="Семейное древо"
        subtitle={`${s.members.length} чел. · История вашего рода`}
        backPath="/family-hub"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/1ab17b24-58fd-4627-b0b8-a2f4e8dc88d4.jpg"
        backgroundClass={BG}
      >
      <MemoryAlbumBanner variant="tree" />

        <div className="px-4 space-y-4 max-w-4xl mx-auto">
          <TreeToolbar
            membersCount={s.members.length}
            showClanPanel={s.showClanPanel}
            onToggleClan={() => s.setShowClanPanel(!s.showClanPanel)}
            onAdd={() => { s.resetForm(); s.setShowAddForm(true); }}
          />

          {s.clanHook.invites.length > 0 && !s.showClanPanel && (
            <ClanInviteBanner
              invite={s.clanHook.invites[0]}
              onAccept={async (id) => {
                const ok = await s.clanHook.acceptInvite(id);
                if (ok) { s.toast({ title: 'Вы присоединились к роду!' }); s.fetchTree(); }
              }}
              onDecline={(id) => {
                s.clanHook.declineInvite(id);
                s.toast({ title: 'Приглашение отклонено' });
              }}
            />
          )}

          {s.showClanPanel && (
            <ClanPanel
              clan={s.clanHook.clan}
              families={s.clanHook.families}
              invites={s.clanHook.invites}
              clanName={s.clanName}
              setClanName={s.setClanName}
              inviteEmail={s.inviteEmail}
              setInviteEmail={s.setInviteEmail}
              saving={s.saving}
              onClose={() => s.setShowClanPanel(false)}
              onCreateClan={async () => {
                s.setSaving(true);
                const result = await s.clanHook.createClan(s.clanName.trim());
                s.setSaving(false);
                if (result.success) { s.toast({ title: `Род «${s.clanName}» создан!` }); s.setClanName(''); s.fetchTree(); }
                else s.toast({ title: result.error || 'Ошибка создания', variant: 'destructive' });
              }}
              onAcceptInvite={async (id) => {
                const ok = await s.clanHook.acceptInvite(id);
                if (ok) { s.toast({ title: 'Вы в роду!' }); s.fetchTree(); }
              }}
              onDeclineInvite={(id) => s.clanHook.declineInvite(id)}
              onInviteByEmail={async () => {
                s.setSaving(true);
                const result = await s.clanHook.inviteByEmail(s.inviteEmail.trim().toLowerCase());
                s.setSaving(false);
                if (result.success) { s.toast({ title: 'Приглашение отправлено!' }); s.setInviteEmail(''); }
                else s.toast({ title: result.error || 'Ошибка', variant: 'destructive' });
              }}
            />
          )}

          <TreeLinkRequests isOwnerOrAdmin={isOwnerOrAdmin} />

          {s.error && (
            <Card className="border-red-200 bg-red-50 mb-4">
              <CardContent className="py-3 text-center text-red-700 text-sm">{s.error}</CardContent>
            </Card>
          )}

          {s.members.length > 0 ? (
            <FamilyTreeCanvas
              members={s.members}
              sortedGenerations={sortedGenerations}
              genLabels={GEN_LABELS}
              onSelectMember={s.setSelectedMember}
            />
          ) : (
            <TreeEmptyState onAdd={() => { s.resetForm(); s.setShowAddForm(true); }} />
          )}

          {s.selectedMember && !s.showEditForm && (
            <MemberDetailDialog
              selectedMember={s.selectedMember}
              members={s.members}
              uploadingGalleryPhoto={s.uploadingGalleryPhoto}
              onClose={() => s.setSelectedMember(null)}
              onAddRelative={() => {
                const fromMember = s.selectedMember!;
                s.setSelectedMember(null);
                s.resetForm();
                s.setAddFromMemberId(fromMember.id);
                s.setShowAddForm(true);
              }}
              onEdit={() => s.openEditForm(s.selectedMember!)}
              onDelete={s.handleDelete}
              onGalleryPhotoUpload={s.handleGalleryPhotoUpload}
              onDeletePhoto={s.handleDeletePhoto}
              onUnlinkSpouse={() => s.handleUnlinkSpouse(s.selectedMember!.id)}
            />
          )}

          <MemberFormDialog
            open={s.showAddForm || s.showEditForm}
            showEditForm={s.showEditForm}
            members={s.members}
            selectedMember={s.selectedMember}
            addFromMemberId={s.addFromMemberId}
            formData={s.formData}
            setFormData={s.setFormData}
            birthDay={s.birthDay}
            setBirthDay={s.setBirthDay}
            birthMonth={s.birthMonth}
            setBirthMonth={s.setBirthMonth}
            deathDay={s.deathDay}
            setDeathDay={s.setDeathDay}
            deathMonth={s.deathMonth}
            setDeathMonth={s.setDeathMonth}
            photoPreview={s.photoPreview}
            setPhotoPreview={s.setPhotoPreview}
            uploadingPhoto={s.uploadingPhoto}
            saving={s.saving}
            onClose={() => { s.setShowAddForm(false); s.setShowEditForm(false); s.resetForm(); }}
            onPhotoUpload={s.handlePhotoUpload}
            onSubmit={s.showEditForm ? s.handleEdit : s.handleAdd}
          />
        </div>
      </SectionPageFrame>
    </>
  );
}