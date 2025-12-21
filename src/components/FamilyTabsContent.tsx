import type {
  FamilyMember,
  Task,
  Tradition,
  FamilyValue,
  BlogPost,
  ImportantDate,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  CalendarEvent,
} from '@/types/family.types';
import { MembersTabContent } from '@/components/tabs/MembersTabContent';
import { TreeTabContent } from '@/components/tabs/TreeTabContent';
import { TasksTabContent } from '@/components/tabs/TasksTabContent';
import { ChatTabContent } from '@/components/tabs/ChatTabContent';
import { NeedsTabContent } from '@/components/tabs/NeedsTabContent';
import { OtherTabsContent } from '@/components/tabs/OtherTabsContent';

interface FamilyTabsContentProps {
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  createTask?: (taskData: Partial<Task>) => Promise<{success: boolean; task?: Task; error?: string}>;
  updateTask?: (taskData: Partial<Task> & {id: string}) => Promise<{success: boolean; task?: Task; error?: string}>;
  deleteTask?: (taskId: string) => Promise<{success: boolean; error?: string}>;
  traditions: Tradition[];
  familyValues: FamilyValue[];
  blogPosts: BlogPost[];
  importantDates: ImportantDate[];
  childrenProfiles: ChildProfile[];
  developmentPlans: DevelopmentPlan[];
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  familyAlbum: FamilyAlbum[];
  setFamilyAlbum: React.Dispatch<React.SetStateAction<FamilyAlbum[]>>;
  familyNeeds: FamilyNeed[];
  setFamilyNeeds: React.Dispatch<React.SetStateAction<FamilyNeed[]>>;
  familyTree: FamilyTreeMember[];
  setFamilyTree: React.Dispatch<React.SetStateAction<FamilyTreeMember[]>>;
  selectedTreeMember: FamilyTreeMember | null;
  setSelectedTreeMember: React.Dispatch<React.SetStateAction<FamilyTreeMember | null>>;
  selectedUserId: string;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  toggleTask: (taskId: string) => void | Promise<any>;
  addPoints: (assignee: string, points: number) => void;
  getWorkloadColor: (workload: number) => string;
  getMemberById: (id: string) => FamilyMember | undefined;
  getAISuggestedMeals: () => { name: string; reason: string; icon: string }[];
  exportStatsToCSV?: () => void;
  updateMember?: (memberData: Partial<FamilyMember> & { id?: string; member_id?: string }) => Promise<any>;
  deleteMember?: (memberId: string) => Promise<any>;
}

export function FamilyTabsContent({
  familyMembers,
  setFamilyMembers,
  tasks,
  setTasks,
  createTask,
  updateTask,
  deleteTask,
  traditions,
  familyValues,
  blogPosts,
  importantDates,
  childrenProfiles,
  developmentPlans,
  chatMessages,
  setChatMessages,
  familyAlbum,
  familyNeeds,
  setFamilyNeeds,
  familyTree,
  setFamilyTree,
  selectedTreeMember,
  setSelectedTreeMember,
  selectedUserId,
  newMessage,
  setNewMessage,
  toggleTask,
  addPoints,
  getWorkloadColor,
  getMemberById,
  getAISuggestedMeals,
  exportStatsToCSV,
  updateMember,
  deleteMember,
}: FamilyTabsContentProps) {
  return (
    <>
      <MembersTabContent 
        familyMembers={familyMembers}
        setFamilyMembers={setFamilyMembers}
        getWorkloadColor={getWorkloadColor}
        updateMember={updateMember}
        deleteMember={deleteMember}
        currentUserId={selectedUserId}
      />

      <TreeTabContent 
        familyTree={familyTree}
        selectedTreeMember={selectedTreeMember}
        setSelectedTreeMember={setSelectedTreeMember}
      />

      <TasksTabContent 
        tasks={tasks}
        setTasks={setTasks}
        createTask={createTask}
        updateTask={updateTask}
        deleteTask={deleteTask}
        familyMembers={familyMembers}
        toggleTask={toggleTask}
        addPoints={addPoints}
        getMemberById={getMemberById}
      />

      <ChatTabContent 
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        selectedUserId={selectedUserId}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        getMemberById={getMemberById}
      />

      <NeedsTabContent 
        familyNeeds={familyNeeds}
        setFamilyNeeds={setFamilyNeeds}
      />

      <OtherTabsContent 
        traditions={traditions}
        familyValues={familyValues}
        blogPosts={blogPosts}
        importantDates={importantDates}
        childrenProfiles={childrenProfiles}
        developmentPlans={developmentPlans}
        familyMembers={familyMembers}
        getAISuggestedMeals={getAISuggestedMeals}
        exportStatsToCSV={exportStatsToCSV}
      />
    </>
  );
}
