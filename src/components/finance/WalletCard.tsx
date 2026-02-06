'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { getCurrentMonthUnpaidInstallments } from '@/lib/debtUtils';
import { CardUI } from './CardUI';

export function WalletCard() {
  const { state } = useFinanceStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular valores do mês atual e carteira
  const balanceData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = state.profile.monthlyIncome || 0;

    // Ganhos do mês atual
    const monthlyIncomeTransactions = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'income' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);

    // Gastos do mês atual (despesas fixas, variáveis, dívidas e economias)
    const monthlyExpenses = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          ['expense_fixed', 'expense_variable', 'debt', 'savings'].includes(t.type) &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);

    // Investimentos do mês atual (deduzir da carteira)
    const monthlyInvestments = state.investments
      .filter((inv) => {
        const investmentDate = new Date(inv.applicationDate);
        return (
          investmentDate.getMonth() === currentMonth &&
          investmentDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, inv) => sum + inv.value, 0);

    // Saldo do mês = Salário + Ganhos do mês - Gastos do mês - Investimentos do mês
    const currentBalance = monthlyIncome + monthlyIncomeTransactions - monthlyExpenses - monthlyInvestments;

    return {
      monthlyIncome,
      monthlyIncomeTransactions,
      monthlyExpenses,
      monthlyInvestments,
      currentBalance,
    };
  }, [state]);

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-2.5 sm:p-3 text-white relative overflow-hidden shadow-md w-full sm:w-fit sm:min-w-[240px] h-[130px] sm:h-[140px]">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6" />
      <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/10 rounded-full -ml-5 -mb-5" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Header compacto */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg">💳</span>
          <h2 className="text-[10px] sm:text-xs font-semibold opacity-90">Carteira</h2>
        </div>

        {/* Valor principal: Saldo atualizado (Salário + Ganhos - Gastos) */}
        <div className="flex items-center">
          <p className={`text-lg sm:text-xl font-bold tracking-tight truncate ${
            balanceData.currentBalance >= 0 ? 'text-white' : 'text-red-200'
          }`}>
            {formatCurrency(balanceData.currentBalance)}
          </p>
        </div>

        {/* Informações do mês */}
        <div className="space-y-1">
          {/* Salário base */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="opacity-90">Salário:</span>
            <span className="font-semibold truncate ml-2 text-white">
              {formatCurrency(balanceData.monthlyIncome)}
            </span>
          </div>

          {/* Gastos do mês */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="opacity-90">Gastos:</span>
            <span className="font-semibold truncate ml-2 text-red-200">
              {formatCurrency(balanceData.monthlyExpenses)}
            </span>
          </div>

          {/* Ganhos do mês */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="opacity-90">Ganhos:</span>
            <span className="font-semibold truncate ml-2 text-white">
              {formatCurrency(balanceData.monthlyIncomeTransactions)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
