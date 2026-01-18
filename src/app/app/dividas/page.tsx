'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from '@/components/finance/CardUI';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';

export default function DividasPage() {
  const { state, isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [filter, setFilter] = useState('');

  // Calcular meses dinamicamente baseado na data atual
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  // Obter os próximos 4 meses a partir do mês atual
  const displayMonths = useMemo(() => {
    const result: { month: string; monthNum: number; year: number; key: string }[] = [];
    for (let i = 0; i < 4; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      result.push({
        month: months[monthIndex],
        monthNum: monthIndex + 1,
        year,
        key: monthKey,
      });
    }
    return result;
  }, [currentMonth, currentYear]);

  const debts = useMemo(() => {
    return state.transactions.filter((t) => t.type === 'debt');
  }, [state.transactions]);

  const monthlyData = useMemo(() => {
    const data = new Map<string, { paid: number; pending: number }>();
    const now = new Date();

    debts.forEach((debt) => {
      // Para cada mês que será exibido no gráfico
      displayMonths.forEach(({ key, monthNum, year }) => {
        let debtDate: Date | null = null;

        if (debt.monthlyPaymentDate) {
          // Dívida com pagamento mensal recorrente
          debtDate = new Date(
            `${year}-${String(monthNum).padStart(2, '0')}-${String(debt.monthlyPaymentDate).padStart(2, '0')}`
          );
        } else if (debt.date) {
          // Dívida única - verificar se cai neste mês
          const transactionDate = new Date(debt.date);
          if (
            transactionDate.getFullYear() === year &&
            transactionDate.getMonth() + 1 === monthNum
          ) {
            debtDate = transactionDate;
          }
        }

        if (debtDate) {
          const current = data.get(key) || { paid: 0, pending: 0 };

          if (debt.status === 'paid' && debtDate <= now) {
            current.paid += debt.value;
          } else if (debt.status === 'pending' || debtDate > now) {
            current.pending += debt.value;
          }

          data.set(key, current);
        }
      });
    });

    return data;
  }, [debts, displayMonths]);

  const summary = useMemo(() => {
    const totalOwed = debts.reduce((sum, d) => sum + d.value, 0);
    const totalPaid = debts.filter((d) => d.status === 'paid').reduce((sum, d) => sum + d.value, 0);
    const remaining = totalOwed - totalPaid;
    const monthlyPayment = debts.length > 0 ? debts[0].value : 0;
    const monthsToZero = monthlyPayment > 0 ? Math.ceil(remaining / monthlyPayment) : 0;

    return {
      totalOwed,
      totalPaid,
      monthsToZero,
    };
  }, [debts]);

  const maxBarValue = useMemo(() => {
    let max = 0;
    monthlyData.forEach((data) => {
      max = Math.max(max, data.paid + data.pending);
    });
    return max || 1;
  }, [monthlyData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageHeader
          title="Dívidas"
          icon="🔗"
          onFilterChange={setFilter}
          onAddClick={() => setIsSheetOpen(true)}
        />

        <div className="space-y-6">
          {/* Gráfico de Pagamentos */}
          <CardUI>
            <div className="mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 tracking-tight">Gráfico de Pagamentos</h3>
              <p className="text-xs text-gray-500 mt-1">Próximos 4 meses</p>
            </div>
            <div className="flex items-end gap-3 h-32 mb-6">
              {displayMonths.map(({ month, key }) => {
                const data = monthlyData.get(key) || { paid: 0, pending: 0 };
                const total = data.paid + data.pending;
                const paidHeight = maxBarValue > 0 ? (data.paid / maxBarValue) * 100 : 0;
                const pendingHeight = maxBarValue > 0 ? (data.pending / maxBarValue) * 100 : 0;
                const isCurrentMonth = month === months[currentMonth];

                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex flex-col-reverse gap-1 h-24 relative">
                      {total > 0 && (
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            {formatCurrency(total)}
                          </div>
                        </div>
                      )}
                      {data.paid > 0 && (
                        <div
                          className="bg-gradient-to-t from-green-600 to-green-500 rounded-t-lg shadow-sm hover:shadow-md transition-all duration-300 hover:from-green-700 hover:to-green-600"
                          style={{ height: `${paidHeight}%`, minHeight: paidHeight > 0 ? '4px' : '0' }}
                        />
                      )}
                      {data.pending > 0 && (
                        <div
                          className="bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-lg shadow-sm hover:shadow-md transition-all duration-300 hover:from-orange-600 hover:to-orange-500"
                          style={{ height: `${pendingHeight}%`, minHeight: pendingHeight > 0 ? '4px' : '0' }}
                        />
                      )}
                      {total === 0 && (
                        <div className="w-full h-1 bg-gray-100 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className={`text-sm font-semibold ${isCurrentMonth ? 'text-blue-600' : 'text-gray-700'}`}>
                        {month}
                      </span>
                      {total > 0 && (
                        <span className="text-xs text-gray-500 font-medium">
                          {formatCurrency(total)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-green-600 to-green-500 rounded shadow-sm"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">Pago</span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(
                      Array.from(monthlyData.values()).reduce((sum, d) => sum + d.paid, 0)
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-orange-400 rounded shadow-sm"></div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">A pagar</span>
                  <span className="text-xs text-gray-500">
                    {formatCurrency(
                      Array.from(monthlyData.values()).reduce((sum, d) => sum + d.pending, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardUI>

          {/* Resumo do Ano */}
          <CardUI>
            <h3 className="text-sm text-gray-600 mb-3 font-medium">Resumo do Ano</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Quanto devo</span>
                <span className="text-gray-800 font-semibold">{formatCurrency(summary.totalOwed)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quanto paguei</span>
                <span className="text-gray-800 font-semibold">{formatCurrency(summary.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Meses até zerar</span>
                <span className="text-gray-800 font-semibold">{summary.monthsToZero} meses</span>
              </div>
            </div>
          </CardUI>

          {/* Lista de Dívidas */}
          <CardUI>
            <h3 className="text-sm text-gray-600 mb-4 font-medium">Próximos Pagamentos</h3>
            <TransactionList
              type="debt"
              filter={filter}
              showStatus={true}
              showDueDate={true}
              columns={4}
            />
          </CardUI>
        </div>
      </div>

      <button
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110 z-40"
        aria-label="Adicionar transação"
      >
        +
      </button>

      <AddTransactionSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
    </div>
  );
}
