import { useNavigate } from 'react-router-dom';
import { WhatIsFamilyHeader } from '@/components/family-policy/WhatIsFamilyHeader';
import { FamilyDefinitions } from '@/components/family-policy/FamilyDefinitions';
import { FamilyHistory } from '@/components/family-policy/FamilyHistory';

export default function WhatIsFamily() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 lg:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <WhatIsFamilyHeader onNavigateBack={() => navigate('/family-policy')} />
        <FamilyDefinitions />
        <FamilyHistory />
      </div>
    </div>
  );
}