import { useState } from 'react';

export interface MedicalDocument {
  id: string;
  childId: string;
  documentType: 'prescription' | 'analysis' | 'doctor_visit' | 'vaccination' | 'other';
  fileUrl: string;
  fileType: string;
  originalFilename: string;
  relatedId?: string;
  relatedType?: string;
  title?: string;
  description?: string;
  uploadedAt: string;
}

interface UploadOptions {
  file: File;
  documentType: 'prescription' | 'analysis' | 'doctor_visit' | 'vaccination' | 'other';
  childId: string;
  relatedId?: string;
  relatedType?: string;
  title?: string;
  description?: string;
}

interface UploadResult {
  success: boolean;
  document?: MedicalDocument;
  error?: string;
}

export function useUploadMedicalFile() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (options: UploadOptions): Promise<UploadResult> => {
    const { file, documentType, childId, relatedId, relatedType, title, description } = options;

    setUploading(true);
    setProgress(0);

    try {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Файл слишком большой. Максимальный размер: 10 МБ');
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Неподдерживаемый тип файла. Разрешены: JPEG, PNG, PDF');
      }

      setProgress(30);

      const base64 = await fileToBase64(file);
      
      setProgress(60);

      const response = await fetch('https://functions.poehali.dev/2db47477-9dfd-49f9-8f51-7ff388753d82', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': localStorage.getItem('authToken') || '',
          'X-User-Id': localStorage.getItem('userId') || '',
        },
        body: JSON.stringify({
          file: base64,
          filename: file.name,
          fileType: file.type,
          documentType,
          childId,
          relatedId,
          relatedType,
          title,
          description,
        }),
      });

      setProgress(90);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки файла');
      }

      const result = await response.json();

      setProgress(100);

      const document: MedicalDocument = {
        id: result.documentId,
        childId,
        documentType,
        fileUrl: result.url,
        fileType: file.type,
        originalFilename: file.name,
        relatedId,
        relatedType,
        title,
        description,
        uploadedAt: result.uploadedAt || new Date().toISOString(),
      };

      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);

      return {
        success: true,
        document,
      };
    } catch (error: any) {
      console.error('[UPLOAD ERROR]', error);
      setUploading(false);
      setProgress(0);
      return {
        success: false,
        error: error.message || 'Ошибка загрузки файла',
      };
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  return {
    uploadFile,
    uploading,
    progress,
  };
}