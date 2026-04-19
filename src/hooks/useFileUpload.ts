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

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1920;
const IMAGE_QUALITY = 0.82;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', IMAGE_QUALITY)
  );
  if (!blob) return file;

  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], newName, { type: 'image/jpeg' });
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
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('Файл больше 10 МБ');
      }

      let workFile = file;
      try {
        workFile = await compressImage(file);
      } catch {
        workFile = file;
      }

      setProgress(30);

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(workFile);
      });

      setProgress(60);

      const response = await fetch('https://functions.poehali.dev/159c1ff5-fd0b-4564-b93b-55b81348c9a0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: base64,
          fileName: workFile.name,
          folder: folder,
        }),
      });

      setProgress(100);

      if (!response.ok) {
        let msg = `Upload failed (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error) msg = errorData.error;
        } catch {
          try {
            const text = await response.text();
            if (text) msg = text.slice(0, 200);
          } catch {
            /* ignore */
          }
        }
        throw new Error(msg);
      }

      const result: UploadResult = await response.json();
      setUploading(false);
      return result.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      setUploading(false);
      throw err;
    }
  };

  return { upload, uploading, error, progress };
};
