import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { Contest, Application, Result, Review, CertificateRow } from "@/data/adminTypes";
import {
  API_URL, UPLOAD_URL, RESULTS_API_URL, APPLICATIONS_API_URL,
  SUBMIT_APPLICATION_URL, REVIEWS_API_URL, SETTINGS_API_URL,
  CERTIFICATES_LOG_URL, INITIAL_CONTEST,
} from "@/data/adminTypes";

export default function useAdmin() {
  const { toast } = useToast();

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<'contests' | 'applications' | 'results' | 'reviews' | 'certificates' | 'settings'>('contests');
  const [certificatesLog, setCertificatesLog] = useState<CertificateRow[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [applicationsSubTab, setApplicationsSubTab] = useState<'active' | 'archive' | 'trash'>('active');
  const [contests, setContests] = useState<Contest[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deletedApplications, setDeletedApplications] = useState<Application[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [applicationsWithResults, setApplicationsWithResults] = useState<Set<number>>(new Set());
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [resultFilters, setResultFilters] = useState({
    contest_name: '', full_name: '', result: 'all', date: undefined as Date | undefined
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [appStatus, setAppStatus] = useState<'new' | 'viewed' | 'sent'>('new');
  const [appResult, setAppResult] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'viewed' | 'sent'>('all');
  const [workPreview, setWorkPreview] = useState<string | null>(null);
  const [isWorkPreviewOpen, setIsWorkPreviewOpen] = useState(false);
  const [formData, setFormData] = useState<Contest>({ ...INITIAL_CONTEST });
  const [uploadingRules, setUploadingRules] = useState(false);
  const [uploadingDiploma, setUploadingDiploma] = useState(false);
  const [uploadingAppForm, setUploadingAppForm] = useState(false);
  const [applicationFormUrl, setApplicationFormUrl] = useState<string>('');
  const [isManualAppModalOpen, setIsManualAppModalOpen] = useState(false);
  const [manualAppFile, setManualAppFile] = useState<File | null>(null);
  const [manualContestName, setManualContestName] = useState("");
  const [submittingManualApp, setSubmittingManualApp] = useState(false);
  const [manualAppUploadProgress, setManualAppUploadProgress] = useState(0);

  const loadContests = async () => {
    try { const r = await fetch(API_URL); setContests(await r.json()); }
    catch { toast({ title: "Ошибка", description: "Не удалось загрузить конкурсы", variant: "destructive" }); }
  };

  const loadApplications = async () => {
    try { const r = await fetch(APPLICATIONS_API_URL); setApplications(await r.json()); }
    catch { toast({ title: "Ошибка", description: "Не удалось загрузить заявки", variant: "destructive" }); }
  };

  const loadDeletedApplications = async () => {
    try { const r = await fetch(`${APPLICATIONS_API_URL}?deleted=true`); setDeletedApplications(await r.json()); }
    catch { toast({ title: "Ошибка", description: "Не удалось загрузить корзину", variant: "destructive" }); }
  };

  const loadResults = async () => {
    try {
      const r = await fetch(RESULTS_API_URL); const data = await r.json();
      setResults(data);
      setApplicationsWithResults(new Set(data.filter((r: Result) => r.application_id).map((r: Result) => r.application_id)));
    } catch { toast({ title: "Ошибка", description: "Не удалось загрузить результаты", variant: "destructive" }); }
  };

  const loadReviews = async () => {
    try { const r = await fetch(`${REVIEWS_API_URL}?status=all`); setReviews(await r.json()); }
    catch { toast({ title: "Ошибка", description: "Не удалось загрузить отзывы", variant: "destructive" }); }
  };

  const loadSettings = async () => {
    try {
      const r = await fetch(SETTINGS_API_URL); const data = await r.json();
      if (data.application_form_url) setApplicationFormUrl(data.application_form_url);
    } catch (e) { console.error('Ошибка загрузки настроек:', e); }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadContests(); loadApplications(); loadDeletedApplications();
      loadResults(); loadReviews(); loadSettings();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = [...results];
    if (resultFilters.contest_name) filtered = filtered.filter(r => r.contest_name?.toLowerCase().includes(resultFilters.contest_name.toLowerCase()));
    if (resultFilters.full_name) filtered = filtered.filter(r => r.full_name?.toLowerCase().includes(resultFilters.full_name.toLowerCase()));
    if (resultFilters.result !== 'all') filtered = filtered.filter(r => r.result === resultFilters.result);
    if (resultFilters.date) filtered = filtered.filter(r => r.created_at && new Date(r.created_at).toDateString() === new Date(resultFilters.date!).toDateString());
    setFilteredResults(filtered);
  }, [results, resultFilters]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "Вход выполнен", description: "Добро пожаловать в админ-панель!" });
    } else {
      toast({ title: "Ошибка входа", description: "Неверный логин или пароль", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false); setLogin(""); setPassword("");
    toast({ title: "Выход выполнен", description: "Вы вышли из админ-панели" });
  };

  const parseRussianDate = (dateStr: string): string => {
    const months: Record<string, string> = {
      'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
      'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
      'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12',
      'january': '01', 'february': '02', 'march': '03', 'april': '04',
      'may': '05', 'june': '06', 'july': '07', 'august': '08',
      'september': '09', 'october': '10', 'november': '11', 'december': '12'
    };
    const parts = dateStr.trim().split(' ');
    if (parts.length === 3 && months[parts[1].toLowerCase()]) return `${parts[2]}-${months[parts[1].toLowerCase()]}-${parts[0].padStart(2, '0')}`;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  };

  const handleCreateContest = () => {
    setEditingContest(null); setFormData({ ...INITIAL_CONTEST }); setIsModalOpen(true);
  };

  const handleEditContest = (contest: Contest) => {
    setEditingContest(contest);
    setFormData({ ...contest, deadline: contest.deadline ? parseRussianDate(contest.deadline) : "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingContest ? 'PUT' : 'POST';
      const body = editingContest ? { ...formData, id: editingContest.id } : formData;
      const r = await fetch(API_URL, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (r.ok) { toast({ title: "Успешно", description: editingContest ? "Конкурс обновлен" : "Конкурс создан" }); setIsModalOpen(false); loadContests(); }
    } catch { toast({ title: "Ошибка", description: "Не удалось сохранить конкурс", variant: "destructive" }); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить этот конкурс?")) return;
    try { const r = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' }); if (r.ok) { toast({ title: "Успешно", description: "Конкурс удален" }); loadContests(); } }
    catch { toast({ title: "Ошибка", description: "Не удалось удалить конкурс", variant: "destructive" }); }
  };

  const handleDeleteApplication = async (id: number) => {
    if (!confirm("Переместить заявку в корзину?")) return;
    try { const r = await fetch(`${APPLICATIONS_API_URL}?id=${id}`, { method: 'DELETE' }); if (r.ok) { toast({ title: "Успешно", description: "Заявка перемещена в корзину" }); loadApplications(); loadDeletedApplications(); } }
    catch { toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" }); }
  };

  const handlePermanentDeleteApplication = async (id: number) => {
    if (!confirm("Удалить заявку навсегда? Это действие нельзя отменить.")) return;
    try { const r = await fetch(`${APPLICATIONS_API_URL}?id=${id}&permanent=true`, { method: 'DELETE' }); if (r.ok) { toast({ title: "Удалено", description: "Заявка удалена безвозвратно" }); loadDeletedApplications(); } }
    catch { toast({ title: "Ошибка", description: "Не удалось удалить заявку", variant: "destructive" }); }
  };

  const handleRestoreApplication = async (id: number) => {
    try { const r = await fetch(`${APPLICATIONS_API_URL}?id=${id}&restore=true`, { method: 'DELETE' }); if (r.ok) { toast({ title: "Успешно", description: "Заявка восстановлена" }); loadApplications(); loadDeletedApplications(); } }
    catch { toast({ title: "Ошибка", description: "Не удалось восстановить заявку", variant: "destructive" }); }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    try { const r = await fetch(RESULTS_API_URL, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingResult) }); if (r.ok) { toast({ title: "Успешно", description: "Результат обновлен" }); setIsResultModalOpen(false); loadResults(); } }
    catch { toast({ title: "Ошибка", description: "Не удалось сохранить результат", variant: "destructive" }); }
  };

  const handleDeleteResult = async (id: number) => {
    if (!confirm("Удалить этот результат?")) return;
    try { const r = await fetch(`${RESULTS_API_URL}?id=${id}`, { method: 'DELETE' }); if (r.ok) { toast({ title: "Успешно", description: "Результат удален" }); loadResults(); } }
    catch { toast({ title: "Ошибка", description: "Не удалось удалить результат", variant: "destructive" }); }
  };

  const handleCreateResultFromApplication = async (app: Application) => {
    if (!app.result) { toast({ title: "Результат не указан", description: "Сначала установите результат в заявке", variant: "destructive" }); return; }
    try {
      const r = await fetch(RESULTS_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: app.id, full_name: app.full_name, age: app.age,
          teacher: app.teacher, institution: app.institution, work_title: app.work_title,
          email: app.email, contest_id: app.contest_id, contest_name: app.contest_name,
          work_file_url: app.work_file_url, result: app.result,
          gallery_consent: app.gallery_consent, notes: null,
          diploma_issued_at: app.diploma_issued_at || null
        })
      });
      if (r.ok) { toast({ title: "Успешно", description: "Результат создан из заявки" }); loadResults(); }
      else if (r.status === 409) toast({ title: "Дубликат", description: "Результат из этой заявки уже существует", variant: "destructive" });
      else toast({ title: "Ошибка", description: "Не удалось создать результат", variant: "destructive" });
    } catch { toast({ title: "Ошибка", description: "Не удалось создать результат", variant: "destructive" }); }
  };

  const handleManualAppSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!manualAppFile) { toast({ title: "Ошибка", description: "Загрузите файл работы", variant: "destructive" }); return; }
    setSubmittingManualApp(true); setManualAppUploadProgress(0);
    try {
      const fd = new FormData(e.currentTarget);
      let file_url = '';
      const CHUNK_SIZE = 500_000;
      const totalChunks = Math.ceil(manualAppFile.size / CHUNK_SIZE);
      let uploadId: string | null = null;
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const chunk = manualAppFile.slice(start, start + CHUNK_SIZE);
        const chunkBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result!.toString().split(',')[1]);
          reader.readAsDataURL(chunk);
        });
        setManualAppUploadProgress(5 + Math.round((chunkIndex / totalChunks) * 45));
        const uploadResponse = await fetch(UPLOAD_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chunk: chunkBase64, chunkIndex, totalChunks, fileName: manualAppFile.name, fileType: manualAppFile.type, folder: 'works', uploadId: uploadId || undefined })
        });
        if (!uploadResponse.ok) throw new Error('Не удалось загрузить файл');
        const result = await uploadResponse.json();
        if (!uploadId) uploadId = result.uploadId;
        if (result.complete) file_url = result.url;
      }
      setManualAppUploadProgress(60);
      const response = await fetch(SUBMIT_APPLICATION_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fd.get('manualFullName'), age: parseInt(fd.get('manualAge') as string),
          teacher: fd.get('manualTeacher') || null, institution: fd.get('manualInstitution') || null,
          work_title: fd.get('manualWorkTitle'), email: fd.get('manualEmail'),
          contest_name: manualContestName, work_file_url: file_url,
          gallery_consent: fd.get('manualGallery') === 'on'
        })
      });
      setManualAppUploadProgress(90);
      const result = await response.json();
      if (response.ok && result.success) {
        setManualAppUploadProgress(100);
        toast({ title: "Успешно", description: "Заявка добавлена вручную" });
        setIsManualAppModalOpen(false); setManualAppFile(null); setManualAppUploadProgress(0);
        loadApplications();
      } else toast({ title: "Ошибка", description: result.error || "Не удалось создать заявку", variant: "destructive" });
      setSubmittingManualApp(false);
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      toast({ title: "Ошибка", description: error instanceof Error ? error.message : "Произошла ошибка при создании заявки", variant: "destructive" });
      setSubmittingManualApp(false); setManualAppUploadProgress(0);
    }
  };

  const loadCertificates = () => {
    setCertLoading(true);
    fetch(CERTIFICATES_LOG_URL).then(r => r.json()).then(data => setCertificatesLog(data)).finally(() => setCertLoading(false));
  };

  const handleUploadAppForm = async (file: File) => {
    setUploadingAppForm(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        const response = await fetch(UPLOAD_URL, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, fileName: file.name, fileType: file.type || 'application/octet-stream', folder: 'application-forms' })
        });
        const data = await response.json();
        setApplicationFormUrl(data.url);
        await fetch(SETTINGS_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'application_form_url', value: data.url }) });
        toast({ title: 'Файл загружен', description: 'Лист подачи заявки успешно загружен' });
      };
      reader.readAsDataURL(file);
    } catch { toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' }); }
    finally { setUploadingAppForm(false); }
  };

  const handleDeleteAppForm = async () => {
    setApplicationFormUrl('');
    await fetch(SETTINGS_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'application_form_url', value: '' }) });
    toast({ title: 'Удалено', description: 'Ссылка на лист подачи заявки удалена' });
  };

  const handleDownloadCertificate = async (row: CertificateRow) => {
    const res = await fetch(`https://functions.poehali.dev/7ea2c01d-bd1a-4567-b4f0-21aab3b96774?id=${row.result_id}`);
    if (!res.ok) { toast({ title: 'Ошибка', description: 'Не удалось сформировать справку', variant: 'destructive' }); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${row.result_id}_${(row.full_name || '').replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    isAuthenticated, login, setLogin, password, setPassword, handleLogin, handleLogout,
    activeTab, setActiveTab,
    contests, applications, deletedApplications, results, filteredResults, reviews,
    applicationsWithResults, applicationsSubTab, setApplicationsSubTab,
    isModalOpen, setIsModalOpen, editingContest, formData, setFormData,
    uploadingRules, setUploadingRules, uploadingDiploma, setUploadingDiploma,
    handleCreateContest, handleEditContest, handleSubmit, handleDelete,
    isAppModalOpen, setIsAppModalOpen, editingApplication, setEditingApplication,
    appStatus, setAppStatus, appResult, setAppResult,
    isWorkPreviewOpen, setIsWorkPreviewOpen, workPreview, setWorkPreview,
    isManualAppModalOpen, setIsManualAppModalOpen,
    manualAppFile, setManualAppFile, manualContestName, setManualContestName,
    submittingManualApp, manualAppUploadProgress,
    handleCreateResultFromApplication, handleDeleteApplication,
    handlePermanentDeleteApplication, handleRestoreApplication,
    handleManualAppSubmit, loadApplications, loadDeletedApplications,
    isResultModalOpen, setIsResultModalOpen, editingResult, setEditingResult,
    resultFilters, setResultFilters, handleSaveResult, handleDeleteResult,
    loadReviews,
    certificatesLog, certLoading, loadCertificates, handleDownloadCertificate,
    uploadingAppForm, applicationFormUrl, handleUploadAppForm, handleDeleteAppForm,
    toast,
    UPLOAD_URL, APPLICATIONS_API_URL, REVIEWS_API_URL,
  };
}
