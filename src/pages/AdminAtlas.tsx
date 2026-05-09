import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import AtlasOverviewTab from '@/components/admin/atlas/AtlasOverviewTab';
import AtlasSectionsTab from '@/components/admin/atlas/AtlasSectionsTab';
import AtlasComingSoonTab from '@/components/admin/atlas/AtlasComingSoonTab';

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
              Паспорт собирается слоями. <span className="font-semibold">Шаг 1</span> уже готов —
              из бокового меню взяты все хабы и разделы. <span className="font-semibold">Шаги 4-7</span>{' '}
              (смысл, сущности, пересечения, решения) наполняются дальше: одним большим проходом по
              всем разделам, затем матрица пересечений и журнал архитектурных решений.
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
            <AtlasComingSoonTab
              step="Шаг 5"
              title="Карта сущностей платформы"
              description="Здесь будут все вещи, которыми оперирует продукт: цели, планы, наблюдения, достижения, эмоции, события, правила и т.д. Для каждой — её «дом», места создания, редактирования и витрины."
              bullets={[
                'Ровно один home-раздел для каждой сущности',
                'Список всех мест ввода и редактирования',
                'Конфликты «несколько домов» подсвечены красным',
                'Влияет на journal of decisions: правило «один дом»',
              ]}
            />
          </TabsContent>

          <TabsContent value="overlaps">
            <AtlasComingSoonTab
              step="Шаг 6"
              title="Матрица пересечений"
              description="Две тепловые карты: разделы × сущности и разделы × функции. Показывают, где разные разделы работают с одним и тем же материалом и могут конфликтовать."
              bullets={[
                'Раздел × сущность — где живут «цели», «планы», «наблюдения»',
                'Раздел × функция — кто строит рекомендации, кто планирует, кто отчитывает',
                'Топ-10 горячих пересечений с приоритетом',
                'Гипотеза «Портфолио ↔ Мастерская» проверится здесь первой',
              ]}
            />
          </TabsContent>

          <TabsContent value="decisions">
            <AtlasComingSoonTab
              step="Шаг 7"
              title="Журнал архитектурных решений"
              description="Управленческая доска: каждый найденный конфликт — отдельный кейс с рекомендацией и решением. keep / merge / split / rename / move / deprecate."
              bullets={[
                'Пара разделов и общая сущность/функция',
                'Уровень риска: low / medium / high',
                'Рекомендация и принятое решение',
                'Статус: open / decided / deferred',
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
