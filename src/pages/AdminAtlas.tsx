import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import AtlasOverviewTab from '@/components/admin/atlas/AtlasOverviewTab';
import AtlasSectionsTab from '@/components/admin/atlas/AtlasSectionsTab';
import AtlasEntitiesTab from '@/components/admin/atlas/AtlasEntitiesTab';
import AtlasOverlapsTab from '@/components/admin/atlas/AtlasOverlapsTab';
import AtlasDecisionsTab from '@/components/admin/atlas/AtlasDecisionsTab';

export default function AdminAtlas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-white pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Шапка */}
        <div>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <Icon name="ArrowLeft" size={12} />
            Админка
          </Link>
          <div className="flex items-center gap-3">
            <div className="inline-flex w-10 h-10 rounded-xl bg-violet-100 items-center justify-center">
              <Icon name="Atom" size={20} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Паспорт платформы</h1>
              <p className="text-sm text-muted-foreground">
                Архитектурная карта «Нашей Семьи»: хабы, разделы, сущности, связи и решения
              </p>
            </div>
          </div>
        </div>

        {/* Вводная карточка-методичка */}
        <Card className="border-violet-200 bg-violet-50/40">
          <CardContent className="p-4 text-sm space-y-2">
            <p className="font-semibold flex items-center gap-2">
              <Icon name="Info" size={14} className="text-violet-600" />
              Что это и как работает
            </p>
            <p className="text-muted-foreground leading-relaxed text-xs">
              Паспорт v1 готов: <span className="font-semibold">14 хабов</span>,{' '}
              <span className="font-semibold">77 разделов</span> с роль-классификацией,{' '}
              <span className="font-semibold">25 сущностей</span> с указанием «дома», матрица
              пересечений и журнал решений с открытыми и закрытыми кейсами. Формулировки —
              чёрновик, готов к правкам владельца.
            </p>
          </CardContent>
        </Card>

        {/* Вкладки */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="overview" className="text-xs gap-1.5">
              <Icon name="LayoutDashboard" size={13} />
              Обзор
            </TabsTrigger>
            <TabsTrigger value="sections" className="text-xs gap-1.5">
              <Icon name="Layers" size={13} />
              Разделы
            </TabsTrigger>
            <TabsTrigger value="entities" className="text-xs gap-1.5">
              <Icon name="Boxes" size={13} />
              Сущности
            </TabsTrigger>
            <TabsTrigger value="overlaps" className="text-xs gap-1.5">
              <Icon name="Network" size={13} />
              Пересечения
            </TabsTrigger>
            <TabsTrigger value="decisions" className="text-xs gap-1.5">
              <Icon name="Gavel" size={13} />
              Решения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AtlasOverviewTab />
          </TabsContent>

          <TabsContent value="sections">
            <AtlasSectionsTab />
          </TabsContent>

          <TabsContent value="entities">
            <AtlasEntitiesTab />
          </TabsContent>

          <TabsContent value="overlaps">
            <AtlasOverlapsTab />
          </TabsContent>

          <TabsContent value="decisions">
            <AtlasDecisionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}