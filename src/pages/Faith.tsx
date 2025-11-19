import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface ReligiousEvent {
  id: string;
  name: string;
  date: string;
  description: string;
  type: 'holiday' | 'fast' | 'service' | 'custom';
  addedToCalendar: boolean;
}

interface Temple {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  serviceSchedule: string;
}

interface Donation {
  id: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'monthly' | 'yearly';
  templeId: string;
  templeName: string;
  nextDate: string;
  active: boolean;
}

const RELIGIONS = [
  { value: 'orthodox', label: 'Православие', icon: '☦️' },
  { value: 'islam', label: 'Ислам', icon: '☪️' },
  { value: 'buddhism', label: 'Буддизм', icon: '☸️' },
  { value: 'judaism', label: 'Иудаизм', icon: '✡️' },
  { value: 'catholicism', label: 'Католицизм', icon: '✝️' },
  { value: 'protestantism', label: 'Протестантизм', icon: '✝️' },
  { value: 'hinduism', label: 'Индуизм', icon: '🕉️' },
  { value: 'other', label: 'Другое', icon: '🙏' }
];

const MOCK_EVENTS: ReligiousEvent[] = [
  {
    id: '1',
    name: 'Рождество Христово',
    date: '2025-01-07',
    description: 'Один из главных христианских праздников',
    type: 'holiday',
    addedToCalendar: false
  },
  {
    id: '2',
    name: 'Крещение Господне',
    date: '2025-01-19',
    description: 'Праздник Крещения Иисуса Христа',
    type: 'holiday',
    addedToCalendar: false
  },
  {
    id: '3',
    name: 'Великий пост',
    date: '2025-03-03',
    description: 'Начало Великого поста перед Пасхой',
    type: 'fast',
    addedToCalendar: false
  },
  {
    id: '4',
    name: 'Пасха',
    date: '2025-04-20',
    description: 'Воскресение Христово - главный христианский праздник',
    type: 'holiday',
    addedToCalendar: false
  }
];

