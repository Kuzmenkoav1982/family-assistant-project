import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { sections, Section } from '@/components/instructions/sectionsData';
import SectionDetailView from '@/components/instructions/SectionDetailView';
import SectionsList from '@/components/instructions/SectionsList';

export default function Instructions() {
  const [searchParams] = useSearchParams();
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  useEffect(() => {
    const sectionId = searchParams.get('section');
    if (sectionId) {
      const section = sections.find(s => s.id === sectionId);
      if (section) {
        setSelectedSection(section);
      }
    }
  }, [searchParams]);

  if (selectedSection) {
    return (
      <SectionDetailView 
        section={selectedSection}
        onBack={() => setSelectedSection(null)}
      />
    );
  }

  return (
    <SectionsList 
      sections={sections}
      onSelectSection={setSelectedSection}
    />
  );
}