import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PanelSettingsProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoHide: boolean;
  onAutoHideChange: (value: boolean) => void;
  availableSections: Array<{ id: string; label: string; icon: string }>;
  selectedSections: string[];
  onSectionsChange: (sections: string[]) => void;
  
  showLanguageSettings?: boolean;
  currentLanguage?: string;
  languageOptions?: Array<{ code: string; name: string; flag: string }>;
  onLanguageChange?: (code: string) => void;
  
  showAppearanceSettings?: boolean;
  appearanceMode?: 'light' | 'dark' | 'system' | 'auto';
  onAppearanceModeChange?: (mode: 'light' | 'dark' | 'system' | 'auto') => void;
}

export default function PanelSettings({
  title,
  open,
  onOpenChange,
  autoHide,
  onAutoHideChange,
  availableSections,
  selectedSections,
  onSectionsChange,
  showLanguageSettings = false,
  currentLanguage,
  languageOptions = [],
  onLanguageChange,
  showAppearanceSettings = false,
  appearanceMode = 'light',
  onAppearanceModeChange
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
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
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
            <div className="space-y-2">
              {availableSections.map(section => (
                <div key={section.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`section-${section.id}`}
                    checked={selectedSections.includes(section.id)}
                    onCheckedChange={() => handleSectionToggle(section.id)}
                  />
                  <Label htmlFor={`section-${section.id}`} className="flex items-center gap-2 cursor-pointer">
                    <Icon name={section.icon as any} size={16} />
                    {section.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {showLanguageSettings && languageOptions.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="flex items-center gap-2">
                <Icon name="Languages" size={16} />
                Язык интерфейса
              </Label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange?.(lang.code)}
                    className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-left ${
                      currentLanguage === lang.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.name}</span>
                    {currentLanguage === lang.code && (
                      <Icon name="Check" className="text-blue-600 ml-auto" size={14} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showAppearanceSettings && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="flex items-center gap-2">
                <Icon name="Monitor" size={16} />
                Оформление экрана
              </Label>
              <RadioGroup value={appearanceMode} onValueChange={onAppearanceModeChange}>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                      <Icon name="Sun" size={16} />
                      Светлое
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                      <Icon name="Moon" size={16} />
                      Темное
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                      <Icon name="Laptop" size={16} />
                      Как на устройстве
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="flex items-center gap-2 cursor-pointer">
                      <Icon name="Clock" size={16} />
                      Автоматически (по времени)
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}