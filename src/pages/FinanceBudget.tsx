import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import SectionHero from '@/components/ui/section-hero';
import { useIsFamilyOwner } from '@/hooks/useIsFamilyOwner';
import { FinanceBudgetInstructions } from '@/components/finance/FinanceInstructions';
import useFinanceBudget from '@/hooks/useFinanceBudget';
import BalanceCard from '@/components/finance-budget/BalanceCard';
import SummaryCards from '@/components/finance-budget/SummaryCards';
import TransactionsTimeline from '@/components/finance-budget/TransactionsTimeline';
import BudgetsTab from '@/components/finance-budget/BudgetsTab';
import AnalyticsTab from '@/components/finance-budget/AnalyticsTab';
import BudgetDialogs from '@/components/finance-budget/BudgetDialogs';

export default function FinanceBudget() {
  const navigate = useNavigate();
  const isOwner = useIsFamilyOwner();
  const budget = useFinanceBudget();

  if (budget.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-24">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <SectionHero
          title="Бюджет"
          subtitle="Доходы, расходы и планирование"
          imageUrl="https://cdn.poehali.dev/projects/bf14db2d-0cf1-4b4d-9257-4d617ffc1cc6/files/3811fe85-aff5-47a9-8059-48190f4100e4.jpg"
          backPath="/finance"
        />
        <FinanceBudgetInstructions />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/finance/recurring')}>
            <Icon name="Repeat" size={16} className="mr-1" /> Регулярные
          </Button>
          <Button size="sm" onClick={() => { budget.setTxType('expense'); budget.setShowAddTx(true); }}
            className="bg-emerald-600 hover:bg-emerald-700">
            <Icon name="Plus" size={16} className="mr-1" /> Запись
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={budget.prevMonth}>
            <Icon name="ChevronLeft" size={18} />
          </Button>
          <span className="font-medium capitalize">{budget.monthLabel}</span>
          <Button variant="ghost" size="sm" onClick={budget.nextMonth}>
            <Icon name="ChevronRight" size={18} />
          </Button>
        </div>

        <BalanceCard
          accountBalance={budget.accountBalance}
          accountCount={budget.accountCount}
          planIncome={budget.planIncome}
          planExpense={budget.planExpense}
          sumIncome={budget.sumIncome}
          sumExpense={budget.sumExpense}
        />

        <SummaryCards
          sumIncome={budget.sumIncome}
          sumExpense={budget.sumExpense}
          planIncome={budget.planIncome}
          planExpense={budget.planExpense}
        />

        <Tabs value={budget.tab} onValueChange={budget.setTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transactions">
              <Icon name="ArrowUpDown" size={14} className="mr-1" /> Операции
            </TabsTrigger>
            <TabsTrigger value="budgets">
              <Icon name="PieChart" size={14} className="mr-1" /> Лимиты
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <Icon name="BarChart3" size={14} className="mr-1" /> Аналитика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-2 mt-3">
            <div className="flex gap-1.5">
              {(['all', 'income', 'expense'] as const).map(f => (
                <Button key={f} size="sm"
                  variant={budget.txFilter === f ? 'default' : 'outline'}
                  className={`text-xs h-7 ${budget.txFilter === f ? 'bg-emerald-600' : ''}`}
                  onClick={() => budget.setTxFilter(f)}>
                  {f === 'all' ? 'Все' : f === 'income' ? 'Доходы' : 'Расходы'}
                </Button>
              ))}
            </div>
            <TransactionsTimeline
              timeline={budget.timeline}
              accountBalance={budget.accountBalance}
              confirmingIds={budget.confirmingIds}
              onConfirmPlanned={budget.confirmPlanned}
              onConfirmTx={budget.confirmTransaction}
              onEditTx={budget.openEditTx}
              onDeleteTx={budget.deleteTransaction}
              onAddNew={() => { budget.setTxType('expense'); budget.setShowAddTx(true); }}
            />
          </TabsContent>

          <TabsContent value="budgets" className="space-y-3 mt-3">
            <BudgetsTab
              budgets={budget.budgets}
              totalPlanned={budget.totalPlanned}
              totalSpent={budget.totalSpent}
              onAdd={() => budget.setShowBudgetDialog(true)}
              onEdit={budget.openEditBudget}
              onDelete={budget.deleteBudget}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4 mt-3">
            <AnalyticsTab
              transactions={budget.transactions}
              pieData={budget.pieData}
              historyData={budget.historyData}
              budgetChartData={budget.budgetChartData}
              analyticsRef={budget.analyticsRef}
              exporting={budget.exporting}
              exportPDF={budget.exportPDF}
            />
          </TabsContent>
        </Tabs>
      </div>

      <BudgetDialogs
        showAddTx={budget.showAddTx}
        setShowAddTx={budget.setShowAddTx}
        txType={budget.txType}
        setTxType={budget.setTxType}
        txAmount={budget.txAmount}
        setTxAmount={budget.setTxAmount}
        txDesc={budget.txDesc}
        setTxDesc={budget.setTxDesc}
        txCategoryId={budget.txCategoryId}
        setTxCategoryId={budget.setTxCategoryId}
        txDate={budget.txDate}
        setTxDate={budget.setTxDate}
        saving={budget.saving}
        filteredCategories={budget.filteredCategories}
        addTransaction={budget.addTransaction}
        showBudgetDialog={budget.showBudgetDialog}
        closeBudgetDialog={budget.closeBudgetDialog}
        budgetCategoryId={budget.budgetCategoryId}
        setBudgetCategoryId={budget.setBudgetCategoryId}
        budgetAmount={budget.budgetAmount}
        setBudgetAmount={budget.setBudgetAmount}
        editBudget={budget.editBudget}
        expenseCategories={budget.expenseCategories}
        saveBudget={budget.saveBudget}
        editTx={budget.editTx}
        setEditTx={budget.setEditTx}
        updateTransaction={budget.updateTransaction}
        cashGapWarning={budget.cashGapWarning}
        setCashGapWarning={budget.setCashGapWarning}
        executeAddTransaction={budget.executeAddTransaction}
        executeUpdateTransaction={budget.executeUpdateTransaction}
        executeConfirmPlanned={budget.executeConfirmPlanned}
      />
    </div>
  );
}