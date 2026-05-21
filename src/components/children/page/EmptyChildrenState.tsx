import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionPageFrame from '@/components/ui/SectionPageFrame';
import Footer from '@/components/Footer';
import AddChildDialog from './AddChildDialog';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAddChild: (payload: { name: string; role: string; age?: number | string; avatar?: string; avatarType?: string; photoUrl?: string }) => Promise<void>;
}

export default function EmptyChildrenState({ open, setOpen, onAddChild }: Props) {
  return (
    <>
      <SectionPageFrame
        title="Дети"
        subtitle="Развитие и контроль"
        imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/c284ef36-f2eb-45cb-95cc-7e8f735dbd0d.jpg"
        backPath="/family-hub"
        backgroundClass="bg-gradient-to-b from-amber-50 via-amber-50/30 to-white dark:from-gray-950 dark:to-gray-900"
      >
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardContent className="space-y-6">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-2xl font-bold text-gray-900">Детские профили не найдены</h2>
            <p className="text-gray-600">Добавьте ребёнка, чтобы начать использовать этот раздел</p>
            <Button onClick={() => setOpen(true)} className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Icon name="Baby" className="mr-2" size={18} />
              Добавить ребёнка
            </Button>
            <AddChildDialog
              open={open}
              onOpenChange={setOpen}
              variant="compact"
              onSubmit={async (newChild) => {
                await onAddChild(newChild);
                setOpen(false);
              }}
            />
          </CardContent>
        </Card>
      </SectionPageFrame>
      <Footer />
    </>
  );
}