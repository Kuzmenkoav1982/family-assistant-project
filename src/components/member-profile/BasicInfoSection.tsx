import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { FamilyMember, MemberProfile } from '@/types/family.types';

interface BasicInfoSectionProps {
  member: FamilyMember;
  profile: MemberProfile;
  setProfile: (p: MemberProfile) => void;
}

export function BasicInfoSection({ member, profile, setProfile }: BasicInfoSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="User" size={20} />
          Основные данные
        </CardTitle>
        <CardDescription>Физические параметры и время рождения</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-2xl">ℹ️</div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">
                Дата и время рождения
              </p>
              <p className="text-sm text-blue-800">
                Для изменения даты и времени рождения перейдите во вкладку <strong>"Профиль"</strong> (редактирование основной информации).
                Эти данные используются Домовым для астрологических прогнозов.
              </p>
            </div>
          </div>
          {member.birthDate && (
            <div className="mt-3 p-3 bg-white rounded border border-blue-200">
              <p className="text-sm">
                <strong>Текущие данные:</strong><br/>
                🌟 Дата рождения: {new Date(member.birthDate).toLocaleDateString('ru-RU')}<br/>
                {member.birthTime && `🕐 Время рождения: ${member.birthTime}`}
              </p>
            </div>
          )}
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
              onValueChange={(value) => setProfile({ ...profile, personalityType: value as MemberProfile['personalityType'] })}
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
              onValueChange={(value) => setProfile({ ...profile, energyType: value as MemberProfile['energyType'] })}
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
  );
}