export default function Faith() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem('faithModuleEnabled') === 'true';
  });
  const [selectedReligion, setSelectedReligion] = useState<string>(() => {
    return localStorage.getItem('selectedReligion') || '';
  });
  const [events, setEvents] = useState<ReligiousEvent[]>(MOCK_EVENTS);
  const [myTemple, setMyTemple] = useState<Temple | null>(() => {
    const stored = localStorage.getItem('myTemple');
    return stored ? JSON.parse(stored) : null;
  });
  const [donations, setDonations] = useState<Donation[]>(() => {
    const stored = localStorage.getItem('faithDonations');
    return stored ? JSON.parse(stored) : [];
  });
  const [showTempleDialog, setShowTempleDialog] = useState(false);
  const [showDonationDialog, setShowDonationDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const [templeForm, setTempleForm] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    serviceSchedule: ''
  });

  const [donationForm, setDonationForm] = useState({
    amount: '',
    frequency: 'monthly' as const,
    templeId: '',
    templeName: ''
  });

  const [customEventForm, setCustomEventForm] = useState({
    name: '',
    date: '',
    description: '',
    type: 'custom' as const
  });

  useEffect(() => {
    localStorage.setItem('faithModuleEnabled', isEnabled.toString());
  }, [isEnabled]);

  useEffect(() => {
    if (selectedReligion) {
      localStorage.setItem('selectedReligion', selectedReligion);
    }
  }, [selectedReligion]);

  useEffect(() => {
    if (myTemple) {
      localStorage.setItem('myTemple', JSON.stringify(myTemple));
    }
  }, [myTemple]);

  useEffect(() => {
    localStorage.setItem('faithDonations', JSON.stringify(donations));
  }, [donations]);

  const handleToggleModule = (enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled) {
      toast({
        title: 'Раздел "Вера" активирован',
        description: 'Выберите религию для получения напоминаний о важных событиях'
      });
    } else {
      toast({
        title: 'Раздел "Вера" деактивирован',
        description: 'Вы больше не будете получать уведомления о религиозных событиях'
      });
    }
  };

  const handleAddToCalendar = (eventId: string) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, addedToCalendar: !e.addedToCalendar } : e
    ));
    const event = events.find(e => e.id === eventId);
    if (event && !event.addedToCalendar) {
      toast({
        title: 'Добавлено в календарь',
        description: `${event.name} добавлено в семейный календарь`
      });
    }
  };

  const handleSaveTemple = () => {
    if (!templeForm.name || !templeForm.address) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и адрес храма',
        variant: 'destructive'
      });
      return;
    }

    const newTemple: Temple = {
      id: Date.now().toString(),
      name: templeForm.name,
      address: templeForm.address,
      phone: templeForm.phone,
      website: templeForm.website,
      serviceSchedule: templeForm.serviceSchedule
    };

    setMyTemple(newTemple);
    setShowTempleDialog(false);
    setTempleForm({ name: '', address: '', phone: '', website: '', serviceSchedule: '' });
    
    toast({
      title: 'Храм добавлен',
      description: `${newTemple.name} сохранён в вашем профиле`
    });
  };

  const handleAddDonation = () => {
    if (!donationForm.amount || !donationForm.templeName) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    const nextDate = new Date();
    if (donationForm.frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (donationForm.frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (donationForm.frequency === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const newDonation: Donation = {
      id: Date.now().toString(),
      amount: parseFloat(donationForm.amount),
      frequency: donationForm.frequency,
      templeId: myTemple?.id || '',
      templeName: donationForm.templeName,
      nextDate: nextDate.toISOString().split('T')[0],
      active: true
    };

    setDonations([...donations, newDonation]);
    setShowDonationDialog(false);
    setDonationForm({ amount: '', frequency: 'monthly', templeId: '', templeName: '' });
    
    toast({
      title: 'Пожертвование настроено',
      description: `Напоминание о пожертвовании ${newDonation.amount} ₽ создано`
    });
  };

  const handleToggleDonation = (id: string) => {
    setDonations(donations.map(d => 
      d.id === id ? { ...d, active: !d.active } : d
    ));
  };

  const handleDeleteDonation = (id: string) => {
    setDonations(donations.filter(d => d.id !== id));
    toast({
      title: 'Пожертвование удалено',
      description: 'Периодическое напоминание отключено'
    });
  };

  const handleAddCustomEvent = () => {
    if (!customEventForm.name || !customEventForm.date) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и дату события',
        variant: 'destructive'
      });
      return;
    }

    const newEvent: ReligiousEvent = {
      id: Date.now().toString(),
      name: customEventForm.name,
      date: customEventForm.date,
      description: customEventForm.description,
      type: 'custom',
      addedToCalendar: false
    };

    setEvents([...events, newEvent]);
    setShowEventDialog(false);
    setCustomEventForm({ name: '', date: '', description: '', type: 'custom' });
    
    toast({
      title: 'Событие добавлено',
      description: `${newEvent.name} добавлено в список событий`
    });
  };

  const selectedReligionData = RELIGIONS.find(r => r.value === selectedReligion);

  const getEventTypeLabel = (type: string) => {
    const types = {
      holiday: { label: 'Праздник', color: 'bg-green-100 text-green-800' },
      fast: { label: 'Пост', color: 'bg-purple-100 text-purple-800' },
      service: { label: 'Служба', color: 'bg-blue-100 text-blue-800' },
      custom: { label: 'Личное', color: 'bg-gray-100 text-gray-800' }
    };
    return types[type as keyof typeof types] || types.custom;
  };

  const getFrequencyLabel = (freq: string) => {
    const labels = {
      once: 'Однократно',
      weekly: 'Еженедельно',
      monthly: 'Ежемесячно',
      yearly: 'Ежегодно'
    };
    return labels[freq as keyof typeof labels] || freq;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {isEnabled ? 'Модуль активен' : 'Модуль отключён'}
            </span>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggleModule}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Icon name="Church" size={32} />
              Вера
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Следите за религиозными событиями, храмами и традициями вашей семьи
            </p>
          </CardContent>
        </Card>

        {!isEnabled ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <Icon name="Church" size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">Раздел "Вера" отключён</h3>
              <p className="text-gray-600 mb-4">
                Активируйте модуль, чтобы получать напоминания о религиозных событиях
              </p>
              <Button onClick={() => handleToggleModule(true)}>
                Активировать модуль
              </Button>
            </CardContent>
          </Card>
        ) : !selectedReligion ? (
          <Card>
            <CardHeader>
              <CardTitle>Выберите религию</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Выберите религию, чтобы получать уведомления о важных событиях и праздниках
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {RELIGIONS.map((religion) => (
                  <Card
                    key={religion.value}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedReligion(religion.value)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-2">{religion.icon}</div>
                      <div className="font-medium">{religion.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{selectedReligionData?.icon}</span>
                    {selectedReligionData?.label}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReligion('')}
                  >
                    Изменить
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <Tabs defaultValue="events" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="events">События</TabsTrigger>
                <TabsTrigger value="temple">Мой храм</TabsTrigger>
                <TabsTrigger value="donations">Пожертвования</TabsTrigger>
              </TabsList>

              <TabsContent value="events" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Религиозные события</h3>
                  <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Добавить событие
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Добавить событие</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Название события</Label>
                          <Input
                            value={customEventForm.name}
                            onChange={(e) => setCustomEventForm({...customEventForm, name: e.target.value})}
                            placeholder="Например, День ангела"
                          />
                        </div>
                        <div>
                          <Label>Дата</Label>
                          <Input
                            type="date"
                            value={customEventForm.date}
                            onChange={(e) => setCustomEventForm({...customEventForm, date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Описание</Label>
                          <Input
                            value={customEventForm.description}
                            onChange={(e) => setCustomEventForm({...customEventForm, description: e.target.value})}
                            placeholder="Краткое описание"
                          />
                        </div>
                        <Button onClick={handleAddCustomEvent} className="w-full">
                          Добавить
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((event) => {
                      const typeInfo = getEventTypeLabel(event.type);
                      const eventDate = new Date(event.date);
                      const today = new Date();
                      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      const isPast = daysUntil < 0;

                      return (
                        <Card key={event.id} className={isPast ? 'opacity-50' : ''}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold">{event.name}</h4>
                                  <Badge className={typeInfo.color}>
                                    {typeInfo.label}
                                  </Badge>
                                  {daysUntil >= 0 && daysUntil <= 7 && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                      Скоро
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                                <p className="text-sm text-gray-500">
                                  {eventDate.toLocaleDateString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                  {!isPast && daysUntil >= 0 && (
                                    <span className="ml-2">
                                      ({daysUntil === 0 ? 'Сегодня' : `Через ${daysUntil} ${daysUntil === 1 ? 'день' : 'дней'}`})
                                    </span>
                                  )}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant={event.addedToCalendar ? 'default' : 'outline'}
                                onClick={() => handleAddToCalendar(event.id)}
                                disabled={isPast}
                              >
                                <Icon 
                                  name={event.addedToCalendar ? 'Check' : 'Calendar'} 
                                  size={16} 
                                  className="mr-2" 
                                />
                                {event.addedToCalendar ? 'В календаре' : 'В календарь'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </TabsContent>

              <TabsContent value="temple" className="space-y-4">
                {!myTemple ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="py-12 text-center">
                      <Icon name="Church" size={64} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold mb-2">Добавьте свой храм</h3>
                      <p className="text-gray-600 mb-4">
                        Сохраните информацию о храме, который посещаете
                      </p>
                      <Dialog open={showTempleDialog} onOpenChange={setShowTempleDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <Icon name="Plus" size={16} className="mr-2" />
                            Добавить храм
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Добавить храм</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Название храма *</Label>
                              <Input
                                value={templeForm.name}
                                onChange={(e) => setTempleForm({...templeForm, name: e.target.value})}
                                placeholder="Например, Храм Христа Спасителя"
                              />
                            </div>
                            <div>
                              <Label>Адрес *</Label>
                              <Input
                                value={templeForm.address}
                                onChange={(e) => setTempleForm({...templeForm, address: e.target.value})}
                                placeholder="Улица, город"
                              />
                            </div>
                            <div>
                              <Label>Телефон</Label>
                              <Input
                                value={templeForm.phone}
                                onChange={(e) => setTempleForm({...templeForm, phone: e.target.value})}
                                placeholder="+7 (xxx) xxx-xx-xx"
                              />
                            </div>
                            <div>
                              <Label>Сайт</Label>
                              <Input
                                value={templeForm.website}
                                onChange={(e) => setTempleForm({...templeForm, website: e.target.value})}
                                placeholder="https://..."
                              />
                            </div>
                            <div>
                              <Label>Расписание служб</Label>
                              <Input
                                value={templeForm.serviceSchedule}
                                onChange={(e) => setTempleForm({...templeForm, serviceSchedule: e.target.value})}
                                placeholder="Например, Вс 9:00, 11:00"
                              />
                            </div>
                            <Button onClick={handleSaveTemple} className="w-full">
                              Сохранить
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Icon name="Church" size={24} />
                            {myTemple.name}
                          </CardTitle>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMyTemple(null);
                            localStorage.removeItem('myTemple');
                          }}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Icon name="MapPin" size={16} className="mt-1 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Адрес</p>
                          <p className="font-medium">{myTemple.address}</p>
                        </div>
                      </div>
                      {myTemple.phone && (
                        <div className="flex items-start gap-2">
                          <Icon name="Phone" size={16} className="mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Телефон</p>
                            <p className="font-medium">{myTemple.phone}</p>
                          </div>
                        </div>
                      )}
                      {myTemple.website && (
                        <div className="flex items-start gap-2">
                          <Icon name="Globe" size={16} className="mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Сайт</p>
                            <a 
                              href={myTemple.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {myTemple.website}
                            </a>
                          </div>
                        </div>
                      )}
                      {myTemple.serviceSchedule && (
                        <div className="flex items-start gap-2">
                          <Icon name="Clock" size={16} className="mt-1 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Расписание служб</p>
                            <p className="font-medium">{myTemple.serviceSchedule}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="donations" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Периодические пожертвования</h3>
                  <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Настроить пожертвование
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Настроить пожертвование</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Храм</Label>
                          <Input
                            value={donationForm.templeName}
                            onChange={(e) => setDonationForm({...donationForm, templeName: e.target.value})}
                            placeholder={myTemple?.name || "Название храма"}
                          />
                        </div>
                        <div>
                          <Label>Сумма (₽)</Label>
                          <Input
                            type="number"
                            value={donationForm.amount}
                            onChange={(e) => setDonationForm({...donationForm, amount: e.target.value})}
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <Label>Периодичность</Label>
                          <Select
                            value={donationForm.frequency}
                            onValueChange={(value: any) => setDonationForm({...donationForm, frequency: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="once">Однократно</SelectItem>
                              <SelectItem value="weekly">Еженедельно</SelectItem>
                              <SelectItem value="monthly">Ежемесячно</SelectItem>
                              <SelectItem value="yearly">Ежегодно</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddDonation} className="w-full">
                          Создать напоминание
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {donations.length === 0 ? (
                  <Card className="border-2 border-dashed">
                    <CardContent className="py-12 text-center">
                      <Icon name="Heart" size={64} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold mb-2">Нет настроенных пожертвований</h3>
                      <p className="text-gray-600">
                        Настройте периодические напоминания о пожертвованиях
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {donations.map((donation) => (
                      <Card key={donation.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Switch
                                checked={donation.active}
                                onCheckedChange={() => handleToggleDonation(donation.id)}
                              />
                              <div>
                                <h4 className="font-semibold">{donation.templeName}</h4>
                                <p className="text-sm text-gray-600">
                                  {donation.amount} ₽ • {getFrequencyLabel(donation.frequency)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Следующее: {new Date(donation.nextDate).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDonation(donation.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}
