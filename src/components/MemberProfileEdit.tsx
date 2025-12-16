import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useFileUpload } from '@/hooks/useFileUpload';
import type { FamilyMember } from '@/types/family.types';

interface MemberProfileEditProps {
  member: FamilyMember;
  onSave: (updates: Partial<FamilyMember>) => Promise<void>;
}

export function MemberProfileEdit({ member, onSave }: MemberProfileEditProps) {
  const [saving, setSaving] = useState(false);
  const [avatarType, setAvatarType] = useState<'emoji' | 'photo'>(member.photoUrl ? 'photo' : 'emoji');
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl || '');
  const { upload, uploading: uploadingPhoto } = useFileUpload();
  const [formData, setFormData] = useState({
    name: member.name || '',
    role: member.role || '',
    age: member.age || '',
    birthDate: member.birthDate || (member as any).birth_date || '',
    birthTime: member.birthTime || (member as any).birth_time || '',
    avatar: member.avatar || '👤',
    bio: (member as any).bio || '',
    phone: (member as any).phone || '',
    email: (member as any).email || '',
    hobbies: (member.responsibilities || []).join(', '),
    favorites: member.foodPreferences?.favorites.join(', ') || '',
    dislikes: member.foodPreferences?.dislikes.join(', ') || '',
    achievements: (member.achievements || []).join(', '),
    responsibilities: (member.responsibilities || []).join(', '),
  });

  const emojiOptions = [
    '👨', '👩', '👦', '👧', '👴', '👵', '👶',
    '🧑', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👨‍🦳', '👩‍🦳',
    '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍⚕️', '👩‍⚕️',
    '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🎨', '👩‍🎨',
    '🧒', '🧓', '🙋‍♂️', '🙋‍♀️', '💁‍♂️', '💁‍♀️'
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ');
      return;
    }

    try {
      const url = await upload(file, 'avatars');
      setPhotoUrl(url);
      setAvatarType('photo');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки фото. Попробуйте ещё раз.');
    }
  };

  const handleApplyPhoto = async () => {
    if (!photoUrl) return;
    
    setSaving(true);
    try {
      await onSave({
        avatarType: 'photo',
        photoUrl: photoUrl
      });
      alert('✅ Фото применено!');
    } catch (error) {
      alert('❌ Ошибка применения фото');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates: Partial<FamilyMember> & any = {
        name: formData.name,
        role: formData.role,
        age: formData.age ? parseInt(formData.age) : undefined,
        birthDate: formData.birthDate || undefined,
        birthTime: formData.birthTime || undefined,
        avatar: formData.avatar,
        avatarType: avatarType,
        photoUrl: avatarType === 'photo' ? photoUrl : undefined,
        // Эти данные будут сохранены в profile_data на бэкенде
        foodPreferences: {
          favorites: formData.favorites.split(',').map(s => s.trim()).filter(Boolean),
          dislikes: formData.dislikes.split(',').map(s => s.trim()).filter(Boolean),
        },
        achievements: formData.achievements.split(',').map(s => s.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split(',').map(s => s.trim()).filter(Boolean),
      };

      console.log('[MemberProfileEdit] Saving updates:', updates);
      await onSave(updates);
      alert('✅ Профиль обновлён!');
    } catch (error) {
      console.error('[MemberProfileEdit] Save error:', error);
      alert('❌ Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={24} />
            Основная информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Имя *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Александр"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Роль в семье *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Отец, Мама, Сын..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Возраст</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                placeholder="25"
                min="0"
                max="120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Дата рождения 🌟</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
              />
              <p className="text-xs text-gray-500">Для астрологических прогнозов Домового</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthTime">Время рождения 🕐</Label>
              <Input
                id="birthTime"
                type="time"
                value={formData.birthTime}
                onChange={(e) => handleChange('birthTime', e.target.value)}
              />
              <p className="text-xs text-gray-500">Опционально, для точной карты Бацзы</p>
            </div>

            <div className="md:col-span-2 space-y-4">
              <Label>Аватар</Label>
              
              <div className="flex gap-3 mb-4">
                <Button
                  type="button"
                  variant={avatarType === 'emoji' ? 'default' : 'outline'}
                  onClick={() => setAvatarType('emoji')}
                  className="flex items-center gap-2"
                >
                  <Icon name="Smile" size={18} />
                  Emoji
                </Button>
                <Button
                  type="button"
                  variant={avatarType === 'photo' ? 'default' : 'outline'}
                  onClick={() => setAvatarType('photo')}
                  className="flex items-center gap-2"
                >
                  <Icon name="Camera" size={18} />
                  Фото
                </Button>
              </div>

              {avatarType === 'emoji' ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleChange('avatar', emoji)}
                        className={`text-3xl hover:scale-110 transition-transform ${
                          formData.avatar === emoji ? 'ring-2 ring-purple-500 rounded' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">Выбранный: {formData.avatar}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                    {photoUrl ? (
                      <>
                        <img 
                          src={photoUrl} 
                          alt="Preview" 
                          className="w-32 h-32 rounded-full object-cover border-4 border-purple-400 shadow-lg"
                        />
                        <div className="flex gap-2 flex-wrap justify-center">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleApplyPhoto}
                            disabled={saving}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {saving ? (
                              <>
                                <Icon name="Loader" size={16} className="mr-1 animate-spin" />
                                Сохранение...
                              </>
                            ) : (
                              <>
                                <Icon name="Check" size={16} className="mr-1" />
                                Применить фото
                              </>
                            )}
                          </Button>
                          <Label 
                            htmlFor="photo-upload"
                            className="cursor-pointer"
                          >
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploadingPhoto}
                              asChild
                            >
                              <span>
                                <Icon name="Upload" size={16} className="mr-1" />
                                Изменить
                              </span>
                            </Button>
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPhotoUrl('')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Icon name="Trash2" size={16} className="mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-32 h-32 rounded-full bg-purple-200 flex items-center justify-center">
                          <Icon name="User" size={48} className="text-purple-400" />
                        </div>
                        <Label 
                          htmlFor="photo-upload"
                          className="cursor-pointer"
                        >
                          <Button
                            type="button"
                            size="lg"
                            disabled={uploadingPhoto}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            asChild
                          >
                            <span className="flex items-center gap-2">
                              {uploadingPhoto ? (
                                <>
                                  <Icon name="Loader" className="animate-spin" size={20} />
                                  Загрузка...
                                </>
                              ) : (
                                <>
                                  <Icon name="Plus" size={20} />
                                  Добавить фото
                                </>
                              )}
                            </span>
                          </Button>
                        </Label>
                        <p className="text-xs text-gray-500">Макс. размер: 5 МБ</p>
                      </>
                    )}
                  </div>
                  <div className="hidden">
                    <Label 
                      htmlFor="photo-upload" 
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      {uploadingPhoto ? (
                        <>
                          <Icon name="Loader" size={18} className="animate-spin" />
                          Загрузка...
                        </>
                      ) : (
                        <>
                          <Icon name="Upload" size={18} />
                          {photoUrl ? 'Заменить фото' : 'Загрузить фото'}
                        </>
                      )}
                    </Label>
                    <Input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    <p className="text-xs text-gray-500 mt-2">Максимальный размер: 5 МБ. Форматы: JPG, PNG, GIF</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Utensils" size={24} />
            Предпочтения в еде
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="favorites">
              <Icon name="Heart" className="inline mr-1 text-green-500" size={16} />
              Любимые блюда (через запятую)
            </Label>
            <Textarea
              id="favorites"
              value={formData.favorites}
              onChange={(e) => handleChange('favorites', e.target.value)}
              placeholder="Пицца, Паста, Борщ"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dislikes">
              <Icon name="X" className="inline mr-1 text-red-500" size={16} />
              Не любит (через запятую)
            </Label>
            <Textarea
              id="dislikes"
              value={formData.dislikes}
              onChange={(e) => handleChange('dislikes', e.target.value)}
              placeholder="Брокколи, Грибы"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ListTodo" size={24} />
            Обязанности и достижения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="responsibilities">
              <Icon name="CheckSquare" className="inline mr-1 text-blue-500" size={16} />
              Обязанности (через запятую)
            </Label>
            <Textarea
              id="responsibilities"
              value={formData.responsibilities}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              placeholder="Убрать комнату, Выгулять собаку, Мыть посуду"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">
              <Icon name="Award" className="inline mr-1 text-yellow-500" size={16} />
              Достижения (через запятую)
            </Label>
            <Textarea
              id="achievements"
              value={formData.achievements}
              onChange={(e) => handleChange('achievements', e.target.value)}
              placeholder="Победитель олимпиады, Отличник, Научился плавать"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="submit" size="lg" disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
          {saving ? (
            <>
              <Icon name="Loader" className="mr-2 animate-spin" size={18} />
              Сохранение...
            </>
          ) : (
            <>
              <Icon name="Save" className="mr-2" size={18} />
              Сохранить изменения
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Icon name="Info" size={18} />
          Советы по заполнению:
        </h4>
        <ul className="text-sm space-y-1 ml-6">
          <li>• Указывайте реальный возраст для корректных рекомендаций ИИ</li>
          <li>• Обязанности помогут честно распределять задачи</li>
          <li>• Предпочтения в еде учитываются при планировании меню</li>
          <li>• Достижения мотивируют и поднимают самооценку</li>
        </ul>
      </div>
    </form>
  );
}