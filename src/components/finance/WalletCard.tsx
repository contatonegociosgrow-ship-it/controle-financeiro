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
    const initialWallet = state.profile.wallet || 0;

    // Calcular carteira atual: saldo inicial + todos os ganhos - todas as despesas
    const totalIncome = state.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.value, 0);

    const totalExpenses = state.transactions
      .filter((t) => ['expense_fixed', 'expense_variable', 'debt', 'savings'].includes(t.type))
      .reduce((sum, t) => sum + t.value, 0);

    // Carteira atual = saldo inicial + ganhos - gastos
    const currentWallet = initialWallet + totalIncome - totalExpenses;

    // Despesas do mês atual
    const monthlyExpenses = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          ['expense_fixed', 'expense_variable', 'debt'].includes(t.type) &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);

    // Metas ativas
    const monthlyGoals = state.goals
      .filter((g) => g.status === 'active')
      .reduce((sum, g) => sum + g.monthlyContribution, 0);

    // Dívidas parceladas do mês
    const monthlyDebts = getCurrentMonthUnpaidInstallments(state.debts);

    // Total comprometido
    const totalCommitted = monthlyExpenses + monthlyGoals + monthlyDebts;

    // Saldo disponível do mês
    const availableBalance = monthlyIncome - totalCommitted;

    return {
      monthlyIncome,
      currentWallet,
      initialWallet,
      totalIncome,
      totalExpenses,
      monthlyExpenses,
      monthlyGoals,
      monthlyDebts,
      totalCommitted,
      availableBalance,
    };
  }, [state]);

  const percentageUsed = balanceData.monthlyIncome > 0 
    ? (balanceData.totalCommitted / balanceData.monthlyIncome) * 100 
    : 0;

  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 text-white relative overflow-hidden shadow-md w-fit min-w-[240px] h-[100px]">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -mr-6 -mt-6" />
      <div className="absolute bottom-0 left-0 w-10 h-10 bg-white/10 rounded-full -ml-5 -mb-5" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Header compacto */}
        <div className="flex items-center gap-2">
          <span className="text-lg">💳</span>
          <h2 className="text-xs font-semibold opacity-90">Carteira</h2>
        </div>

        {/* Valor da carteira */}
        <div className="flex items-center">
          <p className={`text-xl font-bold tracking-tight ${
            balanceData.currentWallet >= 0 ? 'text-white' : 'text-red-200'
          }`}>
            {formatCurrency(balanceData.currentWallet)}
          </p>
        </div>

        {/* Salário do mês */}
        <div className="flex items-center justify-between text-xs">
          <span className="opacity-90">Salário:</span>
          <span className="font-semibold">{formatCurrency(balanceData.monthlyIncome)}</span>
        </div>
      </div>
    </div>
  );
}
