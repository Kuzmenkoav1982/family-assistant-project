import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import type { FamilyValue } from '@/types/family.types';
import { initialFamilyValues } from '@/data/mockData';

export default function Values() {
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

  useEffect(() => {
    localStorage.setItem('familyValues', JSON.stringify(familyValues));
  }, [familyValues]);

  const handleAddValue = (icon: string, title: string, description: string, practices: string[]) => {
    const newValue: FamilyValue = {
      id: Date.now().toString(),
      icon,
      title,
      description,
      practices
    };
    setFamilyValues(prev => [...prev, newValue]);
  };

  const handleDeleteValue = (id: string) => {
    if (window.confirm('Удалить эту ценность?')) {
      setFamilyValues(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50/30 to-white pb-24">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SectionHero
          title="Ценности семьи"
          subtitle="Определите и храните главные ценности вашей семьи"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/df85b066-cf22-4568-b389-dc1784223582.jpg"
          backPath="/values-hub"
        />

        <Card className="border-2 border-rose-200 bg-rose-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Icon name="HeartHandshake" size={24} className="text-white" />
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

        <div className="flex justify-end">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500" size="lg">
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
                  <Input id="value-icon-page" placeholder="❤️" maxLength={2} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Название</label>
                  <Input id="value-title-page" placeholder="Честность" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Описание</label>
                  <Input id="value-description-page" placeholder="Почему это важно для нашей семьи?" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Практики (через Enter)</label>
                  <textarea
                    id="value-practices-page"
                    placeholder={"Семейный совет каждое воскресенье\nОткровенные разговоры без осуждения"}
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    const icon = (document.getElementById('value-icon-page') as HTMLInputElement)?.value || '❤️';
                    const title = (document.getElementById('value-title-page') as HTMLInputElement)?.value;
                    const description = (document.getElementById('value-description-page') as HTMLInputElement)?.value;
                    const practicesText = (document.getElementById('value-practices-page') as HTMLTextAreaElement)?.value;
                    if (!title || !description) return;
                    const practices = practicesText.split('\n').filter(p => p.trim());
                    handleAddValue(icon, title, description, practices);
                    (document.getElementById('value-icon-page') as HTMLInputElement).value = '';
                    (document.getElementById('value-title-page') as HTMLInputElement).value = '';
                    (document.getElementById('value-description-page') as HTMLInputElement).value = '';
                    (document.getElementById('value-practices-page') as HTMLTextAreaElement).value = '';
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
            <Card
              key={value.id}
              className="animate-fade-in relative group hover:shadow-lg transition-all"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteValue(value.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                        <Icon name="ArrowRight" size={14} className="text-rose-500 mt-0.5" />
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
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="HeartHandshake" size={40} className="text-rose-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Нет семейных ценностей</h3>
                <p className="text-sm text-muted-foreground">Опишите важные для вашей семьи ценности и принципы</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}