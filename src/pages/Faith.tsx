import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { HERO_IMAGES, TAB_LIST, getReligionEmoji, getReligionLabel } from '@/components/faith/constants';
import { useFaithData } from '@/components/faith/useFaithData';
import OverviewTab from '@/components/faith/tabs/OverviewTab';
import HolidaysTab from '@/components/faith/tabs/HolidaysTab';
import FastingTab from '@/components/faith/tabs/FastingTab';
import PrayersTab from '@/components/faith/tabs/PrayersTab';
import SacredTextsTab from '@/components/faith/tabs/SacredTextsTab';
import SaintOfDayTab from '@/components/faith/tabs/SaintOfDayTab';
import IconOfDayTab from '@/components/faith/tabs/IconOfDayTab';
import LibraryTab from '@/components/faith/tabs/LibraryTab';
import NameDaysTab from '@/components/faith/tabs/NameDaysTab';
import TempleTab from '@/components/faith/tabs/TempleTab';

export default function Faith() {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    religion, setReligion,
    loading, saving,
    holidays, fasting, prayers,
    templeData, collapseReligion,
    saveSettings, syncToCalendar,
    addCustomEvent, deleteCustomEvent, saveTemple,
  } = useFaithData();

  const heroImage = HERO_IMAGES[religion] || HERO_IMAGES.orthodox;

  return (
    <SectionPageFrame
      title="Вера"
      subtitle={`${getReligionEmoji(religion)} ${getReligionLabel(religion)}`}
      backPath="/values-hub"
      imageUrl={heroImage}
      backgroundClass="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex overflow-x-auto h-auto bg-amber-100/80 rounded-xl p-1 gap-0.5">
          {TAB_LIST.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-[10px] py-2 px-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:shadow-sm text-amber-700 shrink-0 flex flex-col items-center gap-0.5"
            >
              <Icon name={tab.icon} size={14} />
              <span className="leading-none">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-amber-600 mb-4" />
            <p className="text-sm text-amber-600/70">Загрузка...</p>
          </div>
        ) : (
          <>
            <TabsContent value="overview">
              <OverviewTab
                religion={religion} setReligion={setReligion} onSaveSettings={saveSettings}
                holidays={holidays} fasting={fasting} saving={saving} setActiveTab={setActiveTab}
                collapseReligion={collapseReligion}
              />
            </TabsContent>
            <TabsContent value="holidays">
              <HolidaysTab holidays={holidays} religion={religion} onSync={syncToCalendar} onAddCustom={addCustomEvent} onDeleteCustom={deleteCustomEvent} />
            </TabsContent>
            <TabsContent value="fasting">
              <FastingTab fasting={fasting} religion={religion} />
            </TabsContent>
            <TabsContent value="prayers">
              <PrayersTab prayers={prayers} religion={religion} />
            </TabsContent>
            <TabsContent value="texts">
              <SacredTextsTab religion={religion} />
            </TabsContent>
            <TabsContent value="saint">
              <SaintOfDayTab religion={religion} />
            </TabsContent>
            <TabsContent value="icon">
              <IconOfDayTab religion={religion} />
            </TabsContent>
            <TabsContent value="library">
              <LibraryTab religion={religion} />
            </TabsContent>
            <TabsContent value="namedays">
              <NameDaysTab religion={religion} />
            </TabsContent>
            <TabsContent value="temple">
              <TempleTab religion={religion} templeData={templeData} onSave={saveTemple} saving={saving} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </SectionPageFrame>
  );
}
