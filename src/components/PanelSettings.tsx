import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface PanelSettingsProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoHide: boolean;
  onAutoHideChange: (value: boolean) => void;
  availableSections: Array<{ id: string; label: string; icon: string }>;
  selectedSections: string[];
  onSectionsChange: (sections: string[]) => void;
}

export default function PanelSettings({
  title,
  open,
  onOpenChange,
  autoHide,
  onAutoHideChange,
  availableSections,
  selectedSections,
  onSectionsChange
}: PanelSettingsProps) {
  const handleSectionToggle = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      onSectionsChange(selectedSections.filter(s => s !== sectionId));
    } else {
      onSectionsChange([...selectedSections, sectionId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoHide"
              checked={autoHide}
              onCheckedChange={(checked) => onAutoHideChange(checked as boolean)}
            />
            <Label htmlFor="autoHide">Автоскрытие панели</Label>
          </div>

          <div className="space-y-2">
            <Label>Разделы на панели:</Label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableSections.map(section => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`section-${section.id}`}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <Label htmlFor={`section-${section.id}`} className="flex items-center gap-2">
                    <Icon name={section.icon as any} size={16} />
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
