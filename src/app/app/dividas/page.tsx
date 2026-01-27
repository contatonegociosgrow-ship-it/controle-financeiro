'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { DebtCard } from '@/components/finance/DebtCard';
import { AddDebtSheet } from '@/components/finance/AddDebtSheet';
import { DateFilter } from '@/components/finance/DateFilter';
import { Link as LinkIcon, BarChart3, List, TrendingDown } from 'lucide-react';

export default function DividasPage() {
  const { state, isInitialized } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDebtSheetOpen, setIsDebtSheetOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);

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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <PageHeader
          title="Dívidas"
          icon={LinkIcon}
          onFilterChange={setFilter}
        />

        <div className="space-y-6">
          {/* Gráfico de Pagamentos */}
          <PremiumContentCard
            title="Gráfico de Pagamentos"
            icon={BarChart3}
            gradientFrom="from-red-600"
            gradientTo="to-red-700"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Próximos 4 meses</p>
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
          </PremiumContentCard>

          {/* Resumo do Ano */}
          <PremiumCard
            title="Resumo do Ano"
            icon={TrendingDown}
            value={summary.totalOwed}
            gradientFrom="from-red-600"
            gradientTo="to-red-700"
            formatCurrency={formatCurrency}
          />
          
          <PremiumContentCard
            title="Detalhes do Resumo"
            icon={TrendingDown}
            gradientFrom="from-orange-600"
            gradientTo="to-orange-700"
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Quanto paguei</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">{formatCurrency(summary.totalPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Meses até zerar</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">{summary.monthsToZero} meses</span>
              </div>
            </div>
          </PremiumContentCard>

          {/* Dívidas Parceladas */}
          {state.debts.filter((d) => d.status === 'active').length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Dívidas Parceladas</h3>
                <button
                  onClick={() => setIsDebtSheetOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  + Adicionar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.debts
                  .filter((d) => d.status === 'active')
                  .map((debt) => (
                    <DebtCard key={debt.id} debt={debt} />
                  ))}
              </div>
            </div>
          )}

          {/* Dívidas Concluídas */}
          {state.debts.filter((d) => d.status === 'completed').length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dívidas Concluídas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.debts
                  .filter((d) => d.status === 'completed')
                  .map((debt) => (
                    <DebtCard key={debt.id} debt={debt} />
                  ))}
              </div>
            </div>
          )}

          {/* Botão para adicionar dívida se não houver nenhuma */}
          {state.debts.length === 0 && (
            <PremiumContentCard
              title="Nenhuma dívida cadastrada"
              icon={LinkIcon}
              gradientFrom="from-gray-600"
              gradientTo="to-gray-700"
            >
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Comece adicionando uma dívida parcelada</p>
                <button
                  onClick={() => setIsDebtSheetOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
                >
                  Adicionar Dívida Parcelada
                </button>
              </div>
            </PremiumContentCard>
          )}

          {/* Filtro de Data */}
          <div className="mb-4">
            <DateFilter
              pageKey="dividas"
              onDateRangeChange={(start, end) => {
                setDateStart(start);
                setDateEnd(end);
              }}
            />
          </div>

          {/* Lista de Dívidas */}
          <PremiumContentCard
            title="Próximos Pagamentos"
            icon={List}
            gradientFrom="from-red-600"
            gradientTo="to-red-700"
          >
            <TransactionList
              type="debt"
              filter={filter}
              startDate={dateStart}
              endDate={dateEnd}
              showStatus={true}
              showDueDate={true}
              columns={4}
            />
          </PremiumContentCard>
        </div>
      </div>

      <button
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl sm:text-3xl font-light transition-all hover:scale-110 z-40"
        aria-label="Adicionar transação"
      >
        +
      </button>

      <AddTransactionSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
      <AddDebtSheet isOpen={isDebtSheetOpen} onClose={() => setIsDebtSheetOpen(false)} />
    </div>
  );
}
