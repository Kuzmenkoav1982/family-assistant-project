import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { getReligionEmoji, getReligionLabel } from '../constants';
import type { TempleData } from '../types';

interface Props {
  religion: string;
  templeData: TempleData;
  onSave: (data: TempleData) => void;
  saving: boolean;
}

export default function TempleTab({ religion, templeData, onSave, saving }: Props) {
  const [name, setName] = useState(templeData.name);
  const [address, setAddress] = useState(templeData.address);
  const [schedule, setSchedule] = useState(templeData.schedule);
  const [contacts, setContacts] = useState(templeData.contacts);
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    setName(templeData.name);
    setAddress(templeData.address);
    setSchedule(templeData.schedule);
    setContacts(templeData.contacts);
    setEdited(false);
  }, [templeData]);

  const handleChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setter(e.target.value);
    setEdited(true);
  };

  const templeLabel = (() => {
    switch (religion) {
      case 'orthodox': return { name: 'Храм / Церковь', icon: 'Church', placeholder: 'Храм Христа Спасителя' };
      case 'catholic': return { name: 'Костёл / Собор', icon: 'Church', placeholder: 'Собор Непорочного Зачатия' };
      case 'protestant': return { name: 'Церковь / Кирха', icon: 'Church', placeholder: 'Евангелическая церковь' };
      case 'islam': return { name: 'Мечеть', icon: 'Building', placeholder: 'Московская Соборная мечеть' };
      case 'judaism': return { name: 'Синагога', icon: 'Building', placeholder: 'Московская хоральная синагога' };
      case 'buddhism': return { name: 'Дацан / Храм', icon: 'Building', placeholder: 'Иволгинский дацан' };
      case 'hinduism': return { name: 'Мандир / Храм', icon: 'Building', placeholder: 'Храм Кришны' };
      default: return { name: 'Место поклонения', icon: 'Building', placeholder: '' };
    }
  })();

  const hasData = name || address || schedule || contacts;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-amber-900 flex items-center gap-2">
        <Icon name={templeLabel.icon} size={18} className="text-amber-600" />
        {templeLabel.name} — {getReligionEmoji(religion)} {getReligionLabel(religion)}
      </h3>

      {!hasData && !edited && (
        <Card className="border-dashed border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Icon name={templeLabel.icon} size={32} className="text-amber-500" />
            </div>
            <p className="text-sm font-medium text-amber-900 mb-1">Добавьте информацию о вашем {templeLabel.name.toLowerCase().split(' ')[0]}е</p>
            <p className="text-xs text-amber-600/70">Сохраните адрес, расписание служб и контакты вашего места поклонения</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200/60">
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name={templeLabel.icon} size={12} />
              Название
            </label>
            <Input placeholder={templeLabel.placeholder} value={name} onChange={handleChange(setName)} className="border-amber-200 focus:ring-amber-400" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name="MapPin" size={12} />
              Адрес
            </label>
            <Input placeholder="Москва, ул. Волхонка, 15" value={address} onChange={handleChange(setAddress)} className="border-amber-200 focus:ring-amber-400" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name="Clock" size={12} />
              Расписание служб
            </label>
            <Textarea
              placeholder={"Пн-Пт: 8:00, 18:00\nСб: 9:00, 17:00\nВс: 7:00, 10:00, 17:00"}
              value={schedule}
              onChange={handleChange(setSchedule)}
              className="border-amber-200 focus:ring-amber-400"
              rows={4}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-amber-800 flex items-center gap-1.5">
              <Icon name="Phone" size={12} />
              Контакты
            </label>
            <Input placeholder="+7 (495) 123-45-67, www.temple.ru" value={contacts} onChange={handleChange(setContacts)} className="border-amber-200 focus:ring-amber-400" />
          </div>

          {edited && (
            <Button onClick={() => onSave({ name, address, schedule, contacts })} disabled={saving} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : <Icon name="Save" size={16} className="mr-2" />}
              Сохранить
            </Button>
          )}
        </CardContent>
      </Card>

      {(name || address) && (
        <Card className="border-amber-100 bg-gradient-to-br from-amber-50/60 to-orange-50/40">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shrink-0">
                <Icon name={templeLabel.icon} size={24} className="text-amber-700" />
              </div>
              <div className="flex-1 min-w-0">
                {name && <p className="font-semibold text-amber-900">{name}</p>}
                {address && (
                  <p className="text-xs text-amber-700 mt-1 flex items-start gap-1">
                    <Icon name="MapPin" size={12} className="shrink-0 mt-0.5" />
                    {address}
                  </p>
                )}
                {schedule && (
                  <div className="mt-2 p-2 rounded-lg bg-white/60 border border-amber-100">
                    <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Icon name="Clock" size={10} />
                      Расписание
                    </p>
                    <p className="text-xs text-amber-800 whitespace-pre-line">{schedule}</p>
                  </div>
                )}
                {contacts && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <Icon name="Phone" size={11} className="shrink-0" />
                    {contacts}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
