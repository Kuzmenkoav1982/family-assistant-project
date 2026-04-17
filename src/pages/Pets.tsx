import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SectionHero from '@/components/ui/section-hero';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import Icon from '@/components/ui/icon';
import usePets, { type Pet, type PetSubKind } from '@/hooks/usePets';
import PetForm from '@/components/pets/PetForm';
import PetSubSection, { type FieldDef } from '@/components/pets/PetSubSection';
import PetsAI from '@/components/pets/PetsAI';

const PETS_HERO = 'https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/2bc52e5d-939f-4527-a03d-684e81ef60de.jpg';

type TabKey = 'overview' | 'ai' | PetSubKind;

interface TabDef {
  key: TabKey;
  label: string;
  icon: string;
  gradient: string;
  color: string;
}

const TABS: TabDef[] = [
  { key: 'overview', label: 'Обзор', icon: 'LayoutDashboard', gradient: 'from-violet-500 to-purple-500', color: 'text-violet-600' },
  { key: 'ai', label: 'ИИ-ветеринар', icon: 'Sparkles', gradient: 'from-purple-500 to-fuchsia-500', color: 'text-purple-600' },
  { key: 'vaccines', label: 'Прививки', icon: 'Syringe', gradient: 'from-rose-500 to-pink-500', color: 'text-rose-600' },
  { key: 'vet', label: 'Ветеринар', icon: 'Stethoscope', gradient: 'from-sky-500 to-blue-500', color: 'text-sky-600' },
  { key: 'medications', label: 'Лекарства', icon: 'Pill', gradient: 'from-emerald-500 to-teal-500', color: 'text-emerald-600' },
  { key: 'food', label: 'Питание', icon: 'Bone', gradient: 'from-amber-500 to-orange-500', color: 'text-amber-600' },
  { key: 'grooming', label: 'Груминг', icon: 'Scissors', gradient: 'from-fuchsia-500 to-pink-500', color: 'text-fuchsia-600' },
  { key: 'activities', label: 'Активность', icon: 'Activity', gradient: 'from-green-500 to-emerald-500', color: 'text-green-600' },
  { key: 'expenses', label: 'Расходы', icon: 'Wallet', gradient: 'from-yellow-500 to-amber-500', color: 'text-yellow-600' },
  { key: 'health', label: 'Здоровье', icon: 'LineChart', gradient: 'from-cyan-500 to-sky-500', color: 'text-cyan-600' },
  { key: 'items', label: 'Вещи', icon: 'Package', gradient: 'from-indigo-500 to-violet-500', color: 'text-indigo-600' },
  { key: 'responsibilities', label: 'Обязанности', icon: 'Users', gradient: 'from-orange-500 to-red-500', color: 'text-orange-600' },
  { key: 'photos', label: 'Фото', icon: 'Camera', gradient: 'from-pink-500 to-rose-500', color: 'text-pink-600' },
];

const GUIDE = [
  { num: 1, icon: 'UserPlus', title: 'Создайте профиль питомца', text: 'Добавьте кличку, породу, дату рождения и фото каждого любимца.' },
  { num: 2, icon: 'Syringe', title: 'Заполните медкарту', text: 'Внесите прививки, осмотры и контакты ветеринара — напомним о следующих процедурах.' },
  { num: 3, icon: 'Calendar', title: 'Настройте расписание', text: 'Укажите кормление, прогулки, приём лекарств. Распределите обязанности.' },
  { num: 4, icon: 'Heart', title: 'Следите за здоровьем', text: 'Записывайте вес и самочувствие — графики помогут заметить неладное вовремя.' },
];

function petAge(birth?: string): string {
  if (!birth) return '';
  const b = new Date(birth);
  const now = new Date();
  const months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (months < 12) return `${months} мес.`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
}

function speciesEmoji(s?: string): string {
  const map: Record<string, string> = {
    'Собака': '🐕', 'Кошка': '🐈', 'Птица': '🦜', 'Грызун': '🐹',
    'Рыбка': '🐠', 'Рептилия': '🦎', 'Другое': '🐾',
  };
  return map[s || ''] || '🐾';
}

