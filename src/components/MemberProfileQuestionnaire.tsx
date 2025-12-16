import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { FamilyMember, MemberProfile, LoveLanguage } from '@/types/family.types';

interface MemberProfileQuestionnaireProps {
  member: FamilyMember;
  onSave: (profile: MemberProfile) => Promise<void>;
}

const LOVE_LANGUAGES = [
  { id: 'words_of_affirmation', label: 'Слова поддержки', icon: 'MessageCircle' },
  { id: 'quality_time', label: 'Время вместе', icon: 'Clock' },
  { id: 'receiving_gifts', label: 'Подарки', icon: 'Gift' },
  { id: 'acts_of_service', label: 'Помощь делом', icon: 'Hand' },
  { id: 'physical_touch', label: 'Прикосновения', icon: 'Heart' }
];

export function MemberProfileQuestionnaire({ member, onSave }: MemberProfileQuestionnaireProps) {
  const [profile, setProfile] = useState<MemberProfile>(member.profile || {});
  const [saving, setSaving] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [newBadHabit, setNewBadHabit] = useState('');
  const [newHobby, setNewHobby] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newBoundary, setNewBoundary] = useState('');
  const [newStressRelief, setNewStressRelief] = useState('');
  const [newFavoriteThing, setNewFavoriteThing] = useState('');
  const [newDislikedThing, setNewDislikedThing] = useState('');

  const addToArray = (field: keyof MemberProfile, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const currentArray = (profile[field] as string[]) || [];
    setProfile({ ...profile, [field]: [...currentArray, value.trim()] });
    setter('');
  };

  const removeFromArray = (field: keyof MemberProfile, index: number) => {
    const currentArray = (profile[field] as string[]) || [];
    setProfile({ ...profile, [field]: currentArray.filter((_, i) => i !== index) });
  };

  const toggleLoveLanguage = (language: LoveLanguage) => {
    const current = profile.loveLanguages || [];
    const updated = current.includes(language)
      ? current.filter(l => l !== language)
      : [...current, language];
    setProfile({ ...profile, loveLanguages: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('[MemberProfileQuestionnaire] Saving profile:', profile);
      await onSave(profile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Основные данные */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={20} />
            Основные данные
          </CardTitle>
          <CardDescription>Физические параметры и время рождения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Дата рождения 🌟</Label>
              <Input
                type="date"
                value={member.birthDate || ''}
                onChange={(e) => {
                  // Обновляем дату рождения напрямую в member
                  const token = localStorage.getItem('authToken');
                  if (token) {
                    fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': token
                      },
                      body: JSON.stringify({
                        id: member.id,
                        birthDate: e.target.value
                      })
                    }).catch(err => console.error('Error updating birthDate:', err));
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Используется для астрологических прогнозов</p>
            </div>
            <div>
              <Label>Время рождения 🕐</Label>
              <Input
                type="time"
                value={member.birthTime || ''}
                onChange={(e) => {
                  // Обновляем время рождения напрямую в member
                  const token = localStorage.getItem('authToken');
                  if (token) {
                    fetch('https://functions.poehali.dev/39a1ae0b-c445-4408-80a0-ce02f5a25ce5', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': token
                      },
                      body: JSON.stringify({
                        id: member.id,
                        birthTime: e.target.value
                      })
                    }).catch(err => console.error('Error updating birthTime:', err));
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Опционально, для точной карты Бацзы</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Рост (см)</Label>
              <Input
                type="number"
                placeholder="170"
                value={profile.height || ''}
                onChange={(e) => setProfile({ ...profile, height: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div>
              <Label>Вес (кг)</Label>
              <Input
                type="number"
                placeholder="70"
                value={profile.weight || ''}
                onChange={(e) => setProfile({ ...profile, weight: parseInt(e.target.value) || undefined })}
              />
            </div>
            <div>
              <Label>Тип личности</Label>
              <Select
                value={profile.personalityType || ''}
                onValueChange={(value) => setProfile({ ...profile, personalityType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="интроверт">Интроверт</SelectItem>
                  <SelectItem value="экстраверт">Экстраверт</SelectItem>
                  <SelectItem value="амбиверт">Амбиверт</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Энергетика</Label>
              <Select
                value={profile.energyType || ''}
                onValueChange={(value) => setProfile({ ...profile, energyType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="жаворонок">Жаворонок (утро)</SelectItem>
                  <SelectItem value="сова">Сова (вечер)</SelectItem>
                  <SelectItem value="голубь">Голубь (день)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Образ жизни</Label>
              <Input
                placeholder="Активный / Спокойный / Смешанный"
                value={profile.lifestyle || ''}
                onChange={(e) => setProfile({ ...profile, lifestyle: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Привычки и хобби */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Star" size={20} />
            Привычки и интересы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Хорошие привычки</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: утренняя зарядка"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('habits', newHabit, setNewHabit)}
              />
              <Button size="sm" onClick={() => addToArray('habits', newHabit, setNewHabit)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.habits || []).map((habit, i) => (
                <Badge key={i} variant="outline" className="bg-green-50">
                  {habit}
                  <button onClick={() => removeFromArray('habits', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Вредные привычки</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: поздно ложиться спать"
                value={newBadHabit}
                onChange={(e) => setNewBadHabit(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('badHabits', newBadHabit, setNewBadHabit)}
              />
              <Button size="sm" onClick={() => addToArray('badHabits', newBadHabit, setNewBadHabit)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.badHabits || []).map((habit, i) => (
                <Badge key={i} variant="outline" className="bg-red-50">
                  {habit}
                  <button onClick={() => removeFromArray('badHabits', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Хобби</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: чтение книг"
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('hobbies', newHobby, setNewHobby)}
              />
              <Button size="sm" onClick={() => addToArray('hobbies', newHobby, setNewHobby)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.hobbies || []).map((hobby, i) => (
                <Badge key={i} variant="outline" className="bg-blue-50">
                  {hobby}
                  <button onClick={() => removeFromArray('hobbies', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Языки любви */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Heart" size={20} />
            Языки любви
          </CardTitle>
          <CardDescription>Как человек чувствует заботу и любовь</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LOVE_LANGUAGES.map((lang) => (
              <Button
                key={lang.id}
                variant={(profile.loveLanguages || []).includes(lang.id as LoveLanguage) ? 'default' : 'outline'}
                className="justify-start h-auto py-3"
                onClick={() => toggleLoveLanguage(lang.id as LoveLanguage)}
              >
                <Icon name={lang.icon as any} size={18} className="mr-2" />
                {lang.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Триггеры и границы */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} />
            Триггеры и границы
          </CardTitle>
          <CardDescription>Что выводит из себя и какие границы важно не пересекать</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Триггеры (что раздражает)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: громкие звуки утром"
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('triggers', newTrigger, setNewTrigger)}
              />
              <Button size="sm" onClick={() => addToArray('triggers', newTrigger, setNewTrigger)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.triggers || []).map((trigger, i) => (
                <Badge key={i} variant="outline" className="bg-orange-50">
                  {trigger}
                  <button onClick={() => removeFromArray('triggers', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Границы (красные линии)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: не трогать личные вещи"
                value={newBoundary}
                onChange={(e) => setNewBoundary(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('boundaries', newBoundary, setNewBoundary)}
              />
              <Button size="sm" onClick={() => addToArray('boundaries', newBoundary, setNewBoundary)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.boundaries || []).map((boundary, i) => (
                <Badge key={i} variant="outline" className="bg-red-50">
                  {boundary}
                  <button onClick={() => removeFromArray('boundaries', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Что любит / не любит */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="ThumbsUp" size={20} />
            Предпочтения
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Что любит</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: сладкое, прогулки"
                value={newFavoriteThing}
                onChange={(e) => setNewFavoriteThing(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('favoriteThings', newFavoriteThing, setNewFavoriteThing)}
              />
              <Button size="sm" onClick={() => addToArray('favoriteThings', newFavoriteThing, setNewFavoriteThing)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.favoriteThings || []).map((thing, i) => (
                <Badge key={i} variant="outline" className="bg-green-50">
                  {thing}
                  <button onClick={() => removeFromArray('favoriteThings', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Что не любит</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: острое, толпы людей"
                value={newDislikedThing}
                onChange={(e) => setNewDislikedThing(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('dislikedThings', newDislikedThing, setNewDislikedThing)}
              />
              <Button size="sm" onClick={() => addToArray('dislikedThings', newDislikedThing, setNewDislikedThing)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.dislikedThings || []).map((thing, i) => (
                <Badge key={i} variant="outline" className="bg-red-50">
                  {thing}
                  <button onClick={() => removeFromArray('dislikedThings', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Способы снятия стресса</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Например: музыка, спорт"
                value={newStressRelief}
                onChange={(e) => setNewStressRelief(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addToArray('stressRelief', newStressRelief, setNewStressRelief)}
              />
              <Button size="sm" onClick={() => addToArray('stressRelief', newStressRelief, setNewStressRelief)}>
                <Icon name="Plus" size={16} />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(profile.stressRelief || []).map((method, i) => (
                <Badge key={i} variant="outline" className="bg-purple-50">
                  {method}
                  <button onClick={() => removeFromArray('stressRelief', i)} className="ml-2">×</button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Стиль общения */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="MessageSquare" size={20} />
            Стиль общения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Опишите, как человек предпочитает общаться: прямо или деликатно, спокойно или эмоционально, подробно или кратко..."
            value={profile.communicationStyle || ''}
            onChange={(e) => setProfile({ ...profile, communicationStyle: e.target.value })}
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Дополнительная информация
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Любая другая важная информация о человеке, которая поможет семье лучше понимать друг друга..."
            value={profile.additionalInfo || ''}
            onChange={(e) => setProfile({ ...profile, additionalInfo: e.target.value })}
            rows={5}
          />
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        size="lg" 
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        disabled={saving}
      >
        {saving ? (
          <>
            <Icon name="Loader" size={20} className="mr-2 animate-spin" />
            Сохранение...
          </>
        ) : (
          <>
            <Icon name="Save" size={20} className="mr-2" />
            Сохранить анкету
          </>
        )}
      </Button>
    </div>
  );
}