import { useState } from 'react';
import type {
  Reminder,
  FamilyValue,
  BlogPost,
  ImportantDate,
  ChildProfile,
  DevelopmentPlan,
  ChatMessage,
  FamilyAlbum,
  FamilyNeed,
  FamilyTreeMember,
  FamilyGoal,
} from '@/types/family.types';
import {
  initialChildrenProfiles,
  initialDevelopmentPlans,
  initialImportantDates,
  initialFamilyValues,
  initialBlogPosts,
  initialChatMessages,
  initialFamilyAlbum,
  initialFamilyNeeds,
  initialFamilyTree,
  initialFamilyGoals,
} from '@/data/mockData';

export default function useFamilyDataState() {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [familyValues, setFamilyValues] = useState<FamilyValue[]>(() => {
    const saved = localStorage.getItem('familyValues');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialFamilyValues;
      }
    }
    return initialFamilyValues;
  });

  const [blogPosts] = useState<BlogPost[]>(initialBlogPosts);
  const [importantDates] = useState<ImportantDate[]>(initialImportantDates);
  const [childrenProfiles] = useState<ChildProfile[]>(initialChildrenProfiles);
  const [developmentPlans] = useState<DevelopmentPlan[]>(initialDevelopmentPlans);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [familyAlbum, setFamilyAlbum] = useState<FamilyAlbum[]>(initialFamilyAlbum);
  const [familyNeeds, setFamilyNeeds] = useState<FamilyNeed[]>(initialFamilyNeeds);
  const [familyTree, setFamilyTree] = useState<FamilyTreeMember[]>(initialFamilyTree);
  const [selectedTreeMember, setSelectedTreeMember] = useState<FamilyTreeMember | null>(null);

  const [familyGoals, setFamilyGoals] = useState<FamilyGoal[]>(() => {
    const saved = localStorage.getItem('familyGoals');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialFamilyGoals;
      }
    }
    return initialFamilyGoals;
  });

  return {
    reminders, setReminders,
    familyValues, setFamilyValues,
    blogPosts,
    importantDates,
    childrenProfiles,
    developmentPlans,
    chatMessages, setChatMessages,
    familyAlbum, setFamilyAlbum,
    familyNeeds, setFamilyNeeds,
    familyTree, setFamilyTree,
    selectedTreeMember, setSelectedTreeMember,
    familyGoals, setFamilyGoals,
  };
}