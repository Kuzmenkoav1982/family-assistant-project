import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const UPLOAD_PHOTO_URL = 'https://functions.poehali.dev/d9017229-a2a3-4237-a002-bcdb7608c8d9';

interface PhotoUploadProps {
  activityId: number;
  existingPhotos?: string[];
  onPhotosUpdate: (photos: string[]) => void;
}

export function PhotoUpload({ activityId, existingPhotos = [], onPhotosUpdate }: PhotoUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedPhotos: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        const base64 = await fileToBase64(file);
        
        const response = await fetch(UPLOAD_PHOTO_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_id: activityId,
            photo: base64.split(',')[1],
            filename: file.name
          })
        });

        const data = await response.json();
        if (data.url) {
          uploadedPhotos.push(data.url);
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert(`Ошибка загрузки ${file.name}`);
      }
    }

    const newPhotos = [...photos, ...uploadedPhotos];
    setPhotos(newPhotos);
    onPhotosUpdate(newPhotos);
    setUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDeletePhoto = (photoUrl: string) => {
    const newPhotos = photos.filter(p => p !== photoUrl);
    setPhotos(newPhotos);
    onPhotosUpdate(newPhotos);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <Icon name="Camera" size={16} />
        Фото ({photos.length})
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Camera" size={24} />
              Фотографии
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} />
                    Загрузить фото
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Photo Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <Card key={index} className="relative group overflow-hidden">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeletePhoto(photo)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Camera" size={64} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Фотографий пока нет</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Icon name="Upload" size={16} className="mr-2" />
                  Загрузить первое фото
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
