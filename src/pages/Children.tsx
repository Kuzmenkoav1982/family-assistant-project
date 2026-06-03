import { useState, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import Footer from '@/components/Footer';
import { ParentDashboard } from '@/components/children/ParentDashboard';
import { ChildProfile as ChildProfileComponent } from '@/components/children/ChildProfile';
import ChildrenAIAdvisor from '@/components/children/page/ChildrenAIAdvisor';
import ViewModeSwitcher from '@/components/children/page/ViewModeSwitcher';
import ChildrenInstruction from '@/components/children/page/ChildrenInstruction';
import AddChildDialog from '@/components/children/page/AddChildDialog';
import EmptyChildrenState from '@/components/children/page/EmptyChildrenState';
import { useChildrenLogic } from '@/components/children/page/useChildrenLogic';

export default function Children() {
  const {
    loading,
    children,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    viewMode,
    setViewMode,
    isParent,
    addMember,
    searchParams,
    setSearchParams,
  } = useChildrenLogic();

  const [showAddChildDialog, setShowAddChildDialog] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add-child') {
      setShowAddChildDialog(true);
      const next = new URLSearchParams(searchParams);
      next.delete('action');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-amber-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
          <p className="text-gray-600">Загрузка профилей детей...</p>
        </div>
      </div>
    );
  }

  if (!children || children.length === 0) {
    return (
      <EmptyChildrenState
        open={showAddChildDialog}
        setOpen={setShowAddChildDialog}
        onAddChild={async (newChild) => {
          await addMember(newChild);
        }}
      />
    );
  }

  const updateViewMode = (mode: 'parent' | 'child') => {
    setViewMode(mode);
    if (selectedChildId) {
      setSearchParams({ childId: selectedChildId, mode });
    }
  };

  const clearActionParams = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('action');
    next.delete('tab');
    next.delete('from');
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <SEOHead
        title="Дети — профили и развитие детей"
        description="Профили детей, отслеживание развития, оценка навыков, планы развития. Всё для заботливых родителей."
        path="/children"
        breadcrumbs={[{ name: 'Семья', path: '/family-hub' }, { name: 'Дети', path: '/children' }]}
      />
      <SectionPageFrame
        title="Дети"
        subtitle="Развитие и контроль"
        backPath="/family-hub"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/933056d5-34c6-478a-a0c8-e403c7778248.jpg"
        backgroundClass="bg-gradient-to-b from-amber-50 via-amber-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
      >

          <ChildrenAIAdvisor children={children} />

          {isParent && <ViewModeSwitcher viewMode={viewMode} onChange={updateViewMode} />}

          <ChildrenInstruction onAddChild={() => setShowAddChildDialog(true)} />

          {selectedChild && (
            <>
              <div className="mb-6">
                <div className="flex gap-3 overflow-x-auto pb-4">
                  {children.map((child) => (
                    <Button
                      key={child.id}
                      variant={selectedChildId === child.id ? 'default' : 'outline'}
                      onClick={() => {
                        setSelectedChildId(child.id);
                        setSearchParams({ childId: child.id, mode: viewMode });
                      }}
                      className="whitespace-nowrap font-semibold text-base"
                    >
                      {child.name}
                    </Button>
                  ))}
                </div>
              </div>

              {viewMode === 'parent' ? (
                <ParentDashboard
                  child={selectedChild}
                  initialTab={searchParams.get('tab')}
                  initialAction={searchParams.get('action')}
                  onActionHandled={clearActionParams}
                />
              ) : (
                <ChildProfileComponent
                  child={selectedChild}
                  initialTab={searchParams.get('tab')}
                  initialAction={searchParams.get('action')}
                  onActionHandled={clearActionParams}
                />
              )}
            </>
          )}

        <AddChildDialog
          open={showAddChildDialog}
          onOpenChange={setShowAddChildDialog}
          onSubmit={async (newChild) => {
            const result = await addMember({
              name: newChild.name,
              role: newChild.role,
              age: newChild.age,
              avatar: newChild.avatar,
              avatar_type: newChild.avatarType,
              photo_url: newChild.photoUrl,
              relationship: 'Ребёнок',
              points: 0,
              level: 1,
              workload: 0,
            });
            if (result.success) {
              setShowAddChildDialog(false);
            } else {
              alert('Ошибка добавления ребёнка: ' + result.error);
            }
          }}
        />

      </SectionPageFrame>
      <Footer />
    </>
  );
}