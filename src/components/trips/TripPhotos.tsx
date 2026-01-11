import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const TRIPS_API_URL = 'https://functions.poehali.dev/6b3296a3-1703-4ab4-9773-e09a9a93a11a';
const UPLOAD_FILE_URL = 'https://functions.poehali.dev/159c1ff5-fd0b-4564-b93b-55b81348c9a0';

interface Photo {
  id: number;
  photo_url: string;
  title?: string;
  description?: string;
  location?: string;
  date_taken?: string;
}

interface TripPhotosProps {
  tripId: number;
  photos: Photo[];
  onUpdate: () => void;
}

export function TripPhotos({ tripId, photos, onUpdate }: TripPhotosProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    description: '',
    location: '',
    date_taken: new Date().toISOString().split('T')[0]
  });
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Выберите изображение');
      return;
    }

    try {
      setUploading(true);

      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];

        const response = await fetch(UPLOAD_FILE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file_data: base64Data,
            file_name: file.name,
            content_type: file.type
          })
        });

        if (response.ok) {
          const data = await response.json();
          setPhotoUrl(data.url);
        } else {
          alert('Ошибка загрузки фото');
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!photoUrl) {
      alert('Загрузите фотографию');
      return;
    }

    try {
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_photo',
          trip_id: tripId,
          photo_url: photoUrl,
          user_id: 1,
          ...newPhoto
        })
      });

      if (response.ok) {
        onUpdate();
        setIsAddOpen(false);
        setNewPhoto({
          title: '',
          description: '',
          location: '',
          date_taken: new Date().toISOString().split('T')[0]
        });
        setPhotoUrl('');
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Ошибка при добавлении фото');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Удалить это фото?')) return;

    try {
      const response = await fetch(TRIPS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_photo',
          photo_id: photoId
        })
      });

      if (response.ok) {
        onUpdate();
        setSelectedImage(null);
      } else {
        alert('Ошибка при удалении фото');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Ошибка при удалении фото');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Фотографии</h3>
        <Button onClick={() => setIsAddOpen(true)}>
          <Icon name="Upload" size={16} className="mr-2" />
          Загрузить фото
        </Button>
      </div>

      {photos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="Camera" size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-600 mb-4">Нет фотографий</p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Icon name="Upload" size={16} className="mr-2" />
              Загрузить первое фото
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedImage(photo)}
            >
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={photo.photo_url}
                  alt={photo.title || 'Фото'}
                  className="w-full h-full object-cover"
                />
                {photo.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-white text-sm font-medium line-clamp-2">{photo.title}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Загрузить фотографию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo_file">Фото *</Label>
              <Input
                id="photo_file"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading && (
                <p className="text-sm text-gray-500 mt-1">Загрузка...</p>
              )}
              {photoUrl && (
                <div className="mt-2">
                  <img src={photoUrl} alt="Preview" className="w-32 h-32 object-cover rounded" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={newPhoto.title}
                onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                placeholder="Закат на пляже"
              />
            </div>
            <div>
              <Label htmlFor="location">Место</Label>
              <Input
                id="location"
                value={newPhoto.location}
                onChange={(e) => setNewPhoto({ ...newPhoto, location: e.target.value })}
                placeholder="Парк Ривьера"
              />
            </div>
            <div>
              <Label htmlFor="date_taken">Дата съемки</Label>
              <Input
                id="date_taken"
                type="date"
                value={newPhoto.date_taken}
                onChange={(e) => setNewPhoto({ ...newPhoto, date_taken: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={newPhoto.description}
                onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                placeholder="Что изображено на фото?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddPhoto} disabled={!photoUrl || uploading}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedImage.title || 'Фото'}</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeletePhoto(selectedImage.id)}
                >
                  <Icon name="Trash2" size={20} />
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={selectedImage.photo_url}
                alt={selectedImage.title || 'Фото'}
                className="w-full rounded-lg"
              />
              {selectedImage.description && (
                <p className="text-gray-700">{selectedImage.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {selectedImage.location && (
                  <span className="flex items-center gap-1">
                    <Icon name="MapPin" size={14} />
                    {selectedImage.location}
                  </span>
                )}
                {selectedImage.date_taken && (
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" size={14} />
                    {formatDate(selectedImage.date_taken)}
                  </span>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}