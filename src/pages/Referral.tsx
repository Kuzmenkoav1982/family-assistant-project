import SectionPageFrame from '@/components/ui/SectionPageFrame';
import { useAuth } from '@/lib/auth-context';
import ReferralWidget from '@/components/dashboard/ReferralWidget';

export default function Referral() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || '1';

  return (
    <SectionPageFrame
      title="Реферальная программа"
      backPath="/"
      variant="light"
      width="narrow"
    >
      <ReferralWidget userId={String(userId)} />
    </SectionPageFrame>
  );
}
