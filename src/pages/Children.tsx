import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Footer from '@/components/Footer';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { ParentDashboard } from '@/components/children/ParentDashboard';
import { ChildProfile as ChildProfileComponent } from '@/components/children/ChildProfile';
import type { FamilyMember } from '@/types/family.types';

export default function Children() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { members } = useFamilyMembers();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'parent' | 'child'>('parent');

  const children = members?.filter(m => m.role === 'Сын' || m.role === 'Дочь') || [];
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isParent = currentUser?.role === 'Родитель' || currentUser?.role === 'Отец' || currentUser?.role === 'Мать';

  useEffect(() => {
    const childId = searchParams.get('childId');
    const mode = searchParams.get('mode') as 'parent' | 'child' | null;
    
    if (childId) {
      setSelectedChildId(childId);
    } else if (children.length > 0) {
      setSelectedChildId(children[0].id);
    }
    
    if (mode) {
      setViewMode(mode);
    } else {
      setViewMode(isParent ? 'parent' : 'child');
    }
  }, [searchParams, children.length, isParent]);

  if (!children || children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Icon name="ArrowLeft" size={20} />
              Назад
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent className="space-y-6">
              <div className="text-6xl mb-4">👶</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Детские профили не найдены
              </h2>
              <p className="text-gray-600">
                Добавьте детей в раздел "Семья", чтобы начать использовать этот раздел
              </p>
              <Button onClick={() => navigate('/')} className="mt-4">
                Перейти на главную
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedChild = children.find(c => c.id === selectedChildId) || children[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>

          {isParent && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'parent' ? 'default' : 'outline'}
                onClick={() => setViewMode('parent')}
                className="gap-2"
              >
                <Icon name="BarChart3" size={18} />
                Родительский режим
              </Button>
              <Button
                variant={viewMode === 'child' ? 'default' : 'outline'}
                onClick={() => setViewMode('child')}
                className="gap-2"
              >
                <Icon name="Smile" size={18} />
                Детский режим
              </Button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChildId === child.id ? 'default' : 'outline'}
                onClick={() => setSelectedChildId(child.id)}
                className="gap-2 whitespace-nowrap"
              >
                <span className="text-2xl">{child.avatar}</span>
                {child.name}
              </Button>
            ))}
          </div>
        </div>

        {viewMode === 'parent' ? (
          <ParentDashboard child={selectedChild} />
        ) : (
          <ChildProfileComponent child={selectedChild} />
        )}
      </div>
      <Footer />
    </div>
  );
}
