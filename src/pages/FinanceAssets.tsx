import { useState, useEffect, useCallback } from 'react';
import SEOHead from "@/components/SEOHead";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceAssetsInstructions } from '@/components/finance/FinanceInstructions';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { DEMO_ASSETS } from '@/data/demoFinanceData';

const API = 'https://functions.poehali.dev/ab0791d4-9fbe-4cda-a9af-cb18ecd662cd';

interface Asset {
  id: string;
  name: string;
  asset_type: string;
  purchase_date: string | null;
  purchase_price: number | null;
  current_value: number | null;
  description: string;
  location: string;
  icon: string;
  color: string;
  status: string;
}

function getHeaders() {
  return { 'Content-Type': 'application/json', 'X-Auth-Token': localStorage.getItem('authToken') || '' };
}

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const ASSET_TYPES = [
  { value: 'property', label: 'Недвижимость', icon: 'Home', color: '#3B82F6' },
  { value: 'vehicle', label: 'Транспорт', icon: 'Car', color: '#EF4444' },
  { value: 'electronics', label: 'Техника', icon: 'Smartphone', color: '#8B5CF6' },
  { value: 'furniture', label: 'Мебель', icon: 'Armchair', color: '#F59E0B' },
  { value: 'jewelry', label: 'Ювелирные изд.', icon: 'Gem', color: '#EC4899' },
  { value: 'investment', label: 'Инвестиции', icon: 'TrendingUp', color: '#22C55E' },
  { value: 'land', label: 'Земельный участок', icon: 'Trees', color: '#14B8A6' },
  { value: 'business', label: 'Бизнес', icon: 'Building2', color: '#6366F1' },
  { value: 'other', label: 'Другое', icon: 'Package', color: '#64748B' },
];

function getTypeMeta(type: string) {
  return ASSET_TYPES.find(t => t.value === type) || ASSET_TYPES[8];
}

