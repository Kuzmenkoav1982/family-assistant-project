import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { categoryLabels } from '../eventDetailsConstants';
import type { EventExpense } from '@/types/events';

interface Props {
  expenses: EventExpense[];
  expensesLoading: boolean;
  onShowAddExpense: () => void;
  fetchExpenses: () => void;
}

export default function ExpensesTab({ expenses, expensesLoading, onShowAddExpense, fetchExpenses }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Расходы</CardTitle>
        <Button onClick={() => { onShowAddExpense(); fetchExpenses(); }}>
          <Icon name="Plus" size={16} />
          Добавить расход
        </Button>
      </CardHeader>
      <CardContent>
        {expensesLoading ? (
          <div className="flex justify-center py-8">
            <Icon name="Loader2" className="animate-spin" size={24} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Wallet" size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Расходов пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{expense.title}</p>
                  <p className="text-sm text-gray-600">
                    {categoryLabels[expense.category] || expense.category}
                  </p>
                </div>
                <p className="text-lg font-bold">
                  {expense.amount.toLocaleString('ru-RU')} ₽
                </p>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between text-lg font-bold">
                <span>Итого:</span>
                <span>
                  {expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
