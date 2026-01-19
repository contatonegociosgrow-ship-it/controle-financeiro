'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { getCurrentMonthUnpaidInstallments } from '@/lib/debtUtils';

type BalanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function BalanceModal({ isOpen, onClose }: BalanceModalProps) {
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

  if (!isOpen) return null;

  const percentageUsed = balanceData.monthlyIncome > 0 
    ? (balanceData.totalCommitted / balanceData.monthlyIncome) * 100 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">Saldo do Mês</h2>
                {state.profile.name && (
                  <p className="text-sm opacity-90">Olá, {state.profile.name}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Carteira em destaque */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">💳</span>
                <p className="text-sm opacity-90 font-medium">Carteira</p>
              </div>
              <p className={`text-5xl font-bold tracking-tight ${
                balanceData.currentWallet >= 0 ? 'text-white' : 'text-red-200'
              }`}>
                {formatCurrency(balanceData.currentWallet)}
              </p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="flex items-center justify-between text-xs opacity-90">
                  <span>Salário do mês:</span>
                  <span className="font-semibold">{formatCurrency(balanceData.monthlyIncome)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Resumo da Carteira */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Movimentação da Carteira</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Saldo inicial:</span>
                <span className="font-semibold text-gray-900">{formatCurrency(balanceData.initialWallet)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">+ Ganhos totais:</span>
                <span className="font-semibold text-green-600">{formatCurrency(balanceData.totalIncome)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600">- Gastos totais:</span>
                <span className="font-semibold text-red-600">{formatCurrency(balanceData.totalExpenses)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Saldo atual:</span>
                <span className={`text-2xl font-bold ${
                  balanceData.currentWallet >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(balanceData.currentWallet)}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progresso visual do mês */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Comprometido este mês</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(balanceData.totalCommitted)} ({percentageUsed.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  percentageUsed >= 90
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : percentageUsed >= 75
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                    : percentageUsed >= 50
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                    : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${Math.min(percentageUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Detalhamento
            </h3>

            {/* Despesas */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">💸</span>
                <span className="text-sm font-medium text-gray-700">Despesas</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(balanceData.monthlyExpenses)}
              </span>
            </div>

            {/* Metas */}
            {balanceData.monthlyGoals > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span className="text-sm font-medium text-gray-700">Metas</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(balanceData.monthlyGoals)}
                </span>
              </div>
            )}

            {/* Dívidas */}
            {balanceData.monthlyDebts > 0 && (
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔗</span>
                  <span className="text-sm font-medium text-gray-700">Dívidas Parceladas</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(balanceData.monthlyDebts)}
                </span>
              </div>
            )}

            {/* Total Comprometido */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Total Comprometido</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(balanceData.totalCommitted)}
              </span>
            </div>
          </div>

          {/* Saldo Disponível */}
          <div
            className={`p-5 rounded-xl border-2 shadow-sm ${
              balanceData.availableBalance >= 0
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{balanceData.availableBalance >= 0 ? '✅' : '⚠️'}</span>
                  <p className="text-base font-bold text-gray-900">Saldo Disponível</p>
                </div>
                <p className="text-xs text-gray-600">
                  {balanceData.availableBalance >= 0
                    ? `Restam ${formatCurrency(balanceData.availableBalance)} do seu salário`
                    : 'Atenção: você está gastando mais do que ganha'}
                </p>
              </div>
              <p
                className={`text-4xl font-bold ml-4 ${
                  balanceData.availableBalance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(balanceData.availableBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
