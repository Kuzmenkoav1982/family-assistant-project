import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

export default function RulesTabContent() {
  return (
    <TabsContent value="rules">
      <Card key="rules-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Scale" />
            Правила семьи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground mb-4">
              Семейные правила помогают создать атмосферу взаимоуважения и понимания. Здесь вы можете описать договоренности, которые важны для вашей семьи.
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
              <Icon name="Scale" size={48} className="mx-auto mb-4 text-purple-500" />
              <h3 className="text-lg font-semibold mb-2">Правила пока не добавлены</h3>
              <p className="text-sm text-muted-foreground">Создайте список важных для вашей семьи правил и договоренностей</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
