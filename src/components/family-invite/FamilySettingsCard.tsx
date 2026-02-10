import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface FamilySettingsCardProps {
  familyName: string;
  familyLogo: string;
  isUpdating: boolean;
  isUploading: boolean;
  isDragging: boolean;
  onFamilyNameChange: (name: string) => void;
  onFamilyLogoChange: (logo: string) => void;
  onUpdate: () => Promise<void>;
  onLogoUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => Promise<void>;
}

export function FamilySettingsCard({
  familyName,
  familyLogo,
  isUpdating,
  isUploading,
  isDragging,
  onFamilyNameChange,
  onFamilyLogoChange,
  onUpdate,
  onLogoUpload,
  onDragOver,
  onDragLeave,
  onDrop
}: FamilySettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Settings" size={24} />
          Настройки семьи
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="familyName">Название семьи</Label>
          <Input
            id="familyName"
            value={familyName}
            onChange={(e) => onFamilyNameChange(e.target.value)}
            placeholder="Семья Ивановых"
          />
        </div>

        <div>
          <Label>Логотип семьи</Label>
          <div className="space-y-3">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {familyLogo ? (
                <div className="space-y-3">
                  <img 
                    src={familyLogo} 
                    alt="Логотип семьи" 
                    className="w-32 h-32 object-cover rounded-lg mx-auto border"
                  />
                  <p className="text-sm text-muted-foreground">
                    Перетащите новое изображение для замены
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Icon name="Image" size={48} className="mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Перетащите изображение сюда или нажмите кнопку ниже
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={isUploading}
                onClick={() => document.getElementById('logoUpload')?.click()}
              >
                <Icon name="Upload" size={16} />
                {isUploading ? 'Загрузка...' : 'Загрузить файл'}
              </Button>
              <input
                id="logoUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLogoUpload}
              />
            </div>

            <div>
              <Label htmlFor="familyLogoUrl" className="text-sm text-muted-foreground">
                Или вставьте ссылку на изображение
              </Label>
              <Input
                id="familyLogoUrl"
                value={familyLogo}
                onChange={(e) => onFamilyLogoChange(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={onUpdate} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </CardContent>
    </Card>
  );
}
