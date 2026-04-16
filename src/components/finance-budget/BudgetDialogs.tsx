import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import type { Category, Transaction, BudgetItem, CashGapWarning, PlannedItem } from '@/data/financeBudgetTypes';
import { formatMoney } from '@/data/financeBudgetTypes';

interface BudgetDialogsProps {
  showAddTx: boolean;
  setShowAddTx: (v: boolean) => void;
  txType: 'expense' | 'income';
  setTxType: (v: 'expense' | 'income') => void;
  txAmount: string;
  setTxAmount: (v: string) => void;
  txDesc: string;
  setTxDesc: (v: string) => void;
  txCategoryId: string;
  setTxCategoryId: (v: string) => void;
  txAccountId: string;
  setTxAccountId: (v: string) => void;
  txDate: string;
  setTxDate: (v: string) => void;
  saving: boolean;
  filteredCategories: Category[];
  accounts: { id: string; name: string; is_active: boolean }[];
  addTransaction: () => void;

  showBudgetDialog: boolean;
  closeBudgetDialog: () => void;
  budgetCategoryId: string;
  setBudgetCategoryId: (v: string) => void;
  budgetAmount: string;
  setBudgetAmount: (v: string) => void;
  editBudget: BudgetItem | null;
  expenseCategories: Category[];
  saveBudget: () => void;

  editTx: Transaction | null;
  setEditTx: (v: Transaction | null) => void;
  updateTransaction: () => void;

  cashGapWarning: CashGapWarning | null;
  setCashGapWarning: (v: CashGapWarning | null) => void;
  executeAddTransaction: () => void;
  executeUpdateTransaction: () => void;
  executeConfirmPlanned: (item: PlannedItem, accountId?: string) => void;

  confirmAccountDialog: { item: PlannedItem; accountId: string } | null;
  setConfirmAccountDialog: (v: { item: PlannedItem; accountId: string } | null) => void;
}

