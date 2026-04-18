import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { VitalSignsChart } from './VitalSignsChart';
import { QuickVitalInput } from './QuickVitalInput';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface HealthProfile {
  id: string;
  userName: string;
  userAge: number;
  photoUrl?: string;
}

interface VitalRecord {
  id: string;
  type: string;
  value: string;
  unit: string;
  date: string;
  time?: string;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

interface HealthRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  doctor?: string;
  clinic?: string;
  diagnosis?: string;
}

interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDate?: string;
  clinic: string;
}

interface HealthDashboardProps {
  profile: HealthProfile;
  vitals: VitalRecord[];
  medications: Medication[];
  records: HealthRecord[];
  vaccinations: Vaccination[];
  onRefresh: () => void;
}

export function HealthDashboard({ 
  profile, 
  vitals, 
  medications, 
  records, 
  vaccinations,
  onRefresh 
}: HealthDashboardProps) {
  const [reportSections, setReportSections] = useState({
    vitals: true,
    medications: true,
    records: true,
    vaccinations: true,
    charts: true
  });
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: keyof typeof reportSections) => {
    setReportSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setExporting(true);
    toast({
      title: '📄 Создание PDF...',
      description: 'Это может занять несколько секунд'
    });

    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Медицинский-отчет-${profile.userName}-${new Date().toLocaleDateString('ru-RU')}.pdf`);

      toast({
        title: '✅ PDF готов',
        description: 'Файл успешно сохранён'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать PDF',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const activeMedications = medications.filter(m => m.active);
  const recentRecords = records.slice(0, 10);
  const upcomingVaccinations = vaccinations.filter(v => v.nextDate);

  const latestPressure = vitals.filter(v => v.type === 'pressure').slice(-1)[0];
  const latestPulse = vitals.filter(v => v.type === 'pulse').slice(-1)[0];
  const latestWeight = vitals.filter(v => v.type === 'weight').slice(-1)[0];

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Настройки медицинского отчёта
          </CardTitle>
          <CardDescription>
            Выберите разделы для включения в отчёт
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="charts"
                checked={reportSections.charts}
                onCheckedChange={() => toggleSection('charts')}
              />
              <Label htmlFor="charts" className="cursor-pointer">
                📊 Графики показателей
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vitals"
                checked={reportSections.vitals}
                onCheckedChange={() => toggleSection('vitals')}
              />
              <Label htmlFor="vitals" className="cursor-pointer">
                🩺 Показатели здоровья
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="medications"
                checked={reportSections.medications}
                onCheckedChange={() => toggleSection('medications')}
              />
              <Label htmlFor="medications" className="cursor-pointer">
                💊 Лекарства и курсы
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="records"
                checked={reportSections.records}
                onCheckedChange={() => toggleSection('records')}
              />
              <Label htmlFor="records" className="cursor-pointer">
                📋 История посещений
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="vaccinations"
                checked={reportSections.vaccinations}
                onCheckedChange={() => toggleSection('vaccinations')}
              />
              <Label htmlFor="vaccinations" className="cursor-pointer">
                💉 Прививки
              </Label>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <QuickVitalInput profileId={profile.id} onSuccess={onRefresh} />
            
            <Button onClick={handlePrint} variant="outline">
              <Icon name="Printer" size={16} className="mr-2" />
              Печать
            </Button>
            
            <Button onClick={handleExportPDF} variant="outline" disabled={exporting}>
              {exporting ? (
                <>
                  <Icon name="Loader2" className="animate-spin mr-2" size={16} />
                  Создание PDF...
                </>
              ) : (
                <>
                  <Icon name="Download" size={16} className="mr-2" />
                  Экспорт в PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div ref={reportRef} className="space-y-6 p-6 bg-white print:p-0">
        <div className="text-center space-y-2 print:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Медицинский отчёт</h1>
          <p className="text-base sm:text-xl text-muted-foreground">{profile.userName}, {profile.userAge} лет</p>
          <p className="text-sm text-muted-foreground">
            Дата формирования: {new Date().toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>

        <Separator />

        {reportSections.vitals && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="Activity" size={20} />
              Текущие показатели
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {latestPressure && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Артериальное давление</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{latestPressure.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(latestPressure.date).toLocaleDateString('ru-RU')} {latestPressure.time}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {latestPulse && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Пульс</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{latestPulse.value} {latestPulse.unit}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(latestPulse.date).toLocaleDateString('ru-RU')} {latestPulse.time}
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {latestWeight && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Вес</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{latestWeight.value} {latestWeight.unit}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(latestWeight.date).toLocaleDateString('ru-RU')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {reportSections.charts && (
          <div className="space-y-3 print:page-break-after-always">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="TrendingUp" size={20} />
              Динамика показателей
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VitalSignsChart 
                vitals={vitals} 
                type="pressure" 
                title="Артериальное давление" 
                color="#ef4444" 
              />
              <VitalSignsChart 
                vitals={vitals} 
                type="pulse" 
                title="Пульс" 
                color="#f59e0b" 
              />
            </div>
          </div>
        )}

        {reportSections.medications && activeMedications.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="Pill" size={20} />
              Текущие лекарства и курсы лечения
            </h2>
            <div className="space-y-2">
              {activeMedications.map((med) => (
                <Card key={med.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{med.name}</p>
                        <p className="text-sm text-muted-foreground">{med.dosage}</p>
                        <p className="text-sm">{med.frequency}</p>
                      </div>
                      <Badge variant="secondary">
                        С {new Date(med.startDate).toLocaleDateString('ru-RU')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {reportSections.records && recentRecords.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="FileText" size={20} />
              История посещений врачей
            </h2>
            <div className="space-y-2">
              {recentRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold">{record.title}</p>
                      <Badge variant="outline">
                        {new Date(record.date).toLocaleDateString('ru-RU')}
                      </Badge>
                    </div>
                    {record.doctor && (
                      <p className="text-sm text-muted-foreground">Врач: {record.doctor}</p>
                    )}
                    {record.clinic && (
                      <p className="text-sm text-muted-foreground">Клиника: {record.clinic}</p>
                    )}
                    {record.diagnosis && (
                      <p className="text-sm mt-1">Диагноз: {record.diagnosis}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {reportSections.vaccinations && upcomingVaccinations.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="Syringe" size={20} />
              График прививок
            </h2>
            <div className="space-y-2">
              {upcomingVaccinations.map((vacc) => (
                <Card key={vacc.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{vacc.name}</p>
                        <p className="text-sm text-muted-foreground">{vacc.clinic}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Следующая</p>
                        <p className="font-semibold text-orange-600">
                          {new Date(vacc.nextDate!).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-center text-muted-foreground pt-6 border-t">
          <p>Этот отчёт сгенерирован автоматически и предназначен для информационных целей.</p>
          <p>Для точной диагностики и лечения обращайтесь к квалифицированным специалистам.</p>
        </div>
      </div>
    </div>
  );
}