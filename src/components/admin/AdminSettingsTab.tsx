import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface AdminSettingsTabProps {
  uploadingAppForm: boolean;
  applicationFormUrl: string;
  onUploadFile: (file: File) => void;
  onDeleteForm: () => void;
}

export default function AdminSettingsTab({ uploadingAppForm, applicationFormUrl, onUploadFile, onDeleteForm }: AdminSettingsTabProps) {
  return (
    <div>
      <h2 className="text-3xl font-heading font-bold text-primary mb-8">Настройки</h2>
      <Card className="p-6 rounded-2xl max-w-2xl">
        <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
          <Icon name="ClipboardList" size={20} className="text-primary" />
          Лист подачи заявки
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Загрузите файл листа подачи заявки (DOCX, DOC или PDF). Он будет доступен для скачивания в разделе "Документы" на сайте.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".docx,.doc,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadFile(file);
              }}
              disabled={uploadingAppForm}
              className="rounded-xl h-10"
            />
            {uploadingAppForm && <Icon name="Loader2" className="animate-spin" />}
          </div>
          {applicationFormUrl && (
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <Icon name="CheckCircle" size={18} className="text-green-600" />
              <a href={applicationFormUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                <Icon name="ExternalLink" size={14} />
                Просмотреть загруженный файл
              </a>
              <Button variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={onDeleteForm}>
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
