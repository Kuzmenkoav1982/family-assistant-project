import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { FamilyValue } from '@/types/family.types';

interface ValuesTabContentProps {
  familyValues: FamilyValue[];
  setFamilyValues: (values: FamilyValue[]) => void;
}

export default function ValuesTabContent({
  familyValues,
  setFamilyValues,
}: ValuesTabContentProps) {
  return (
    <TabsContent value="values">
      <Card className="border-2 border-amber-200 bg-amber-50/50 mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Icon name="Heart" size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Зачем нужны ценности?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Определите принципы</strong> которые важны для вашей семьи — честность, доброта, образование.</p>
                <p><strong>Передайте детям</strong> понимание того, что действительно ценно в жизни.</p>
                <p><strong>Укрепите идентичность</strong> семьи через общие ценности и убеждения.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Icon name="Plus" className="mr-2" size={18} />
              Добавить ценность
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить семейную ценность</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Иконка (эмодзи)</label>
                <Input 
                  id="value-icon-add"
                  placeholder="\u2764\uFE0F"
                  maxLength={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Название</label>
                <Input 
                  id="value-title-add"
                  placeholder="Честность"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Описание</label>
                <Input 
                  id="value-description-add"
                  placeholder="Почему это важно для нашей семьи?"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Практики (через Enter)</label>
                <textarea
                  id="value-practices-add"
                  placeholder="Семейный совет каждое воскресенье&#10;Откровенные разговоры без осуждения"
                  className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => {
                  const icon = (document.getElementById('value-icon-add') as HTMLInputElement)?.value || '\u2764\uFE0F';
                  const title = (document.getElementById('value-title-add') as HTMLInputElement)?.value;
                  const description = (document.getElementById('value-description-add') as HTMLInputElement)?.value;
                  const practicesText = (document.getElementById('value-practices-add') as HTMLTextAreaElement)?.value;
                  
                  if (!title || !description) {
                    alert('Заполните название и описание');
                    return;
                  }
                  
                  const practices = practicesText.split('\n').filter(p => p.trim());
                  
                  const newValue: FamilyValue = {
                    id: Date.now().toString(),
                    icon,
                    title,
                    description,
                    practices
                  };
                  
                  const updated = [...familyValues, newValue];
                  setFamilyValues(updated);
                  localStorage.setItem('familyValues', JSON.stringify(updated));
                  
                  (document.getElementById('value-icon-add') as HTMLInputElement).value = '';
                  (document.getElementById('value-title-add') as HTMLInputElement).value = '';
                  (document.getElementById('value-description-add') as HTMLInputElement).value = '';
                  (document.getElementById('value-practices-add') as HTMLTextAreaElement).value = '';
                  
                  document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')?.querySelector('button[aria-label="Close"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                }}
              >
                Добавить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {familyValues.length > 0 ? familyValues.map((value, idx) => (
          <Card key={value.id} className="animate-fade-in relative group" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Icon name="Edit" size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Редактировать ценность</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Иконка</label>
                      <Input 
                        id={`value-icon-${value.id}`}
                        defaultValue={value.icon}
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Название</label>
                      <Input 
                        id={`value-title-${value.id}`}
                        defaultValue={value.title}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Описание</label>
                      <Input 
                        id={`value-description-${value.id}`}
                        defaultValue={value.description}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Практики (через Enter)</label>
                      <textarea
                        id={`value-practices-${value.id}`}
                        defaultValue={value.practices?.join('\n') || ''}
                        className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => {
                        const icon = (document.getElementById(`value-icon-${value.id}`) as HTMLInputElement)?.value || value.icon;
                        const title = (document.getElementById(`value-title-${value.id}`) as HTMLInputElement)?.value;
                        const description = (document.getElementById(`value-description-${value.id}`) as HTMLInputElement)?.value;
                        const practicesText = (document.getElementById(`value-practices-${value.id}`) as HTMLTextAreaElement)?.value;
                        
                        if (!title || !description) {
                          alert('Заполните название и описание');
                          return;
                        }
                        
                        const practices = practicesText.split('\n').filter(p => p.trim());
                        
                        const updated = familyValues.map(v => 
                          v.id === value.id 
                            ? { ...v, icon, title, description, practices } 
                            : v
                        );
                        setFamilyValues(updated);
                        localStorage.setItem('familyValues', JSON.stringify(updated));
                        
                        document.querySelector('[data-state="open"]')?.closest('[role="dialog"]')?.querySelector('button[aria-label="Close"]')?.dispatchEvent(new Event('click', { bubbles: true }));
                      }}
                    >
                      Сохранить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (confirm(`Удалить ценность "${value.title}"?`)) {
                    const updated = familyValues.filter(v => v.id !== value.id);
                    setFamilyValues(updated);
                    localStorage.setItem('familyValues', JSON.stringify(updated));
                  }
                }}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
            
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{value.icon}</span>
                  <span>{value.title}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{value.description}</p>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Как мы это практикуем:</h4>
                {value.practices && value.practices.length > 0 ? (
                  value.practices.map((practice, i) => (
                    <div key={`${value.id}-practice-${i}`} className="flex items-start gap-2 text-sm">
                      <Icon name="ArrowRight" size={14} className="text-amber-500 mt-0.5" />
                      <span>{practice}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Практики пока не описаны</p>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card key="empty-values">
            <CardContent className="p-8 text-center">
              <Icon name="Heart" size={48} className="mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Нет семейных ценностей</h3>
              <p className="text-sm text-muted-foreground">Опишите важные для вашей семьи ценности и принципы</p>
            </CardContent>
          </Card>
        )}
      </div>
    </TabsContent>
  );
}
