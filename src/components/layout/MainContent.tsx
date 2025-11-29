import { Card } from '@/components/ui/card';
import { FamilyTabsContent } from '@/components/FamilyTabsContent';
import { FamilyMembersGrid } from '@/components/FamilyMembersGrid';
import { ChildEducation } from '@/components/ChildEducation';
import type { FamilyMember, Task } from '@/types/family.types';

interface MainContentProps {
  activeSection: string;
  familyMembers: FamilyMember[];
  tasks: Task[];
  educationChild: FamilyMember | null;
  currentUserId: string;
  getSectionTitle: (sectionId: string) => string;
  onEducationChildSelect: (child: FamilyMember | null) => void;
  updateMember: any;
  deleteMember: any;
  createTask: any;
  updateTask: any;
  deleteTask: any;
  toggleTask: (taskId: string) => Promise<void>;
}

export default function MainContent({
  activeSection,
  familyMembers,
  tasks,
  educationChild,
  currentUserId,
  getSectionTitle,
  onEducationChildSelect,
  updateMember,
  deleteMember,
  createTask,
  updateTask,
  deleteTask,
  toggleTask
}: MainContentProps) {
  if (educationChild) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <ChildEducation
          child={educationChild}
          onComplete={() => onEducationChildSelect(null)}
        />
      </div>
    );
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'tasks':
      case 'family':
      case 'children':
      case 'chat':
      case 'values':
      case 'traditions':
      case 'rules':
      case 'blog':
      case 'album':
      case 'tree':
        return (
          <FamilyTabsContent
            activeTab={activeSection}
            familyMembers={familyMembers}
            tasks={tasks}
            currentUserId={currentUserId}
            updateMember={updateMember}
            deleteMember={deleteMember}
            createTask={createTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            toggleTask={toggleTask}
            onEducationStart={onEducationChildSelect}
          />
        );
      
      case 'about':
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">О проекте</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Наша семья</strong> — это комплексное решение для управления семейной жизнью.
              </p>
              <p>
                Наша миссия: сохранение семейных ценностей, повышение вовлеченности в семейную жизнь, 
                бережная передача семейных традиций и истории семьи.
              </p>
              <div className="mt-6">
                <h3 className="font-bold mb-2">Основные возможности:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Управление задачами и календарем</li>
                  <li>Отслеживание настроения членов семьи</li>
                  <li>Семейные традиции и ценности</li>
                  <li>Развитие детей с ИИ-рекомендациями</li>
                  <li>Семейный чат и альбом</li>
                  <li>Генеалогическое древо</li>
                </ul>
              </div>
            </div>
          </Card>
        );
      
      default:
        return (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">{getSectionTitle(activeSection)}</h2>
            <p className="text-gray-600">Раздел в разработке</p>
          </Card>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {getSectionTitle(activeSection)}
        </h1>
      </div>

      <div className="mb-6">
        <FamilyMembersGrid
          members={familyMembers}
          currentUserId={currentUserId}
        />
      </div>

      {renderSectionContent()}
    </div>
  );
}