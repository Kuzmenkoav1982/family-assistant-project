import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useFileUpload } from '@/hooks/useFileUpload';

export function FileUploadExample() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const { upload, uploading, error, progress } = useFileUpload();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const url = await upload(selectedFile, 'photos');
      setUploadedUrl(url);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Upload" size={24} />
          Загрузка файла в Object Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {selectedFile && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon name="FileImage" size={20} className="text-gray-500" />
              <span className="text-sm text-gray-700">{selectedFile.name}</span>
            </div>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin mr-2" />
                  Загрузка... {progress.toFixed(0)}%
                </>
              ) : (
                <>
                  <Icon name="Upload" size={16} className="mr-2" />
                  Загрузить
                </>
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <Icon name="AlertCircle" size={20} className="text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Ошибка загрузки</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {uploadedUrl && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <Icon name="CheckCircle" size={20} className="text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">Файл успешно загружен!</p>
                <p className="text-xs text-green-600 break-all">{uploadedUrl}</p>
              </div>
            </div>
            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="w-full rounded-lg shadow-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
