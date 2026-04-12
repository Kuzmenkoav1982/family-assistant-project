import SEOHead from "@/components/SEOHead";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceDebtsInstructions } from '@/components/finance/FinanceInstructions';
import useFinanceDebts from '@/hooks/useFinanceDebts';
import DebtsList from '@/components/finance-debts/DebtsList';
import DebtDetailView from '@/components/finance-debts/DebtDetailView';
import DebtDialogs from '@/components/finance-debts/DebtDialogs';

export default function FinanceDebts() {
  const navigate = useNavigate();
  const isOwner = useIsFamilyOwner();
  const d = useFinanceDebts();

  if (d.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24">
        <div className="text-center p-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={32} className="text-red-500" />
          </div>
          <h2 className="text-lg font-bold mb-2">Доступ ограничен</h2>
          <p className="text-sm text-muted-foreground mb-4">Этот раздел доступен только владельцу семьи</p>
          <Button onClick={() => navigate('/finance')}>Вернуться к финансам</Button>
        </div>
      </div>
    );
  }

  if (d.selectedDebt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-24">
        <div className="max-w-2xl mx-auto p-4 space-y-4">
          <DebtDetailView
            debt={d.selectedDebt}
            payments={d.payments}
            simPayment={d.simPayment}
            setSimPayment={d.setSimPayment}
            onBack={() => d.setSelectedDebt(null)}
            onEdit={() => d.openEditDebt(d.selectedDebt!)}
            onDelete={() => d.deleteDebt(d.selectedDebt!.id)}
            onMarkPaid={() => d.markPaid(d.selectedDebt!.id)}
            onAddPayment={() => d.setShowPayment(true)}
          />

          <DebtDialogs
            showAdd={false}
            setShowAdd={d.setShowAdd}
            form={d.form}
            setForm={d.setForm}
            saving={d.saving}
            addDebt={d.addDebt}
            editDebt={d.editDebt}
            setEditDebt={d.setEditDebt}
            updateDebt={d.updateDebt}
            showPayment={d.showPayment}
            setShowPayment={d.setShowPayment}
            payAmount={d.payAmount}
            setPayAmount={d.setPayAmount}
            payDate={d.payDate}
            setPayDate={d.setPayDate}
            payExtra={d.payExtra}
            setPayExtra={d.setPayExtra}
            payNotes={d.payNotes}
            setPayNotes={d.setPayNotes}
            addPayment={d.addPayment}
            selectedDebt={d.selectedDebt}
          />
        </div>
      </div>
    );
  }

  return (
    <>
    <SEOHead title="Кредиты и долги — управление задолженностями" description="Учёт кредитов, ипотеки и долгов семьи. График платежей, остаток долга, стратегии погашения." path="/finance/debts" breadcrumbs={[{ name: "Финансы", path: "/finance" }, { name: "Кредиты и долги", path: "/finance/debts" }]} />
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Кредиты и долги"
          subtitle="Ипотека, кредиты и управление долгами"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/4cd90e85-8966-4402-84ce-6475cc940f22.jpg"
          backPath="/finance"
          rightAction={
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={() => d.setShowAdd(true)}>
              <Icon name="Plus" size={16} className="mr-1" /> Добавить
            </Button>
          }
        />

        <FinanceDebtsInstructions />

        <DebtsList
          debts={d.debts}
          totalRemaining={d.totalRemaining}
          totalMonthly={d.totalMonthly}
          onSelect={d.setSelectedDebt}
        />
      </div>

      <DebtDialogs
        showAdd={d.showAdd}
        setShowAdd={d.setShowAdd}
        form={d.form}
        setForm={d.setForm}
        saving={d.saving}
        addDebt={d.addDebt}
        editDebt={d.editDebt}
        setEditDebt={d.setEditDebt}
        updateDebt={d.updateDebt}
        showPayment={d.showPayment}
        setShowPayment={d.setShowPayment}
        payAmount={d.payAmount}
        setPayAmount={d.setPayAmount}
        payDate={d.payDate}
        setPayDate={d.setPayDate}
        payExtra={d.payExtra}
        setPayExtra={d.setPayExtra}
        payNotes={d.payNotes}
        setPayNotes={d.setPayNotes}
        addPayment={d.addPayment}
        selectedDebt={d.selectedDebt}
      />
    </div>
    </>
  );
}