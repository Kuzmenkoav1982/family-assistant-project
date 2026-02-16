import { useNavigate } from 'react-router-dom';
import SectionHero from '@/components/ui/section-hero';
import { FamilyDefinitions } from '@/components/family-policy/FamilyDefinitions';
import { FamilyHistory } from '@/components/family-policy/FamilyHistory';

export default function WhatIsFamily() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 lg:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <SectionHero
          title="Что такое семья"
          subtitle="Философия семьи, определения и исторический контекст"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/126eb1fc-4b71-4f1c-87fd-fa88beb6d32d.jpg"
          backPath="/state-hub"
        />
        <FamilyDefinitions />
        <FamilyHistory />
      </div>
    </div>
  );
}