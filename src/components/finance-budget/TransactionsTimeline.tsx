import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { TimelineData, PlannedItem, Transaction } from '@/data/financeBudgetTypes';
import { formatMoney } from '@/data/financeBudgetTypes';

interface TransactionsTimelineProps {
  timeline: TimelineData;
  accountBalance: number;
  confirmingIds: Set<string>;
  onConfirmPlanned: (item: PlannedItem) => void;
  onConfirmTx: (txId: string, isConfirmed: boolean) => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (id: string) => void;
  onAddNew: () => void;
  onEditPlannedRecurring?: () => void;
  onDeletePlannedRecurring?: (sourceId: string) => void;
  onPausePlannedRecurring?: (sourceId: string) => void;
  hidePastPlanned?: boolean;
  onToggleHidePastPlanned?: () => void;
}

export default function TransactionsTimeline({
  timeline, accountBalance, confirmingIds,
  onConfirmPlanned, onConfirmTx, onEditTx, onDeleteTx, onAddNew,
  onEditPlannedRecurring, onDeletePlannedRecurring, onPausePlannedRecurring,
  hidePastPlanned, onToggleHidePastPlanned,
}: TransactionsTimelineProps) {
  const [showConfirmed, setShowConfirmed] = useState(false);
  const [confirmingTxIds, setConfirmingTxIds] = useState<Set<string>>(new Set());

  const handleConfirmTx = (tx: Transaction) => {
    const newVal = !tx.is_confirmed;
    setConfirmingTxIds(prev => new Set(prev).add(tx.id));
    onConfirmTx(tx.id, newVal);
    setTimeout(() => {
      setConfirmingTxIds(prev => { const next = new Set(prev); next.delete(tx.id); return next; });
    }, 800);
  };

  const filteredGroups = timeline.groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (item.isPlanned) return true;
      if (item.originalTx?.is_confirmed && !showConfirmed) return false;
      return true;
    })
  })).filter(group => group.items.length > 0);

  const confirmedItems = timeline.groups.flatMap(g =>
    g.items.filter(i => !i.isPlanned && i.originalTx?.is_confirmed)
  );
  const confirmedCount = confirmedItems.length;
  const confirmedIncome = confirmedItems.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
  const confirmedExpense = confirmedItems.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-1">
      {timeline.cashGap && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200 mb-2">
          <Icon name="AlertTriangle" size={16} className="text-red-500 flex-shrink-0" />
          <div className="text-xs text-red-700">
            <span className="font-bold">Кассовый разрыв:</span>{' '}
            <span>{timeline.cashGap.date}</span> — баланс уходит до{' '}
            <span className="font-bold">{formatMoney(timeline.cashGap.amount)} &#8381;</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
        <Icon name="Wallet" size={14} />
        <span>Текущий баланс на счетах:</span>
        <span className="font-bold text-foreground">{formatMoney(accountBalance)} &#8381;</span>
      </div>

      {onToggleHidePastPlanned && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 text-muted-foreground w-full justify-start"
          onClick={onToggleHidePastPlanned}
          title="Скрыть/показать регулярные платежи и платежи по долгам за прошедшие даты"
        >
          <Icon name={hidePastPlanned ? 'EyeOff' : 'Eye'} size={14} className="mr-1.5" />
          {hidePastPlanned ? 'Показать прошлые плановые' : 'Скрыть прошлые плановые'}
        </Button>
      )}

      {confirmedCount > 0 && (
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 text-muted-foreground"
            onClick={() => setShowConfirmed(!showConfirmed)}
          >
            <Icon name={showConfirmed ? "EyeOff" : "Eye"} size={14} className="mr-1" />
            {showConfirmed ? 'Скрыть подтверждённые' : `Показать подтверждённые (${confirmedCount})`}
          </Button>
          {!showConfirmed && (
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <Icon name="CheckSquare" size={14} className="text-emerald-500 flex-shrink-0" />
              <span className="text-emerald-700">
                Учтено за месяц: {confirmedIncome > 0 && <span className="text-green-600 font-medium">+{formatMoney(confirmedIncome)} ₽</span>}
                {confirmedIncome > 0 && confirmedExpense > 0 && ', '}
                {confirmedExpense > 0 && <span className="text-red-600 font-medium">−{formatMoney(confirmedExpense)} ₽</span>}
              </span>
            </div>
          )}
        </div>
      )}

      {filteredGroups.length === 0 && confirmedCount === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Icon name="FileText" size={40} className="mx-auto mb-2 text-gray-300" />
          <p className="text-sm">Нет операций за этот месяц</p>
          <Button size="sm" className="mt-3 bg-emerald-600 hover:bg-emerald-700" onClick={onAddNew}>
            <Icon name="Plus" size={14} className="mr-1" /> Добавить первую запись
          </Button>
        </div>
      ) : filteredGroups.length === 0 && confirmedCount > 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Icon name="CheckCircle" size={40} className="mx-auto mb-2 text-emerald-300" />
          <p className="text-sm">Все операции подтверждены</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filteredGroups.map((group, gi) => {
            const origGi = timeline.groups.findIndex(g => g.dateKey === group.dateKey);
            const showNowDivider = !group.isPast && !group.isToday &&
              (origGi === 0 || timeline.groups[origGi - 1]?.isPast || timeline.groups[origGi - 1]?.isToday);
            return (
              <div key={group.dateKey}>
                {showNowDivider && (
                  <div className="flex items-center gap-2 py-3">
                    <div className="flex-1 h-px bg-blue-400" />
                    <span className="text-xs font-bold text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full border border-blue-200">СЕЙЧАС</span>
                    <div className="flex-1 h-px bg-blue-400" />
                  </div>
                )}
                <div className={`flex items-center gap-2 pt-3 pb-1 px-1 ${group.isToday ? 'text-blue-700' : group.isPast ? 'text-muted-foreground' : 'text-foreground'}`}>
                  <span className={`text-xs font-semibold ${group.isToday ? 'text-blue-600' : ''}`}>{group.dateLabel}</span>
                  {group.isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                </div>
                <div className="space-y-1.5">
                  {group.items.map(item => {
                    const isTxConfirmed = !item.isPlanned && item.originalTx?.is_confirmed;
                    const isTxConfirming = item.originalTx && confirmingTxIds.has(item.originalTx.id);
                    return (
                      <div key={item.id}>
                        <Card className={`overflow-hidden transition-all duration-300 ${
                          item.isPlanned
                            ? (confirmingIds.has(item.originalPlanned?.id || '')
                                ? 'border-solid border-emerald-400 bg-emerald-50/40'
                                : 'border-dashed border-amber-300 bg-amber-50/30')
                            : isTxConfirmed
                              ? 'border-emerald-200 bg-emerald-50/30 opacity-60'
                              : item.isGap ? 'border-red-300 bg-red-50/30' : ''
                        }`}>
                          <CardContent className="p-0">
                            <div className="flex items-center">
                              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 ml-1"
                                style={{ backgroundColor: item.isPlanned && item.source === 'debt' ? '#EF444420' : (item.category_color || (item.isPlanned ? '#F59E0B' : '#6B7280')) + '20' }}>
                                <Icon name={
                                  item.isPlanned && item.source === 'debt'
                                    ? (item.debt_type === 'mortgage' ? 'Home' : item.debt_type === 'car_loan' ? 'Car' : 'Landmark')
                                    : (item.category_icon || (item.type === 'income' ? 'TrendingUp' : 'TrendingDown'))
                                } size={18} style={{ color: item.isPlanned && item.source === 'debt' ? '#EF4444' : (item.category_color || (item.isPlanned ? '#F59E0B' : '#6B7280')) }} />
                              </div>
                              <div className="flex-1 px-2 py-1.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-sm font-medium truncate ${isTxConfirmed ? 'line-through text-muted-foreground' : ''}`}>{item.description}</span>
                                  {item.isPlanned && (
                                    <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-400 text-amber-600">
                                      {item.source === 'debt' ? 'долг' : 'регуляр.'}
                                    </Badge>
                                  )}
                                  {!item.isPlanned && item.originalTx?.source_type === 'home_utility' && (
                                    <a
                                      href="/home-hub"
                                      onClick={e => e.stopPropagation()}
                                      title="Перейти к коммунальным платежам в разделе «Дом»"
                                      className="inline-flex"
                                    >
                                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 inline-flex items-center gap-0.5 cursor-pointer">
                                        <Icon name="Home" size={9} />
                                        из «Дома»
                                      </Badge>
                                    </a>
                                  )}
                                  {!item.isPlanned && item.originalTx?.source_type === 'shopping' && (
                                    <a
                                      href="/shopping"
                                      onClick={e => e.stopPropagation()}
                                      title="Перейти к списку покупок"
                                      className="inline-flex"
                                    >
                                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 inline-flex items-center gap-0.5 cursor-pointer">
                                        <Icon name="ShoppingCart" size={9} />
                                        из «Покупок»
                                      </Badge>
                                    </a>
                                  )}
                                  {isTxConfirmed && (
                                    <Icon name="CheckCircle" size={14} className="text-emerald-500 flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                  {item.category_name && <span>{item.category_name}</span>}
                                  {item.bank_name && <span>{item.bank_name}</span>}
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0 pr-1">
                                <p className={`font-bold text-sm ${item.type === 'income' ? 'text-green-600' : 'text-red-600'} ${item.isPlanned && !confirmingIds.has(item.originalPlanned?.id || '') ? 'opacity-60' : ''}`}>
                                  {item.type === 'income' ? '+' : '\u2212'}{formatMoney(item.amount)} &#8381;
                                </p>
                                <p className={`text-[10px] font-medium ${item.isGap ? 'text-red-600 font-bold' : 'text-muted-foreground'}`}>
                                  → {formatMoney(item.runningBalance)} &#8381;
                                </p>
                              </div>
                              {item.isPlanned && item.originalPlanned ? (
                                <div className="flex flex-shrink-0 items-center">
                                  <Button variant="ghost" size="sm"
                                    className={`p-0 h-8 w-8 transition-all duration-300 ${confirmingIds.has(item.originalPlanned.id) ? 'text-emerald-600 scale-110' : 'text-gray-400 hover:text-emerald-600'}`}
                                    title="Подтвердить"
                                    disabled={confirmingIds.has(item.originalPlanned.id)}
                                    onClick={() => onConfirmPlanned(item.originalPlanned!)}>
                                    <Icon name={confirmingIds.has(item.originalPlanned.id) ? "CheckSquare" : "Square"} size={18} />
                                  </Button>
                                  {item.source === 'recurring' && onEditPlannedRecurring && (
                                    <Button variant="ghost" size="sm" className="p-0 h-7 w-7 text-gray-400 hover:text-blue-500"
                                      title="Изменить регулярный платёж"
                                      onClick={(e) => { e.stopPropagation(); onEditPlannedRecurring(); }}>
                                      <Icon name="Pencil" size={13} />
                                    </Button>
                                  )}
                                  {item.source === 'recurring' && item.originalPlanned.source_id && onDeletePlannedRecurring && (
                                    <Button variant="ghost" size="sm" className="mr-1 p-0 h-7 w-7 text-gray-400 hover:text-red-500"
                                      title="Удалить регулярный платёж"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Удалить регулярный платёж? Все будущие записи исчезнут из бюджета.')) {
                                          onDeletePlannedRecurring(item.originalPlanned!.source_id);
                                        }
                                      }}>
                                      <Icon name="Trash2" size={13} />
                                    </Button>
                                  )}
                                </div>
                              ) : item.originalTx ? (
                                <div className="flex flex-shrink-0 items-center">
                                  <Button variant="ghost" size="sm"
                                    className={`p-0 h-8 w-8 transition-all duration-300 ${
                                      isTxConfirmed || isTxConfirming
                                        ? 'text-emerald-600 scale-110'
                                        : 'text-gray-400 hover:text-emerald-600'
                                    }`}
                                    title={isTxConfirmed ? "Снять отметку" : "Подтвердить платёж"}
                                    disabled={!!isTxConfirming}
                                    onClick={(e) => { e.stopPropagation(); handleConfirmTx(item.originalTx!); }}>
                                    <Icon name={isTxConfirmed || isTxConfirming ? "CheckSquare" : "Square"} size={18} />
                                  </Button>
                                  {!isTxConfirmed && (
                                    <>
                                      <Button variant="ghost" size="sm" className="p-0 h-7 w-7 text-gray-400 hover:text-blue-500"
                                        onClick={(e) => { e.stopPropagation(); onEditTx(item.originalTx!); }}>
                                        <Icon name="Pencil" size={13} />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="mr-1 p-0 h-7 w-7 text-gray-400 hover:text-red-500"
                                        onClick={(e) => { e.stopPropagation(); onDeleteTx(item.originalTx!.id); }}>
                                        <Icon name="Trash2" size={13} />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          </CardContent>
                        </Card>
                        {item.isGap && item.runningBalance < 0 && (
                          <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-red-600 font-medium">
                            <Icon name="AlertTriangle" size={12} />
                            <span>Кассовый разрыв! Недостаточно средств</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex items-center gap-2 pt-4 pb-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-muted-foreground px-2">конец месяца</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <Card className={`border-2 ${
            timeline.groups.length > 0 && timeline.groups[timeline.groups.length - 1].items[timeline.groups[timeline.groups.length - 1].items.length - 1]?.runningBalance >= 0
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-red-200 bg-red-50/50'
          }`}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">Прогноз баланса на конец месяца</p>
              <p className={`text-xl font-bold ${
                (timeline.groups.length > 0 && timeline.groups[timeline.groups.length - 1].items[timeline.groups[timeline.groups.length - 1].items.length - 1]?.runningBalance >= 0)
                  ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {formatMoney(
                  timeline.groups.length > 0
                    ? timeline.groups[timeline.groups.length - 1].items[timeline.groups[timeline.groups.length - 1].items.length - 1]?.runningBalance || 0
                    : accountBalance
                )} &#8381;
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}