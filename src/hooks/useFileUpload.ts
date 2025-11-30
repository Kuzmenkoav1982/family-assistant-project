import { useState } from 'react';

interface UploadResult {
  url: string;
  fileName: string;
  size: number;
}

interface UseFileUploadReturn {
  upload: (file: File, folder?: string) => Promise<string>;
  uploading: boolean;
  error: string | null;
  progress: number;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File, folder: string = 'general'): Promise<string> => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress((e.loaded / e.total) * 50);
          }
        };
        reader.readAsDataURL(file);
      });

      // Upload to backend
      const response = await fetch('https://functions.poehali.dev/159c1ff5-fd0b-4564-b93b-55b81348c9a0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          folder: folder,
        }),
      });

      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result: UploadResult = await response.json();
      setUploading(false);
      return result.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setUploading(false);
      throw err;
    }
  };

  return { upload, uploading, error, progress };
};
