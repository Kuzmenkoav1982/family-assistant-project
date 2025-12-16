import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface MoneyTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  source: string;
  description?: string;
  date: string;
}

interface RealMoneyPiggyBankProps {
  childId: string;
}

export function RealMoneyPiggyBank({ childId }: RealMoneyPiggyBankProps) {
  const [transactions, setTransactions] = useState<MoneyTransaction[]>([
    {
      id: '1',
      type: 'income',
      amount: 1000,
      source: 'День рождения',
      description: 'Подарок от бабушки и дедушки',
      date: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: '2',
      type: 'income',
      amount: 500,
      source: 'Карманные деньги',
      description: 'За хорошие оценки',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: '3',
      type: 'expense',
      amount: 300,
      source: 'Покупка',
      description: 'Новая игрушка',
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ]);

  const [addDialog, setAddDialog] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');

  const balance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const handleAddTransaction = () => {
    if (!amount || !source) return;

    const newTransaction: MoneyTransaction = {
      id: Date.now().toString(),
      type: transactionType,
      amount: parseFloat(amount),
      source,
      description,
      date: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setSource('');
    setDescription('');
    setAddDialog(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const sourceOptions = {
    income: ['День рождения', 'Новый год', 'Карманные деньги', 'Подарок', 'За помощь', 'Другое'],
    expense: ['Покупка игрушки', 'Сладости', 'Книги', 'Развлечения', 'Накопления', 'Другое'],
  };

  return (
    <div className="space-y-6">
      {/* Общий баланс */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-4xl">💰</span>
            <div>
              <div className="text-2xl font-bold">Копилка настоящих денег</div>
              <div className="text-sm font-normal text-gray-600">Учёт реальных средств</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-2xl mb-4">
              <span className="text-6xl">🏦</span>
            </div>
            <div className="text-6xl font-bold text-green-600 mb-2">
              {balance} ₽
            </div>
            <p className="text-lg text-gray-700 mb-6">
              {balance === 0 && 'Начни копить! 💪'}
              {balance > 0 && balance < 1000 && 'Отличное начало! 🌟'}
              {balance >= 1000 && balance < 5000 && 'Здорово! Продолжай копить! 🎉'}
              {balance >= 5000 && 'Вау! Настоящий накопитель! 🏆'}
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="text-3xl mb-2">💵</div>
                <div className="text-sm text-gray-600">Получено</div>
                <div className="text-xl font-bold text-green-600">{totalIncome} ₽</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="text-3xl mb-2">💸</div>
                <div className="text-sm text-gray-600">Потрачено</div>
                <div className="text-xl font-bold text-red-600">{totalExpense} ₽</div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Dialog open={addDialog && transactionType === 'income'} onOpenChange={(open) => {
                setAddDialog(open);
                if (open) setTransactionType('income');
              }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-green-600 hover:bg-green-700">
                    <Icon name="Plus" size={16} />
                    Добавить поступление
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>💵 Добавить поступление</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Сумма (₽) *</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Например: 1000"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Источник *</label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="">Выбери источник</option>
                        {sourceOptions.income.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание</label>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Например: Подарок от бабушки"
                      />
                    </div>
                    <Button onClick={handleAddTransaction} className="w-full bg-green-600 hover:bg-green-700">
                      Добавить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={addDialog && transactionType === 'expense'} onOpenChange={(open) => {
                setAddDialog(open);
                if (open) setTransactionType('expense');
              }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Icon name="Minus" size={16} />
                    Добавить расход
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>💸 Добавить расход</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Сумма (₽) *</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Например: 500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">На что потрачено *</label>
                      <select
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full border rounded-md p-2"
                      >
                        <option value="">Выбери категорию</option>
                        {sourceOptions.expense.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание</label>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Например: Новая игрушка"
                      />
                    </div>
                    <Button onClick={handleAddTransaction} className="w-full">
                      Добавить расход
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* История транзакций */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="History" size={20} className="text-blue-600" />
            История ({transactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-3">📝</div>
              <p>История пока пуста</p>
              <p className="text-sm">Добавь первое поступление!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`flex items-start justify-between p-4 rounded-lg border-2 ${
                    transaction.type === 'income'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-3xl">
                      {transaction.type === 'income' ? '💵' : '💸'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{transaction.source}</h4>
                        <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                          {transaction.type === 'income' ? 'Поступление' : 'Расход'}
                        </Badge>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 mb-2">{transaction.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount} ₽
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