export default function BudgetDialogs({
  showAddTx, setShowAddTx, txType, setTxType,
  txAmount, setTxAmount, txDesc, setTxDesc,
  txCategoryId, setTxCategoryId,
  txAccountId, setTxAccountId,
  txDate, setTxDate,
  saving, filteredCategories, accounts, addTransaction,
  showBudgetDialog, closeBudgetDialog,
  budgetCategoryId, setBudgetCategoryId,
  budgetAmount, setBudgetAmount,
  editBudget, expenseCategories, saveBudget,
  editTx, setEditTx, updateTransaction,
  cashGapWarning, setCashGapWarning,
  executeAddTransaction, executeUpdateTransaction, executeConfirmPlanned,
  confirmAccountDialog, setConfirmAccountDialog,
}: BudgetDialogsProps) {
  return (
    <>
      <Dialog open={showAddTx} onOpenChange={setShowAddTx}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Новая запись</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button variant={txType === 'expense' ? 'default' : 'outline'}
                className={`flex-1 ${txType === 'expense' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                onClick={() => { setTxType('expense'); setTxCategoryId(''); }}>
                <Icon name="TrendingDown" size={16} className="mr-1" /> Расход
              </Button>
              <Button variant={txType === 'income' ? 'default' : 'outline'}
                className={`flex-1 ${txType === 'income' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                onClick={() => { setTxType('income'); setTxCategoryId(''); }}>
                <Icon name="TrendingUp" size={16} className="mr-1" /> Доход
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Сумма, &#8381;</label>
              <Input type="number" inputMode="decimal" placeholder="0"
                value={txAmount} onChange={e => setTxAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Категория</label>
              <Select value={txCategoryId} onValueChange={setTxCategoryId}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {accounts.filter(a => a.is_active).length > 1 && (
              <div>
                <label className="text-sm font-medium mb-1 block">Счёт</label>
                <Select value={txAccountId || 'auto'} onValueChange={v => setTxAccountId(v === 'auto' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="По умолчанию" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">По умолчанию</SelectItem>
                    {accounts.filter(a => a.is_active).map(a => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Input placeholder="Комментарий (необязательно)"
                value={txDesc} onChange={e => setTxDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Дата</label>
              <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addTransaction} disabled={saving}
              className={txType === 'income' ? 'bg-green-600 hover:bg-green-700 w-full' : 'bg-red-600 hover:bg-red-700 w-full'}>
              {saving ? 'Сохраняю...' : txType === 'income' ? 'Добавить доход' : 'Добавить расход'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBudgetDialog} onOpenChange={(open) => { if (!open) closeBudgetDialog(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editBudget ? 'Редактировать лимит' : 'Установить лимит'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Категория расходов</label>
              <Select value={budgetCategoryId} onValueChange={setBudgetCategoryId} disabled={!!editBudget}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {expenseCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Лимит на месяц, &#8381;</label>
              <Input type="number" inputMode="decimal" placeholder="25000"
                value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} autoFocus />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveBudget} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 w-full">
              {saving ? 'Сохраняю...' : editBudget ? 'Сохранить' : 'Установить лимит'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTx} onOpenChange={(open) => { if (!open) setEditTx(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Редактировать запись</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Сумма, &#8381;</label>
              <Input type="number" inputMode="decimal" placeholder="0"
                value={txAmount} onChange={e => setTxAmount(e.target.value)} autoFocus />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Категория</label>
              <Select value={txCategoryId} onValueChange={setTxCategoryId}>
                <SelectTrigger><SelectValue placeholder="Выберите категорию" /></SelectTrigger>
                <SelectContent>
                  {filteredCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Описание</label>
              <Input placeholder="Комментарий"
                value={txDesc} onChange={e => setTxDesc(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Дата</label>
              <Input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={updateTransaction} disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 w-full">
              {saving ? 'Сохраняю...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cashGapWarning?.show === true} onOpenChange={(open) => { if (!open) setCashGapWarning(null); }}>
        <AlertDialogContent className="max-w-sm z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={20} className="text-red-500" />
              Внимание: кассовый разрыв!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              Этот расход приведёт к отрицательному балансу{' '}
              <span className="font-bold text-red-600">
                {cashGapWarning ? formatMoney(cashGapWarning.gapAmount) : 0} &#8381;
              </span>{' '}
              на дату{' '}
              <span className="font-bold">{cashGapWarning?.gapDate}</span>.
              {' '}Это значит, что на счетах может не хватить средств для покрытия всех расходов.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCashGapWarning(null)}>
              Отменить
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                const warning = cashGapWarning;
                setCashGapWarning(null);
                if (warning?.action === 'add') {
                  executeAddTransaction();
                } else if (warning?.action === 'edit') {
                  executeUpdateTransaction();
                } else if (warning?.action === 'confirm' && warning.confirmData) {
                  executeConfirmPlanned(warning.confirmData);
                }
              }}
            >
              Всё равно добавить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!confirmAccountDialog} onOpenChange={(open) => { if (!open) setConfirmAccountDialog(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Выберите счёт</DialogTitle>
          </DialogHeader>
          {confirmAccountDialog && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {confirmAccountDialog.item.type === 'income' ? 'Куда зачислить' : 'С какого счёта списать'}{' '}
                <span className="font-semibold">{formatMoney(confirmAccountDialog.item.amount)} ₽</span>
                {confirmAccountDialog.item.description ? ` (${confirmAccountDialog.item.description})` : ''}?
              </p>
              <Select
                value={confirmAccountDialog.accountId}
                onValueChange={(v) => setConfirmAccountDialog({ ...confirmAccountDialog, accountId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {accounts.filter(a => a.is_active).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmAccountDialog(null)}>Отмена</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => {
                if (!confirmAccountDialog) return;
                const { item, accountId } = confirmAccountDialog;
                setConfirmAccountDialog(null);
                executeConfirmPlanned(item, accountId);
              }}>
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}