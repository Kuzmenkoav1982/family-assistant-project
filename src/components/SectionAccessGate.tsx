import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useSectionAccess, type SectionKey } from '@/hooks/useSectionAccess';

interface SectionAccessGateProps {
  section: SectionKey;
  children: React.ReactNode;
}

export default function SectionAccessGate({ section, children }: SectionAccessGateProps) {
  const { canAccess } = useSectionAccess();
  const navigate = useNavigate();

  if (canAccess(section)) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-white">
      <Card className="max-w-md w-full">
        <CardContent className="py-10 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
            <Icon name="Lock" size={28} className="text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Раздел закрыт</h2>
          <p className="text-sm text-gray-600">
            Администратор семьи ограничил вам доступ к этому разделу. Если он нужен — попросите открыть его в настройках прав доступа.
          </p>
          <Button onClick={() => navigate('/')}>На главную</Button>
        </CardContent>
      </Card>
    </div>
  );
}