export default function FinanceAssets() {
  const navigate = useNavigate();
  const isOwner = useIsFamilyOwner();
  const { isDemoMode } = useDemoMode();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', asset_type: 'property', purchase_date: '', purchase_price: '',
    current_value: '', description: '', location: '', icon: 'Home', color: '#3B82F6'
  });

  const loadAssets = useCallback(async () => {
    const res = await fetch(`${API}?section=assets`, { headers: getHeaders() });
    if (res.ok) {
      const data = await res.json();
      setAssets(data.assets || []);
      setTotalValue(data.total_value || 0);
    }
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      setAssets(DEMO_ASSETS as Asset[]);
      setTotalValue(DEMO_ASSETS.reduce((s, a) => s + (a.current_value || 0), 0));
      setLoading(false);
      return;
    }
    loadAssets().finally(() => setLoading(false));
  }, [isDemoMode, loadAssets]);

  const resetForm = () => {
    setForm({ name: '', asset_type: 'property', purchase_date: '', purchase_price: '', current_value: '', description: '', location: '', icon: 'Home', color: '#3B82F6' });
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Укажите название'); return; }
    setSaving(true);
    const payload: Record<string, unknown> = {
      action: showEdit ? 'update_asset' : 'add_asset',
      name: form.name, asset_type: form.asset_type,
      purchase_date: form.purchase_date || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      current_value: form.current_value ? parseFloat(form.current_value) : null,
      description: form.description, location: form.location,
      icon: form.icon, color: form.color
    };
    if (showEdit) payload.id = showEdit.id;
    const res = await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      toast.success(showEdit ? 'Сохранено' : 'Добавлено');
      setShowAdd(false); setShowEdit(null); resetForm(); loadAssets();
    } else { toast.error('Ошибка'); }
  };

  const deleteAsset = async (id: string) => {
    await fetch(API, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ action: 'delete_asset', id }) });
    toast.success('Удалено'); setShowEdit(null); loadAssets();
  };

  const openEdit = (a: Asset) => {
    setForm({
      name: a.name, asset_type: a.asset_type, purchase_date: a.purchase_date || '',
      purchase_price: a.purchase_price ? String(a.purchase_price) : '',
      current_value: a.current_value ? String(a.current_value) : '',
      description: a.description || '', location: a.location || '',
      icon: a.icon, color: a.color
    });
    setShowEdit(a);
  };

  const activeAssets = assets.filter(a => a.status === 'active');

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={32} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold mb-2">Доступ ограничен</h2>
          <p className="text-sm text-muted-foreground mb-4">Этот раздел доступен только владельцу семьи</p>
          <Button onClick={() => navigate('/finance')}>Вернуться к финансам</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600" />
      </div>
    );
  }

  return (
    <>
    <SEOHead title="Имущество семьи — недвижимость и активы" description="Учёт имущества семьи: недвижимость, автомобили, ценные вещи. Оценка стоимости и страхование." path="/finance/assets" breadcrumbs={[{ name: "Финансы", path: "/finance" }, { name: "Имущество", path: "/finance/assets" }]} />
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Имущество"
          subtitle="Недвижимость, транспорт и ценные активы"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/5f2f6405-3d6e-4875-ac6a-09560bb4d208.jpg"
          backPath="/finance"
          rightAction={
            <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => { resetForm(); setShowAdd(true); }}>
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          }
        />

        <FinanceAssetsInstructions />

        {activeAssets.length > 0 && (
          <Card className="bg-gradient-to-br from-sky-600 to-blue-700 text-white border-0">
            <CardContent className="p-4 text-center">
              <p className="text-sky-200 text-sm">Общая стоимость</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(totalValue)} ₽</p>
              <p className="text-sky-200 text-xs mt-1">{activeAssets.length} объектов</p>
            </CardContent>
          </Card>
        )}

        {assets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Home" size={48} className="mx-auto mb-3 text-sky-300" />
            <p className="font-medium text-foreground">Нет имущества</p>
            <p className="text-sm mt-1">Добавьте недвижимость, транспорт, технику и другие активы</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map(asset => {
              const meta = getTypeMeta(asset.asset_type);
              const diff = asset.purchase_price && asset.current_value
                ? asset.current_value - asset.purchase_price : null;
              return (
                <Card key={asset.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => openEdit(asset)}>
                  <CardContent className="p-0">
                    <div className="flex items-center">
                      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: (asset.color || meta.color) + '15' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: asset.color || meta.color }}>
                          <Icon name={asset.icon || meta.icon} size={18} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 px-3 py-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate">{asset.name}</span>
                          <Badge variant="outline" className="text-[10px] flex-shrink-0">{meta.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {asset.location && <span>{asset.location}</span>}
                          {asset.purchase_date && (
                            <span>с {new Date(asset.purchase_date).getFullYear()}</span>
                          )}
                        </div>
                      </div>
                      <div className="pr-3 text-right">
                        {asset.current_value != null && (
                          <p className="font-bold text-sm">{formatMoney(asset.current_value)} ₽</p>
                        )}
                        {diff != null && (
                          <p className={`text-[10px] ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {diff >= 0 ? '+' : ''}{formatMoney(diff)} ₽
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={showAdd || !!showEdit} onOpenChange={() => { setShowAdd(false); setShowEdit(null); resetForm(); }}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{showEdit ? 'Редактировать' : 'Новый актив'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Тип</label>
              <Select value={form.asset_type} onValueChange={v => {
                const m = getTypeMeta(v);
                setForm({ ...form, asset_type: v, icon: m.icon, color: m.color });
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <Icon name={t.icon} size={14} style={{ color: t.color }} /> {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Название</label>
              <Input placeholder="Квартира на Ленина 15" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Цена покупки, ₽</label>
                <Input type="number" inputMode="decimal" placeholder="5000000" value={form.purchase_price}
                  onChange={e => setForm({ ...form, purchase_price: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Текущая стоимость, ₽</label>
                <Input type="number" inputMode="decimal" placeholder="6500000" value={form.current_value}
                  onChange={e => setForm({ ...form, current_value: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Дата покупки</label>
                <Input type="date" value={form.purchase_date}
                  onChange={e => setForm({ ...form, purchase_date: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Местоположение</label>
                <Input placeholder="Москва" value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Input placeholder="Необязательно" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button onClick={save} disabled={saving} className="bg-sky-600 hover:bg-sky-700 w-full">
              {saving ? 'Сохраняю...' : showEdit ? 'Сохранить' : 'Добавить'}
            </Button>
            {showEdit && (
              <Button variant="outline" className="w-full text-red-600 hover:bg-red-50"
                onClick={() => deleteAsset(showEdit.id)}>
                <Icon name="Trash2" size={14} className="mr-1" /> Удалить
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}