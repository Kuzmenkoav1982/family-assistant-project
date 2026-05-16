import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import type { TreeMember, NewTreeMember } from '@/hooks/useFamilyTree';
import { RELATION_OPTIONS, AVATAR_OPTIONS, MONTHS, calculateAge, getAgeText, isImageUrl } from './treeUtils';
import MemberMemorySection from '@/components/memory/MemberMemorySection';

export function MemberDetailDialog({
  selectedMember,
  members,
  uploadingGalleryPhoto,
  onClose,
  onAddRelative,
  onEdit,
  onDelete,
  onGalleryPhotoUpload,
  onDeletePhoto,
  onUnlinkSpouse,
}: {
  selectedMember: TreeMember;
  members: TreeMember[];
  uploadingGalleryPhoto: boolean;
  onClose: () => void;
  onAddRelative: () => void;
  onEdit: () => void;
  onDelete: (m: TreeMember) => void;
  onGalleryPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>, memberId: number) => void;
  onDeletePhoto: (memberId: number, photoId: number) => void;
  onUnlinkSpouse: () => void;
}) {
  return (
    <Dialog open={!!selectedMember} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {selectedMember.photo_url && isImageUrl(selectedMember.photo_url) ? (
              <img src={selectedMember.photo_url} alt={selectedMember.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-300" />
            ) : (
              <span className="text-3xl">{selectedMember.avatar || '👤'}</span>
            )}
            <div>
              <p className="text-lg">{selectedMember.name}</p>
              {selectedMember.relation && <p className="text-sm text-muted-foreground font-normal">{selectedMember.relation}</p>}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {(selectedMember.birth_date || selectedMember.birth_year) && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Calendar" size={16} className="text-amber-600" />
              <span>
                {(() => {
                  const birthStr = selectedMember.birth_date
                    ? new Date(selectedMember.birth_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
                    : `Год рождения: ${selectedMember.birth_year}`;
                  if (selectedMember.death_date) {
                    const deathStr = new Date(selectedMember.death_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
                    return `${birthStr} — ${deathStr}`;
                  }
                  if (selectedMember.death_year) {
                    if (selectedMember.birth_date) {
                      return `${birthStr} — ${selectedMember.death_year}`;
                    }
                    return `${selectedMember.birth_year} — ${selectedMember.death_year}`;
                  }
                  return birthStr;
                })()}
              </span>
            </div>
          )}

          {calculateAge(selectedMember) !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Clock" size={16} className="text-amber-600" />
              <span>Возраст: {getAgeText(calculateAge(selectedMember)!)}</span>
            </div>
          )}

          {selectedMember.occupation && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Briefcase" size={16} className="text-amber-600" />
              <span>{selectedMember.occupation}</span>
            </div>
          )}

          {(selectedMember.parent_id || selectedMember.parent2_id) && (
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Users" size={16} className="text-amber-600" />
              <span>
                Родители: {[
                  selectedMember.parent_id && members.find(m => m.id === selectedMember.parent_id)?.name,
                  selectedMember.parent2_id && members.find(m => m.id === selectedMember.parent2_id)?.name,
                ].filter(Boolean).join(' и ') || 'Не указаны'}
              </span>
            </div>
          )}

          {selectedMember.spouse_id && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Icon name="Heart" size={16} className="text-pink-500" />
                <span>Супруг(а): {members.find(m => m.id === selectedMember.spouse_id)?.name}</span>
              </div>
              <button
                type="button"
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
                onClick={onUnlinkSpouse}
              >
                <Icon name="HeartOff" size={14} />
              </button>
            </div>
          )}

          {selectedMember.bio && (
            <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
              {selectedMember.bio}
            </div>
          )}

          <MemberMemorySection memberId={selectedMember.id} memberName={selectedMember.name} />

          {selectedMember.photos && selectedMember.photos.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <Icon name="Images" size={14} className="text-amber-600" />
                Фотографии ({selectedMember.photos.length})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {selectedMember.photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.photo_url}
                      alt={photo.caption || ''}
                      className="w-full aspect-square object-cover rounded-lg border border-amber-200"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500/80 text-white rounded-full items-center justify-center text-xs hidden group-hover:flex"
                      onClick={(e) => { e.stopPropagation(); onDeletePhoto(selectedMember.id, photo.id); }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const children = members.filter(m => m.parent_id === selectedMember.id || m.parent2_id === selectedMember.id);
            if (children.length === 0) return null;
            return (
              <div className="flex items-start gap-2 text-sm">
                <Icon name="Users" size={16} className="text-blue-500 mt-0.5" />
                <div>
                  <span className="font-medium">Дети:</span>
                  <ul className="ml-2 mt-1 space-y-0.5">
                    {children.map(child => <li key={child.id}>&#8226; {child.name}</li>)}
                  </ul>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <Button
            size="sm"
            className="flex-1 bg-amber-600 hover:bg-amber-700 min-w-[140px]"
            onClick={onAddRelative}
          >
            <Icon name="UserPlus" className="mr-1" size={14} />
            Добавить родственника
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Icon name="Pencil" className="mr-1" size={14} />
            Редактировать
          </Button>
          <label className="cursor-pointer flex-1">
            <div className="flex items-center justify-center gap-1 px-3 py-2 rounded-md border text-sm hover:bg-amber-50 transition-colors">
              <Icon name={uploadingGalleryPhoto ? 'Loader2' : 'ImagePlus'} size={14} className={uploadingGalleryPhoto ? 'animate-spin' : ''} />
              {uploadingGalleryPhoto ? '...' : 'Фото'}
            </div>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onGalleryPhotoUpload(e, selectedMember.id)} disabled={uploadingGalleryPhoto} />
          </label>
          <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => onDelete(selectedMember)}>
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MemberFormDialog({
  open,
  showEditForm,
  members,
  selectedMember,
  addFromMemberId,
  formData,
  setFormData,
  birthDay,
  setBirthDay,
  birthMonth,
  setBirthMonth,
  deathDay,
  setDeathDay,
  deathMonth,
  setDeathMonth,
  photoPreview,
  setPhotoPreview,
  uploadingPhoto,
  saving,
  onClose,
  onPhotoUpload,
  onSubmit,
}: {
  open: boolean;
  showEditForm: boolean;
  members: TreeMember[];
  selectedMember: TreeMember | null;
  addFromMemberId: number | null;
  formData: NewTreeMember;
  setFormData: React.Dispatch<React.SetStateAction<NewTreeMember>>;
  birthDay: string;
  setBirthDay: (v: string) => void;
  birthMonth: string;
  setBirthMonth: (v: string) => void;
  deathDay: string;
  setDeathDay: (v: string) => void;
  deathMonth: string;
  setDeathMonth: (v: string) => void;
  photoPreview: string | null;
  setPhotoPreview: (v: string | null) => void;
  uploadingPhoto: boolean;
  saving: boolean;
  onClose: () => void;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{showEditForm ? 'Редактировать' : 'Добавить в древо'}</DialogTitle>
        </DialogHeader>

        {!showEditForm && addFromMemberId && (() => {
          const fromMember = members.find(m => m.id === addFromMemberId);
          return fromMember ? (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800">
              <Icon name="Link" size={14} className="text-amber-600 shrink-0" />
              <span>Добавляется как родственник: <strong>{fromMember.name}</strong></span>
            </div>
          ) : null;
        })()}

        <div className="space-y-4">
          <div>
            <Label>Имя *</Label>
            <Input
              placeholder="Иван Петрович Иванов"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {(() => {
            const fromMember = addFromMemberId ? members.find(m => m.id === addFromMemberId) : null;
            if (fromMember && !showEditForm) {
              const contextOptions: { label: string; relation: string; auto: Partial<typeof formData> }[] = [];
              const rel = fromMember.relation || '';

              contextOptions.push({ label: `Супруг(а) — ${fromMember.name}`, relation: 'Супруг', auto: { spouse_id: fromMember.id } });

              if (['Я', 'Брат', 'Сестра', 'Супруг', 'Супруга'].includes(rel)) {
                contextOptions.push({ label: `Сын — ${fromMember.name}`, relation: 'Сын', auto: { parent_id: fromMember.id } });
                contextOptions.push({ label: `Дочь — ${fromMember.name}`, relation: 'Дочь', auto: { parent_id: fromMember.id } });
                contextOptions.push({ label: `Брат / Сестра`, relation: 'Брат', auto: { parent_id: fromMember.parent_id || undefined, parent2_id: fromMember.parent2_id || undefined } });
              }

              if (['Отец', 'Мать'].includes(rel)) {
                contextOptions.push({ label: `Сын / Дочь (ребёнок)`, relation: 'Сын', auto: { parent_id: fromMember.id } });
                contextOptions.push({ label: `Брат / Сестра (${fromMember.name})`, relation: 'Брат', auto: {} });
              }

              if (['Дедушка', 'Бабушка'].includes(rel)) {
                contextOptions.push({ label: `Сын / Дочь (ребёнок)`, relation: rel === 'Дедушка' ? 'Отец' : 'Мать', auto: { parent_id: fromMember.id } });
              }

              if (['Сын', 'Дочь'].includes(rel)) {
                contextOptions.push({ label: `Брат / Сестра (${fromMember.name})`, relation: 'Сын', auto: { parent_id: fromMember.parent_id || undefined, parent2_id: fromMember.parent2_id || undefined } });
                contextOptions.push({ label: `Внук / Внучка`, relation: 'Внук', auto: { parent_id: fromMember.id } });
              }

              contextOptions.push({ label: `Отец — ${fromMember.name}`, relation: 'Отец', auto: {} });
              contextOptions.push({ label: `Мать — ${fromMember.name}`, relation: 'Мать', auto: {} });

              return (
                <div>
                  <Label>Кем приходится для {fromMember.name}</Label>
                  <div className="grid gap-2 mt-1">
                    {contextOptions.map(o => (
                      <button
                        key={o.label}
                        type="button"
                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                          formData.relation === o.relation ? 'bg-amber-100 border-amber-400 text-amber-900' : 'border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, relation: o.relation, ...o.auto }))}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }
            return (
              <div>
                <Label>Кем приходится</Label>
                <Select value={formData.relation || ''} onValueChange={v => setFormData(prev => ({ ...prev, relation: v }))}>
                  <SelectTrigger><SelectValue placeholder="Выберите родство" /></SelectTrigger>
                  <SelectContent>
                    {RELATION_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            );
          })()}

          <div className="space-y-3">
            <div>
              <Label>Дата рождения</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Д"
                  min={1}
                  max={31}
                  className="w-16"
                  value={birthDay}
                  onChange={e => setBirthDay(e.target.value)}
                />
                <Select value={birthMonth || 'none'} onValueChange={v => setBirthMonth(v === 'none' ? '' : v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Месяц" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Год"
                  className="flex-1"
                  value={formData.birth_year || ''}
                  onChange={e => setFormData(prev => ({ ...prev, birth_year: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
            </div>
            <div>
              <Label>Дата смерти</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  placeholder="Д"
                  min={1}
                  max={31}
                  className="w-16"
                  value={deathDay}
                  onChange={e => setDeathDay(e.target.value)}
                />
                <Select value={deathMonth || 'none'} onValueChange={v => setDeathMonth(v === 'none' ? '' : v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Месяц" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {MONTHS.map(m => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Если нет в живых"
                  className="flex-1"
                  value={formData.death_year || ''}
                  onChange={e => setFormData(prev => ({ ...prev, death_year: e.target.value ? parseInt(e.target.value) : undefined }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Род занятий</Label>
            <Input
              placeholder="Учитель, инженер..."
              value={formData.occupation || ''}
              onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value || undefined }))}
            />
          </div>

          {members.length > 0 && (() => {
            const hasContextLinks = !showEditForm && addFromMemberId && (formData.parent_id || formData.parent2_id || formData.spouse_id);
            if (hasContextLinks) {
              const links: string[] = [];
              if (formData.spouse_id) {
                const s = members.find(m => m.id === formData.spouse_id);
                if (s) links.push(`Супруг(а): ${s.name}`);
              }
              if (formData.parent_id) {
                const p = members.find(m => m.id === formData.parent_id);
                if (p) links.push(`Родитель: ${p.name}`);
              }
              if (formData.parent2_id) {
                const p2 = members.find(m => m.id === formData.parent2_id);
                if (p2) links.push(`Родитель: ${p2.name}`);
              }
              return links.length > 0 ? (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
                  <Icon name="Check" size={14} className="text-green-600 shrink-0" />
                  <span>Связи заполнены: {links.join(', ')}</span>
                </div>
              ) : null;
            }
            return (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Отец</Label>
                    <Select
                      value={formData.parent_id?.toString() || 'none'}
                      onValueChange={v => setFormData(prev => ({ ...prev, parent_id: v === 'none' ? undefined : parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Не указан" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Не указан</SelectItem>
                        {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Мать</Label>
                    <Select
                      value={formData.parent2_id?.toString() || 'none'}
                      onValueChange={v => setFormData(prev => ({ ...prev, parent2_id: v === 'none' ? undefined : parseInt(v) }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Не указана" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Не указана</SelectItem>
                        {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                          <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Супруг(а)</Label>
                  <Select
                    value={formData.spouse_id?.toString() || 'none'}
                    onValueChange={v => setFormData(prev => ({ ...prev, spouse_id: v === 'none' ? undefined : parseInt(v) }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Не указан(а)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Не указан(а)</SelectItem>
                      {members.filter(m => !showEditForm || m.id !== selectedMember?.id).map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            );
          })()}

          <div>
            <Label>Фото</Label>
            <div className="flex items-center gap-3 mt-1">
              {(photoPreview || formData.photo_url) ? (
                <div className="relative">
                  <img
                    src={photoPreview || formData.photo_url}
                    alt="Фото"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
                  />
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    onClick={() => { setPhotoPreview(null); setFormData(prev => ({ ...prev, photo_url: undefined })); }}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-dashed border-amber-300 flex items-center justify-center text-2xl">
                  {formData.avatar || '👤'}
                </div>
              )}
              <div className="flex-1">
                <label className="cursor-pointer">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-sm ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Icon name={uploadingPhoto ? 'Loader2' : 'Camera'} size={16} className={uploadingPhoto ? 'animate-spin text-amber-600' : 'text-amber-600'} />
                    {uploadingPhoto ? 'Загрузка...' : 'Загрузить фото'}
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onPhotoUpload} disabled={uploadingPhoto} />
                </label>
                <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WebP до 10 МБ</p>
              </div>
            </div>
          </div>

          <div>
            <Label>Иконка (если без фото)</Label>
            <div className="flex gap-2 flex-wrap mt-1">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  className={`text-2xl p-1 rounded-lg border-2 transition-all ${formData.avatar === emoji ? 'border-amber-500 bg-amber-50 scale-110' : 'border-transparent hover:border-amber-200'}`}
                  onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>О человеке</Label>
            <Textarea
              placeholder="Краткая биография, интересные факты..."
              value={formData.bio || ''}
              onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value || undefined }))}
              rows={3}
            />
          </div>

          <Button
            className="w-full bg-amber-600 hover:bg-amber-700"
            onClick={onSubmit}
            disabled={saving || uploadingPhoto}
          >
            {saving ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                Сохранение...
              </>
            ) : showEditForm ? 'Сохранить' : 'Добавить в древо'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MemberDetailDialog;