export default function Pets() {
  const { pets, loading, stats, loadStats, createPet, updatePet, deletePet } = usePets();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [tab, setTab] = useState<TabKey>((searchParams.get('tab') as TabKey) || 'overview');
  const [guideOpen, setGuideOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  useEffect(() => {
    const t = searchParams.get('tab') as TabKey;
    if (t && t !== tab) setTab(t);
  }, [searchParams, tab]);

  useEffect(() => {
    if (pets.length > 0 && !selectedPetId) setSelectedPetId(pets[0].id);
  }, [pets, selectedPetId]);

  useEffect(() => {
    if (selectedPetId) loadStats(selectedPetId);
  }, [selectedPetId, loadStats]);

  const selectedPet = useMemo(() => pets.find(p => p.id === selectedPetId), [pets, selectedPetId]);

  const changeTab = (k: TabKey) => {
    setTab(k);
    if (k === 'overview') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', k);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const openCreate = () => { setEditingPet(null); setFormOpen(true); };
  const openEdit = (pet: Pet) => { setEditingPet(pet); setFormOpen(true); };

  const savePet = async (data: Partial<Pet>) => {
    if (editingPet) {
      await updatePet(editingPet.id, data);
    } else {
      await createPet(data);
    }
  };

  const removePet = async (id: string) => {
    if (!confirm('Удалить питомца? Все связанные данные будут удалены.')) return;
    await deletePet(id);
    if (selectedPetId === id) setSelectedPetId('');
  };

  const subFields: Record<PetSubKind, FieldDef[]> = {
    vaccines: [
      { key: 'vaccine_name', label: 'Название вакцины', type: 'text', required: true, placeholder: 'Nobivac DHPPi' },
      { key: 'vaccination_date', label: 'Дата прививки', type: 'date' },
      { key: 'next_date', label: 'Следующая ревакцинация', type: 'date' },
      { key: 'clinic', label: 'Клиника', type: 'text' },
      { key: 'vet_name', label: 'Ветеринар', type: 'text' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    vet: [
      { key: 'visit_date', label: 'Дата визита', type: 'date', required: true },
      { key: 'reason', label: 'Причина визита', type: 'text', required: true },
      { key: 'clinic', label: 'Клиника', type: 'text' },
      { key: 'vet_name', label: 'Ветеринар', type: 'text' },
      { key: 'diagnosis', label: 'Диагноз', type: 'textarea' },
      { key: 'recommendations', label: 'Рекомендации', type: 'textarea' },
      { key: 'cost', label: 'Стоимость, ₽', type: 'number' },
      { key: 'next_visit', label: 'Следующий визит', type: 'date' },
    ],
    medications: [
      { key: 'name', label: 'Препарат', type: 'text', required: true },
      { key: 'dosage', label: 'Дозировка', type: 'text', placeholder: '1 табл.' },
      { key: 'frequency', label: 'Частота приёма', type: 'text', placeholder: '2 раза в день' },
      { key: 'start_date', label: 'Начало курса', type: 'date' },
      { key: 'end_date', label: 'Окончание курса', type: 'date' },
      { key: 'is_active', label: 'Курс активен', type: 'bool' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    food: [
      { key: 'food_name', label: 'Название корма', type: 'text', required: true },
      { key: 'food_type', label: 'Тип', type: 'select', options: ['Сухой', 'Влажный', 'Натуральный', 'Смешанный'] },
      { key: 'brand', label: 'Бренд', type: 'text' },
      { key: 'portion', label: 'Порция', type: 'text', placeholder: '50 г' },
      { key: 'meals_per_day', label: 'Приёмов в день', type: 'number' },
      { key: 'feeding_time', label: 'Время кормления', type: 'text', placeholder: '8:00, 14:00, 20:00' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    grooming: [
      { key: 'procedure_type', label: 'Процедура', type: 'select', required: true, options: ['Стрижка', 'Купание', 'Когти', 'Уши', 'Зубы', 'Антипаразитарная обработка', 'Другое'] },
      { key: 'procedure_date', label: 'Дата', type: 'date' },
      { key: 'next_date', label: 'Следующая дата', type: 'date' },
      { key: 'salon', label: 'Салон/место', type: 'text' },
      { key: 'cost', label: 'Стоимость, ₽', type: 'number' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    activities: [
      { key: 'activity_type', label: 'Тип активности', type: 'select', required: true, options: ['Прогулка', 'Игра', 'Тренировка', 'Дрессировка', 'Поездка', 'Другое'] },
      { key: 'activity_date', label: 'Дата', type: 'date' },
      { key: 'duration_minutes', label: 'Длительность, мин', type: 'number' },
      { key: 'distance_km', label: 'Расстояние, км', type: 'number' },
      { key: 'location', label: 'Место', type: 'text' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    expenses: [
      { key: 'category', label: 'Категория', type: 'select', required: true, options: ['Корм', 'Ветеринар', 'Лекарства', 'Игрушки', 'Груминг', 'Страховка', 'Аксессуары', 'Другое'] },
      { key: 'title', label: 'Описание', type: 'text', required: true },
      { key: 'amount', label: 'Сумма, ₽', type: 'number', required: true },
      { key: 'expense_date', label: 'Дата', type: 'date' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    health: [
      { key: 'measured_at', label: 'Дата измерения', type: 'date', required: true },
      { key: 'weight', label: 'Вес, кг', type: 'number' },
      { key: 'temperature', label: 'Температура, °C', type: 'number' },
      { key: 'pulse', label: 'Пульс', type: 'number' },
      { key: 'mood', label: 'Настроение', type: 'select', options: ['Отличное', 'Хорошее', 'Нормальное', 'Вялое', 'Тревожное'] },
      { key: 'appetite', label: 'Аппетит', type: 'select', options: ['Отличный', 'Нормальный', 'Снижен', 'Отсутствует'] },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    items: [
      { key: 'item_name', label: 'Название', type: 'text', required: true },
      { key: 'category', label: 'Категория', type: 'select', options: ['Игрушки', 'Миски', 'Поводки', 'Ошейники', 'Переноски', 'Лежаки', 'Одежда', 'Другое'] },
      { key: 'quantity', label: 'Количество', type: 'number' },
      { key: 'cost', label: 'Стоимость, ₽', type: 'number' },
      { key: 'purchased_at', label: 'Дата покупки', type: 'date' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    responsibilities: [
      { key: 'member_name', label: 'Имя члена семьи', type: 'text', required: true },
      { key: 'responsibility', label: 'Обязанность', type: 'select', required: true, options: ['Кормление', 'Прогулки', 'Уборка', 'Игры', 'Груминг', 'Визиты к врачу', 'Покупки', 'Другое'] },
      { key: 'schedule', label: 'Расписание', type: 'text', placeholder: 'Ежедневно утром' },
      { key: 'notes', label: 'Заметки', type: 'textarea' },
    ],
    photos: [
      { key: 'photo_url', label: 'Фото', type: 'photo', required: true },
      { key: 'caption', label: 'Подпись', type: 'text', placeholder: 'Первая прогулка в лесу' },
      { key: 'photo_date', label: 'Дата', type: 'date' },
    ],
  };

  const subMeta: Record<PetSubKind, {
    title: string; empty: string;
    renderTitle: (i: Record<string, unknown>) => string;
    renderSubtitle?: (i: Record<string, unknown>) => string | null;
    renderBadge?: (i: Record<string, unknown>) => { text: string; color: string } | null;
  }> = {
    vaccines: {
      title: 'Вакцинация', empty: 'Прививок ещё нет. Добавьте первую запись.',
      renderTitle: i => String(i.vaccine_name || ''),
      renderSubtitle: i => [i.vaccination_date && `Сделано ${i.vaccination_date}`, i.clinic].filter(Boolean).join(' · ') || null,
      renderBadge: i => {
        if (!i.next_date) return null;
        const d = new Date(String(i.next_date));
        const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (days < 0) return { text: 'Просрочена', color: 'bg-rose-100 text-rose-700' };
        if (days <= 30) return { text: `Через ${days} дн.`, color: 'bg-amber-100 text-amber-700' };
        return { text: `до ${i.next_date}`, color: 'bg-emerald-100 text-emerald-700' };
      },
    },
    vet: {
      title: 'Визиты к ветеринару', empty: 'История осмотров пуста.',
      renderTitle: i => String(i.reason || 'Осмотр'),
      renderSubtitle: i => [i.visit_date, i.clinic, i.vet_name].filter(Boolean).join(' · ') || null,
      renderBadge: i => i.cost ? { text: `${i.cost} ₽`, color: 'bg-sky-100 text-sky-700' } : null,
    },
    medications: {
      title: 'Лекарства и витамины', empty: 'Курсов лекарств пока нет.',
      renderTitle: i => String(i.name || ''),
      renderSubtitle: i => [i.dosage, i.frequency].filter(Boolean).join(' · ') || null,
      renderBadge: i => i.is_active ? { text: 'Активен', color: 'bg-emerald-100 text-emerald-700' } : { text: 'Завершён', color: 'bg-gray-100 text-gray-600' },
    },
    food: {
      title: 'Питание', empty: 'Добавьте рацион вашего питомца.',
      renderTitle: i => String(i.food_name || ''),
      renderSubtitle: i => [i.brand, i.food_type, i.portion].filter(Boolean).join(' · ') || null,
      renderBadge: i => i.meals_per_day ? { text: `${i.meals_per_day} раз/день`, color: 'bg-amber-100 text-amber-700' } : null,
    },
    grooming: {
      title: 'Груминг и уход', empty: 'Записей о груминге нет.',
      renderTitle: i => String(i.procedure_type || ''),
      renderSubtitle: i => [i.procedure_date, i.salon].filter(Boolean).join(' · ') || null,
      renderBadge: i => i.cost ? { text: `${i.cost} ₽`, color: 'bg-fuchsia-100 text-fuchsia-700' } : null,
    },
    activities: {
      title: 'Активность', empty: 'Журнал активностей пуст.',
      renderTitle: i => String(i.activity_type || ''),
      renderSubtitle: i => [i.activity_date, i.location].filter(Boolean).join(' · ') || null,
      renderBadge: i => {
        const parts: string[] = [];
        if (i.duration_minutes) parts.push(`${i.duration_minutes} мин`);
        if (i.distance_km) parts.push(`${i.distance_km} км`);
        return parts.length ? { text: parts.join(', '), color: 'bg-green-100 text-green-700' } : null;
      },
    },
    expenses: {
      title: 'Расходы', empty: 'Пока нет записанных расходов.',
      renderTitle: i => String(i.title || ''),
      renderSubtitle: i => [i.category, i.expense_date].filter(Boolean).join(' · ') || null,
      renderBadge: i => i.amount ? { text: `${i.amount} ₽`, color: 'bg-yellow-100 text-yellow-700' } : null,
    },
    health: {
      title: 'Показатели здоровья', empty: 'Замеров здоровья ещё нет.',
      renderTitle: i => `Замер ${i.measured_at || ''}`,
      renderSubtitle: i => {
        const parts: string[] = [];
        if (i.weight) parts.push(`${i.weight} кг`);
        if (i.temperature) parts.push(`${i.temperature}°C`);
        if (i.pulse) parts.push(`пульс ${i.pulse}`);
        return parts.join(' · ') || null;
      },
      renderBadge: i => i.mood ? { text: String(i.mood), color: 'bg-cyan-100 text-cyan-700' } : null,
    },
    items: {
      title: 'Вещи и игрушки', empty: 'Добавьте вещи питомца.',
      renderTitle: i => String(i.item_name || ''),
      renderSubtitle: i => [i.category, i.purchased_at].filter(Boolean).join(' · ') || null,
      renderBadge: i => i.quantity ? { text: `x${i.quantity}`, color: 'bg-indigo-100 text-indigo-700' } : null,
    },
    responsibilities: {
      title: 'Ответственные', empty: 'Распределите обязанности по уходу.',
      renderTitle: i => `${i.member_name}`,
      renderSubtitle: i => String(i.schedule || ''),
      renderBadge: i => i.responsibility ? { text: String(i.responsibility), color: 'bg-orange-100 text-orange-700' } : null,
    },
    photos: {
      title: 'Фотоальбом', empty: 'Добавьте фото вашего любимца.',
      renderTitle: i => String(i.caption || 'Без подписи'),
      renderSubtitle: i => i.photo_date ? String(i.photo_date) : null,
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24">
      <SectionHero
        title="Питомцы"
        subtitle="Забота о домашних любимцах всей семьёй"
        imageUrl={PETS_HERO}
        backPath="/"
        rightAction={
          <Button size="sm" onClick={openCreate} className="bg-white text-violet-700 hover:bg-white/90 shadow-md font-semibold">
            <Icon name="Plus" size={16} className="mr-1" />
            Питомец
          </Button>
        }
      />

      {/* Мини-инструкция */}
      <Collapsible open={guideOpen} onOpenChange={setGuideOpen} className="mb-4">
        <Card className="overflow-hidden border-violet-200 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/30 dark:via-gray-900 dark:to-purple-950/30">
          <CollapsibleTrigger asChild>
            <button className="w-full p-3 flex items-center justify-between hover:bg-violet-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Icon name="BookOpen" size={18} className="text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">Как пользоваться разделом</h3>
                  <p className="text-xs text-muted-foreground">Быстрая инструкция за 4 шага</p>
                </div>
              </div>
              <Icon name="ChevronDown" size={18} className={`text-violet-500 transition-transform ${guideOpen ? 'rotate-180' : ''}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-3 space-y-2">
              {GUIDE.map(step => (
                <div key={step.num} className="flex gap-3 p-2.5 rounded-xl bg-white/70 dark:bg-gray-800/50 border border-violet-100">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm">
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon name={step.icon} size={13} className="text-violet-600" />
                      <h4 className="font-semibold text-xs text-gray-900 dark:text-gray-100">{step.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{step.text}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Переключатель питомцев */}
      {loading ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Загрузка...</CardContent></Card>
      ) : pets.length === 0 ? (
        <Card className="border-dashed border-2 border-violet-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-3 shadow-lg">
              <Icon name="PawPrint" size={32} className="text-white" />
            </div>
            <h3 className="font-bold text-lg mb-1">Добавьте первого питомца</h3>
            <p className="text-sm text-muted-foreground mb-4">Создайте карточку вашего любимца, чтобы начать вести заметки о его здоровье и жизни</p>
            <Button onClick={openCreate} className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
              <Icon name="Plus" size={16} className="mr-1" />
              Добавить питомца
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {pets.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPetId(p.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all ${
                  selectedPetId === p.id
                    ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent shadow-md'
                    : 'bg-white dark:bg-gray-800 border-gray-200 hover:border-violet-300'
                }`}
              >
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <span className="text-lg">{speciesEmoji(p.species)}</span>
                )}
                <span className="font-semibold text-sm">{p.name}</span>
                {p.birth_date && (
                  <span className={`text-xs ${selectedPetId === p.id ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {petAge(p.birth_date)}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={openCreate}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full border-2 border-dashed border-violet-300 text-violet-600 hover:bg-violet-50 transition-colors"
            >
              <Icon name="Plus" size={16} />
              <span className="font-semibold text-sm">Питомец</span>
            </button>
          </div>

          {/* Карточка питомца */}
          {selectedPet && (
            <Card className="mb-4 overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                {/* Кнопки действий - прижаты к правому верхнему углу */}
                <div className="flex justify-end gap-1.5 mb-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200" onClick={() => openEdit(selectedPet)}>
                    <Icon name="Pencil" size={14} />
                  </Button>
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200" onClick={() => removePet(selectedPet.id)}>
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>

                {/* Верхняя часть: аватар + имя */}
                <div className="flex items-start gap-3 mb-4 -mt-6">
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-violet-100 dark:ring-violet-900/40 bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 flex items-center justify-center">
                      {selectedPet.photo_url ? (
                        <img src={selectedPet.photo_url} alt={selectedPet.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl">{speciesEmoji(selectedPet.species)}</span>
                      )}
                    </div>
                    {selectedPet.species && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold shadow-md whitespace-nowrap">
                        {selectedPet.species}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <h2 className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent leading-tight break-words truncate">
                      {selectedPet.name}
                    </h2>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedPet.breed && (
                        <Badge className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-2.5 py-0.5 text-xs font-semibold">
                          {selectedPet.breed}
                        </Badge>
                      )}
                      {petAge(selectedPet.birth_date) && (
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs border-gray-200 text-gray-700">
                          {petAge(selectedPet.birth_date)}
                        </Badge>
                      )}
                      {selectedPet.gender && (
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs border-gray-200 text-gray-700 inline-flex items-center gap-1">
                          <span className={`text-sm leading-none ${selectedPet.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>
                            {selectedPet.gender === 'male' ? '♂' : '♀'}
                          </span>
                          <span>{selectedPet.gender === 'male' ? 'Мальчик' : 'Девочка'}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 text-center">
                    <div className="flex justify-center mb-0.5">
                      <Icon name="Syringe" size={16} className="text-rose-500" />
                    </div>
                    <div className="text-xl font-extrabold text-rose-600">{stats?.upcoming_vaccines ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">Прививки скоро</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 text-center">
                    <div className="flex justify-center mb-0.5">
                      <Icon name="Pill" size={16} className="text-emerald-500" />
                    </div>
                    <div className="text-xl font-extrabold text-emerald-600">{stats?.active_medications ?? 0}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">Курсы лекарств</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 text-center">
                    <div className="flex justify-center mb-0.5">
                      <Icon name="Wallet" size={16} className="text-amber-500" />
                    </div>
                    <div className="text-xl font-extrabold text-amber-600">{Math.round(stats?.month_expenses ?? 0)}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">₽ в месяц</div>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 text-center">
                    <div className="flex justify-center mb-0.5">
                      <Icon name="TrendingUp" size={16} className="text-violet-500" />
                    </div>
                    <div className="text-xl font-extrabold text-violet-600">{Math.round(stats?.total_expenses ?? 0)}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">₽ всего</div>
                  </div>
                </div>

                {selectedPet.allergies && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-start gap-2 border border-rose-200 dark:border-rose-900/40">
                    <Icon name="AlertTriangle" size={14} className="text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">Аллергии: </span>
                      <span className="text-xs text-rose-700 dark:text-rose-300">{selectedPet.allergies}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Вкладки функций */}
          <div className="flex flex-wrap gap-1.5 pb-2 mb-4">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => changeTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 transition-all ${
                  tab === t.key
                    ? `bg-gradient-to-r ${t.gradient} text-white border-transparent shadow-md`
                    : 'bg-white dark:bg-gray-800 border-gray-200 hover:border-violet-200'
                }`}
              >
                <Icon name={t.icon} size={14} />
                <span className="font-semibold text-xs">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Контент вкладки */}
          {tab === 'overview' ? (
            <div className="grid grid-cols-2 gap-2.5">
              {TABS.filter(t => t.key !== 'overview').map(t => (
                <Card
                  key={t.key}
                  onClick={() => changeTab(t.key)}
                  className="overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all border-gray-200"
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-sm`}>
                        <Icon name={t.icon} size={18} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {t.label}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.key === 'ai' ? 'Советы ветеринара на базе ИИ' : subMeta[t.key as PetSubKind]?.title}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tab === 'ai' ? (
            <PetsAI pet={selectedPet || null} />
          ) : selectedPetId ? (
            <PetSubSection
              kind={tab as PetSubKind}
              petId={selectedPetId}
              title={subMeta[tab as PetSubKind].title}
              emptyText={subMeta[tab as PetSubKind].empty}
              icon={TABS.find(t => t.key === tab)?.icon || 'Circle'}
              color={TABS.find(t => t.key === tab)?.color || 'text-gray-500'}
              gradient={TABS.find(t => t.key === tab)?.gradient || 'from-gray-400 to-gray-500'}
              fields={subFields[tab as PetSubKind]}
              renderTitle={subMeta[tab as PetSubKind].renderTitle}
              renderSubtitle={subMeta[tab as PetSubKind].renderSubtitle}
              renderBadge={subMeta[tab as PetSubKind].renderBadge}
              onChanged={() => loadStats(selectedPetId)}
            />
          ) : null}
        </>
      )}

      <PetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        pet={editingPet}
        onSave={savePet}
      />

      {pets.length > 0 && (
        <div className="mt-6 text-center">
          <Badge variant="secondary" className="gap-1">
            <Icon name="Info" size={12} />
            Всего питомцев: {pets.length}
          </Badge>
        </div>
      )}
    </div>
  );
}