import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEOHead from "@/components/SEOHead";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { AIAssistant } from '@/components/leisure/AIAssistant';
import { PlaceSearch } from '@/components/leisure/PlaceSearch';
import { LeisureMap } from '@/components/leisure/LeisureMap';
import { LeisureCalendar } from '@/components/leisure/LeisureCalendar';
import { LeisureStats } from '@/components/leisure/LeisureStats';
import { RouteGenerator } from '@/components/leisure/RouteGenerator';
import SectionHero from '@/components/ui/section-hero';
import useLeisure from '@/hooks/useLeisure';
import ActivityGrid from '@/components/leisure/ActivityGrid';
import LeisureDialogs from '@/components/leisure/LeisureDialogs';
import { TABS_CONFIG, VIEW_MODES } from '@/data/leisureTypes';

export default function Leisure() {
  const l = useLeisure();
  const counts = l.getTabCounts();
  const [searchParams, setSearchParams] = useSearchParams();

  // D.1: deep-link из портфолио — ?action=add-activity открывает диалог добавления.
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add-activity' || action === 'add') {
      l.setIsAddDialogOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <>
    <SEOHead title="Досуг — развлечения и отдых для семьи" description="Идеи для семейного досуга: парки, кино, музеи, мероприятия. Планируйте совместный отдых и создавайте воспоминания." path="/leisure" />
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Досуг"
          subtitle="Места и активности для всей семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/2c0380fb-216f-44aa-b638-31181b895672.jpg"
          backPath="/leisure-hub"
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-wrap sm:flex-1">
            <RouteGenerator activities={l.allActivities} />
            <AIAssistant onAddPlace={l.handleAddFromAI} />
            <PlaceSearch onSelectPlace={l.handleAddFromSearch} />
          </div>
          <Button onClick={() => l.setIsAddDialogOpen(true)} className="gap-2 flex-shrink-0">
            <Icon name="Plus" size={20} />
            <span>Добавить</span>
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {VIEW_MODES.map(mode => (
            <Button
              key={mode.value}
              variant={l.viewMode === mode.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => l.setViewMode(mode.value as typeof l.viewMode)}
              className="whitespace-nowrap"
            >
              <Icon name={mode.icon} size={16} className="sm:mr-1" />
              <span className="hidden sm:inline">{mode.label}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS_CONFIG.map((tab) => (
            <button
              key={tab.value}
              onClick={() => l.setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
                l.activeTab === tab.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5">
                {counts[tab.value as keyof typeof counts] || 0}
              </Badge>
            </button>
          ))}
        </div>

        {l.getAllTags().length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center">Теги:</span>
            <Badge
              variant={l.selectedTagFilter === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => l.setSelectedTagFilter(null)}
            >
              Все
            </Badge>
            {l.getAllTags().map(tag => (
              <Badge
                key={tag}
                variant={l.selectedTagFilter === tag ? 'default' : 'outline'}
                className="cursor-pointer gap-1"
                onClick={() => l.setSelectedTagFilter(tag === l.selectedTagFilter ? null : tag)}
              >
                <Icon name="Tag" size={10} />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {l.loading ? (
          <div className="flex justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-gray-400" />
          </div>
        ) : l.viewMode === 'stats' ? (
          <LeisureStats activities={l.allActivities} />
        ) : l.viewMode === 'calendar' ? (
          <LeisureCalendar
            activities={l.allActivities}
            onDateChange={l.handleCalendarDateChange}
            onDateClick={l.handleCalendarDateClick}
          />
        ) : l.viewMode === 'map' ? (
          <div className="h-[400px] sm:h-[500px] lg:h-[600px] rounded-lg overflow-hidden shadow-lg">
            <LeisureMap
              places={l.activities
                .filter(a => a.latitude && a.longitude)
                .map(a => ({
                  name: a.title,
                  coordinates: { lat: a.latitude!, lon: a.longitude! }
                }))}
              onPlaceClick={(place) => {
                const activity = l.activities.find(a => a.title === place.name);
                if (activity) {
                  l.setEditingActivity(activity);
                  l.setIsEditDialogOpen(true);
                }
              }}
            />
          </div>
        ) : l.activities.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="MapPin" size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-4">
              {l.activeTab === 'all' ? 'Активностей пока нет' : 'Нет активностей в этой категории'}
            </p>
            <div className="flex gap-2 justify-center">
              <AIAssistant onAddPlace={l.handleAddFromAI} />
              <PlaceSearch onSelectPlace={l.handleAddFromSearch} />
            </div>
          </div>
        ) : (
          <ActivityGrid
            activities={l.activities}
            selectedTagFilter={l.selectedTagFilter}
            formatDate={l.formatDate}
            formatPrice={l.formatPrice}
            onEdit={(activity) => {
              l.setEditingActivity(activity);
              l.setTagInput('');
              l.setIsEditDialogOpen(true);
            }}
            onDelete={l.handleDeleteActivity}
            onShare={l.handleGenerateShareLink}
            onRevokeShare={l.handleRevokeShareLink}
          />
        )}
      </div>

      <LeisureDialogs
        isAddDialogOpen={l.isAddDialogOpen}
        setIsAddDialogOpen={l.setIsAddDialogOpen}
        newActivity={l.newActivity}
        setNewActivity={l.setNewActivity}
        tagInput={l.tagInput}
        setTagInput={l.setTagInput}
        handleCreateActivity={l.handleCreateActivity}
        isEditDialogOpen={l.isEditDialogOpen}
        setIsEditDialogOpen={l.setIsEditDialogOpen}
        editingActivity={l.editingActivity}
        setEditingActivity={l.setEditingActivity}
        handleUpdateActivity={l.handleUpdateActivity}
      />
    </div>
    </>
  );
}