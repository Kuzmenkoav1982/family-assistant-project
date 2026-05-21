import SEOHead from "@/components/SEOHead";
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { FamilyDefinitions } from '@/components/family-policy/FamilyDefinitions';
import { FamilyHistory } from '@/components/family-policy/FamilyHistory';

export default function WhatIsFamily() {
  return (
    <>
    <SEOHead title="Что такое семья — определение и виды семей" description="Что такое семья в современном обществе: определение, виды семей, функции семьи, семейные ценности по законодательству РФ." path="/what-is-family" />
    <SectionPageFrame
      title="Что такое семья"
      subtitle="Философия семьи, определения и исторический контекст"
      backPath="/state-hub"
      imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/d77bd8eb-9221-4be3-b8ff-f125767fc2c2.jpg"
      width="wide"
      backgroundClass="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900"
    >
      <FamilyDefinitions />
      <FamilyHistory />
    </SectionPageFrame>
    </>
  );
}
