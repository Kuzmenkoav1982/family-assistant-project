import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';
import type { FamilyEvent } from '@/types/events';

const AI_IDEAS_URL = func2url['event-ai-ideas'];

interface ThemeSectionProps {
  event: FamilyEvent;
  onUpdate: () => void;
}

export default function ThemeSection({ event, onUpdate }: ThemeSectionProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState(event.theme || '');
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState('');

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';
      const authToken = localStorage.getItem('authToken');

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        },
        body: JSON.stringify({ theme })
      });

      if (response.ok) {
        toast({ title: 'Сохранено', description: 'Тематика обновлена' });
        setEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('[ThemeSection] Save error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить изменения',
        variant: 'destructive'
      });
    }
  };

  const generateThemeIdeas = async () => {
    setGeneratingIdeas(true);
    try {
      const userId = localStorage.getItem('userData')
        ? JSON.parse(localStorage.getItem('userData')!).member_id
        : '1';

      const response = await fetch(AI_IDEAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        },
        body: JSON.stringify({
          eventType: event.eventType,
          age: event.memberId ? undefined : 30,
          budget: event.budget,
          theme: theme || undefined,
          requestType: 'theme'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.ideas);
        toast({ title: 'Готово!', description: 'ИИ предложил идеи тематики' });
      } else {
        throw new Error('Failed to generate ideas');
      }
    } catch (error) {
      console.error('[ThemeSection] AI error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать идеи',
        variant: 'destructive'
      });
    } finally {
      setGeneratingIdeas(false);
    }
  };

  if (!editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Palette" className="text-purple-500" />
              Тематика
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              <Icon name="Pencil" size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!event.theme ? (
            <p className="text-muted-foreground">Тематика не указана</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon name="Sparkles" size={18} className="text-muted-foreground" />
                <span className="font-medium">{event.theme}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Palette" className="text-purple-500" />
          Тематика мероприятия
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="theme">Тема праздника</Label>
          <Textarea
            id="theme"
            placeholder="Например: Пираты Карибского моря, Гавайская вечеринка, Ретро 80-х..."
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            rows={3}
          />
        </div>

        <Button
          variant="outline"
          onClick={generateThemeIdeas}
          disabled={generatingIdeas}
          className="w-full"
        >
          <Icon name="Wand2" size={16} />
          {generatingIdeas ? 'Генерирую идеи...' : 'Генерировать идеи тематики с ИИ'}
        </Button>

        {aiSuggestions && (
          <div className="p-4 bg-accent rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Icon name="Sparkles" size={16} className="text-purple-500" />
              Предложения от ИИ:
            </div>
            <div className="text-sm whitespace-pre-wrap">{aiSuggestions}</div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const firstTheme = aiSuggestions.split('\n').find((line) => line.trim().length > 0);
                if (firstTheme) {
                  setTheme(firstTheme.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim());
                }
              }}
            >
              <Icon name="Copy" size={14} />
              Использовать первую идею
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleSave}>
            <Icon name="Check" size={16} />
            Сохранить
          </Button>
          <Button variant="outline" onClick={() => setEditing(false)}>
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
