import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import AdminContestsTab from "@/components/admin/AdminContestsTab";
import AdminApplicationsTab from "@/components/admin/AdminApplicationsTab";
import AdminResultsAndReviewsTab from "@/components/admin/AdminResultsAndReviewsTab";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminCertificatesTab from "@/components/admin/AdminCertificatesTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import useAdmin from "@/hooks/useAdmin";

const Admin = () => {
  const a = useAdmin();

  if (!a.isAuthenticated) {
    return (
      <AdminLoginForm
        login={a.login} setLogin={a.setLogin}
        password={a.password} setPassword={a.setPassword}
        onSubmit={a.handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-50 backdrop-blur-md shadow-md bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-heading font-bold text-white">Админ-панель</h1>
            <Button onClick={a.handleLogout} variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
              <Icon name="LogOut" className="mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-4 mb-8 border-b">
          {([
            { key: 'contests', icon: 'Trophy', label: 'Конкурсы' },
            { key: 'applications', icon: 'FileText', label: `Заявки (${a.applications.length + a.deletedApplications.length})` },
            { key: 'results', icon: 'Award', label: `Результаты (${a.results.length})` },
            { key: 'reviews', icon: 'MessageSquare', label: `Отзывы (${a.reviews.length})` },
            { key: 'certificates', icon: 'ScrollText', label: 'Выданные справки' },
            { key: 'settings', icon: 'Settings', label: 'Настройки' },
          ] as const).map(tab => (
            <Button
              key={tab.key}
              variant={a.activeTab === tab.key ? 'default' : 'ghost'}
              onClick={() => {
                a.setActiveTab(tab.key);
                if (tab.key === 'certificates' && a.certificatesLog.length === 0) a.loadCertificates();
              }}
              className="rounded-t-xl rounded-b-none"
            >
              <Icon name={tab.icon} className="mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {a.activeTab === 'contests' && (
          <AdminContestsTab
            contests={a.contests}
            isModalOpen={a.isModalOpen}
            setIsModalOpen={a.setIsModalOpen}
            editingContest={a.editingContest}
            formData={a.formData}
            setFormData={a.setFormData}
            uploadingRules={a.uploadingRules}
            setUploadingRules={a.setUploadingRules}
            uploadingDiploma={a.uploadingDiploma}
            setUploadingDiploma={a.setUploadingDiploma}
            handleCreateContest={a.handleCreateContest}
            handleEditContest={a.handleEditContest}
            handleSubmit={a.handleSubmit}
            handleDelete={a.handleDelete}
            UPLOAD_URL={a.UPLOAD_URL}
          />
        )}

        {a.activeTab === 'applications' && (
          <AdminApplicationsTab
            contests={a.contests}
            applications={a.applications}
            deletedApplications={a.deletedApplications}
            applicationsSubTab={a.applicationsSubTab}
            setApplicationsSubTab={a.setApplicationsSubTab}
            applicationsWithResults={a.applicationsWithResults}
            isAppModalOpen={a.isAppModalOpen}
            setIsAppModalOpen={a.setIsAppModalOpen}
            editingApplication={a.editingApplication}
            setEditingApplication={a.setEditingApplication}
            appResult={a.appResult}
            setAppResult={a.setAppResult}
            appStatus={a.appStatus}
            setAppStatus={a.setAppStatus}
            isWorkPreviewOpen={a.isWorkPreviewOpen}
            setIsWorkPreviewOpen={a.setIsWorkPreviewOpen}
            workPreview={a.workPreview}
            setWorkPreview={a.setWorkPreview}
            isManualAppModalOpen={a.isManualAppModalOpen}
            setIsManualAppModalOpen={a.setIsManualAppModalOpen}
            manualAppFile={a.manualAppFile}
            setManualAppFile={a.setManualAppFile}
            manualContestName={a.manualContestName}
            setManualContestName={a.setManualContestName}
            submittingManualApp={a.submittingManualApp}
            manualAppUploadProgress={a.manualAppUploadProgress}
            handleCreateResultFromApplication={a.handleCreateResultFromApplication}
            handleDeleteApplication={a.handleDeleteApplication}
            handlePermanentDeleteApplication={a.handlePermanentDeleteApplication}
            handleRestoreApplication={a.handleRestoreApplication}
            handleManualAppSubmit={a.handleManualAppSubmit}
            loadApplications={a.loadApplications}
            loadDeletedApplications={a.loadDeletedApplications}
            APPLICATIONS_API_URL={a.APPLICATIONS_API_URL}
            UPLOAD_URL={a.UPLOAD_URL}
            toast={a.toast}
          />
        )}

        {(a.activeTab === 'results' || a.activeTab === 'reviews') && (
          <AdminResultsAndReviewsTab
            activeTab={a.activeTab}
            filteredResults={a.filteredResults}
            resultFilters={a.resultFilters}
            setResultFilters={a.setResultFilters}
            isResultModalOpen={a.isResultModalOpen}
            setIsResultModalOpen={a.setIsResultModalOpen}
            editingResult={a.editingResult}
            setEditingResult={a.setEditingResult}
            handleSaveResult={a.handleSaveResult}
            handleDeleteResult={a.handleDeleteResult}
            reviews={a.reviews}
            loadReviews={a.loadReviews}
            REVIEWS_API_URL={a.REVIEWS_API_URL}
            toast={a.toast}
          />
        )}

        {a.activeTab === 'certificates' && (
          <AdminCertificatesTab
            certificatesLog={a.certificatesLog}
            certLoading={a.certLoading}
            onRefresh={a.loadCertificates}
            onDownload={a.handleDownloadCertificate}
          />
        )}

        {a.activeTab === 'settings' && (
          <AdminSettingsTab
            uploadingAppForm={a.uploadingAppForm}
            applicationFormUrl={a.applicationFormUrl}
            onUploadFile={a.handleUploadAppForm}
            onDeleteForm={a.handleDeleteAppForm}
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
