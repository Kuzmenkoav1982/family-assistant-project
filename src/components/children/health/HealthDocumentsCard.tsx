import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { MedicalDocument } from '@/hooks/useUploadMedicalFile';

interface HealthDocumentsCardProps {
  documents: MedicalDocument[];
  uploading: boolean;
  progress: number;
  viewDocumentsDialog: boolean;
  setViewDocumentsDialog: (v: boolean) => void;
  selectedDocuments: MedicalDocument[];
  setSelectedDocuments: (v: MedicalDocument[]) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: string) => void;
}

export function HealthDocumentsCard({
  documents,
  uploading,
  progress,
  viewDocumentsDialog,
  setViewDocumentsDialog,
  selectedDocuments,
  setSelectedDocuments,
  onFileChange,
}: HealthDocumentsCardProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Прикрепленные файлы ({documents.length})
            </CardTitle>
            <label className="cursor-pointer w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full sm:w-auto whitespace-nowrap" disabled={uploading} type="button" asChild>
                <span>
                  <Icon name="Upload" size={16} />
                  <span className="hidden sm:inline">{uploading ? `Загрузка ${progress}%` : 'Загрузить файл'}</span>
                  <span className="sm:hidden">{uploading ? `${progress}%` : 'Загрузить'}</span>
                </span>
              </Button>
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => onFileChange(e, 'other')}
                disabled={uploading}
              />
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">📸</div>
              <p className="font-medium text-gray-700">Пока нет загруженных файлов</p>
              <p className="text-sm text-gray-500">
                Загрузите рецепты, анализы, заключения врачей
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="relative group">
                  <button
                    onClick={() => {
                      setSelectedDocuments([doc]);
                      setViewDocumentsDialog(true);
                    }}
                    className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
                  >
                    {doc.fileType.startsWith('image/') ? (
                      <img src={doc.fileUrl} alt={doc.originalFilename} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                        <Icon name="FileText" size={32} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 px-2 text-center">{doc.originalFilename}</span>
                      </div>
                    )}
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate">{doc.originalFilename}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDocumentsDialog} onOpenChange={setViewDocumentsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Просмотр документа</DialogTitle>
          </DialogHeader>
          {selectedDocuments.length > 0 && (
            <div className="space-y-4">
              {selectedDocuments[0].fileType.startsWith('image/') ? (
                <img
                  src={selectedDocuments[0].fileUrl}
                  alt={selectedDocuments[0].originalFilename}
                  className="w-full rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Icon name="FileText" size={64} className="text-gray-400" />
                  <p className="text-lg font-medium">{selectedDocuments[0].originalFilename}</p>
                  <Button asChild>
                    <a href={selectedDocuments[0].fileUrl} download={selectedDocuments[0].originalFilename}>
                      <Icon name="Download" size={16} className="mr-2" />
                      Скачать файл
                    </a>
                  </Button>
                </div>
              )}
              <div className="text-sm text-gray-500">
                <p>Тип: {selectedDocuments[0].documentType}</p>
                <p>Загружено: {new Date(selectedDocuments[0].uploadedAt).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
