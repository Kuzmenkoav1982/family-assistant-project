import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

interface PiggyBankManagerProps {
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
}

export function PiggyBankManager({ balance, onUpdateBalance }: PiggyBankManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plannedExpenses, setPlannedExpenses] = useState<Array<{id: string; title: string; amount: number}>>([]);
  const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);

  const addTransaction = (type: 'income' | 'expense', amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      date: new Date().toLocaleDateString('ru-RU')
    };

    setTransactions([newTransaction, ...transactions]);
    
    if (type === 'income') {
      onUpdateBalance(balance + amount);
    } else {
      onUpdateBalance(Math.max(0, balance - amount));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Icon name="PiggyBank" className="text-pink-500" />
          Моя копилка
        </h3>
      </div>

      <Card className="bg-gradient-to-br from-pink-50 to-purple-50">
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
              <Icon name="Wallet" size={36} className="text-white" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Мой баланс</p>
          <p className="text-4xl font-bold text-pink-600 mb-4">{balance} ₽</p>
          
          <div className="flex gap-2">
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-md">
                  <Icon name="TrendingUp" className="mr-2" size={18} />
                  Пополнить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Пополнить копилку</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const amount = Number(formData.get('amount'));
                  const description = formData.get('description') as string;
                  addTransaction('income', amount, description);
                  (e.target as HTMLFormElement).reset();
                  setIsIncomeDialogOpen(false);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Сумма (₽) *</label>
                    <Input name="amount" type="number" min="1" required placeholder="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Откуда *</label>
                    <Input name="description" required placeholder="Карманные деньги, подарок..." />
                  </div>
                  <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
                    Добавить
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-md">
                  <Icon name="TrendingDown" className="mr-2" size={18} />
                  Потратить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Потратить деньги</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const amount = Number(formData.get('amount'));
                  const description = formData.get('description') as string;
                  
                  if (amount > balance) {
                    alert('У тебя недостаточно денег!');
                    return;
                  }
                  
                  addTransaction('expense', amount, description);
                  (e.target as HTMLFormElement).reset();
                  setIsExpenseDialogOpen(false);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Сумма (₽) *</label>
                    <Input name="amount" type="number" min="1" max={balance} required placeholder="50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">На что *</label>
                    <Input name="description" required placeholder="Игрушка, сладости..." />
                  </div>
                  <Button type="submit" className="w-full bg-red-500 hover:bg-red-600">
                    Потратить
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon name="ShoppingBag" size={16} className="text-purple-500" />
              Планы на покупки
            </CardTitle>
            <p className="text-xs text-muted-foreground">Список того, что хочешь купить. Добавляй желаемые покупки и отслеживай, когда накопишь достаточно!</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="w-full border-purple-200 hover:bg-purple-50">
                <Icon name="ShoppingCart" className="mr-2" size={16} />
                Запланировать покупку
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новая покупка</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                setPlannedExpenses([
                  ...plannedExpenses,
                  {
                    id: Date.now().toString(),
                    title: formData.get('title') as string,
                    amount: Number(formData.get('amount'))
                  }
                ]);
                (e.target as HTMLFormElement).reset();
                setIsPlanDialogOpen(false);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Что хочу купить *</label>
                  <Input name="title" required placeholder="Новая игрушка" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Сколько стоит (₽) *</label>
                  <Input name="amount" type="number" min="1" required placeholder="500" />
                </div>
                <Button type="submit" className="w-full">Добавить в планы</Button>
              </form>
            </DialogContent>
          </Dialog>

          {plannedExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <div className="flex-1">
                <p className="font-medium text-sm">{expense.title}</p>
                <p className="text-xs text-muted-foreground">{expense.amount} ₽</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={balance >= expense.amount ? "default" : "secondary"}>
                  {balance >= expense.amount ? '✅ Могу купить' : `Еще ${expense.amount - balance} ₽`}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setPlannedExpenses(plannedExpenses.filter(e => e.id !== expense.id))}
                >
                  <Icon name="X" size={16} className="text-gray-400 hover:text-red-500" />
                </Button>
              </div>
            </div>
          ))}
          
          {plannedExpenses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Пока нет запланированных покупок
            </p>
          )}
        </CardContent>
      </Card>

      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon name="History" size={16} />
              История операций
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-2 border-b last:border-0">
                <div className="flex items-center gap-2">
                  <Icon 
                    name={transaction.type === 'income' ? 'ArrowDown' : 'ArrowUp'} 
                    size={14}
                    className={transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}
                  />
                  <div>
                    <p className="text-sm font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{transaction.date}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount} ₽
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}