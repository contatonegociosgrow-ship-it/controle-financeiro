'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { getCurrentMonthUnpaidInstallments } from '@/lib/debtUtils';
import { getCurrentInvoice } from '@/lib/cardUtils';
import { CardUI } from './CardUI';
import Link from 'next/link';

export function DashboardSummary() {
  const { state } = useFinanceStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular despesas do mês atual
  const monthlyExpensesTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          ['expense_fixed', 'expense_variable', 'debt'].includes(t.type) &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
  }, [state.transactions]);

  // Calcular total de contribuições mensais das metas ativas
  const monthlyGoalsTotal = useMemo(() => {
    return state.goals
      .filter((g) => g.status === 'active')
      .reduce((sum, g) => sum + g.monthlyContribution, 0);
  }, [state.goals]);

  // Total comprometido (despesas + metas)
  const committedTotal = monthlyExpensesTotal + monthlyGoalsTotal;

  // Dinheiro disponível
  const availableMoney = state.profile.monthlyIncome - committedTotal;

  // Metas ativas
  const activeGoals = useMemo(() => {
    return state.goals.filter((g) => g.status === 'active');
  }, [state.goals]);

  // Dívidas do mês atual
  const currentMonthDebts = useMemo(() => {
    return getCurrentMonthUnpaidInstallments(state.debts);
  }, [state.debts]);

  // Total da fatura atual dos cartões
  const currentCardsInvoiceTotal = useMemo(() => {
    return state.cards.reduce((sum, card) => {
      const invoice = getCurrentInvoice(card, state.transactions);
      return sum + invoice.total;
    }, 0);
  }, [state.cards, state.transactions]);

  // Total comprometido incluindo dívidas parceladas
  const committedTotalWithDebts = committedTotal + currentMonthDebts;

  // Dinheiro disponível incluindo dívidas parceladas
  const availableMoneyWithDebts = state.profile.monthlyIncome - committedTotalWithDebts;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {/* Card 1: Salário do mês */}
      <CardUI className="shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💰</span>
          <h4 className="text-sm font-semibold text-gray-700">Salário do mês</h4>
        </div>
        <p className="text-2xl font-bold text-green-600">{formatCurrency(state.profile.monthlyIncome)}</p>
      </CardUI>

      {/* Card 2: Comprometido */}
      <CardUI className="shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📌</span>
          <h4 className="text-sm font-semibold text-gray-700">Comprometido</h4>
        </div>
        <p className="text-2xl font-bold text-red-600">{formatCurrency(committedTotalWithDebts)}</p>
        <p className="text-xs text-gray-500 mt-1">Gastos + Metas + Dívidas</p>
      </CardUI>

      {/* Card 3: Dívidas do mês */}
      <CardUI className="shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🔗</span>
          <h4 className="text-sm font-semibold text-gray-700">Dívidas do mês</h4>
        </div>
        <p className="text-2xl font-bold text-orange-600">{formatCurrency(currentMonthDebts)}</p>
        <p className="text-xs text-gray-500 mt-1">Parcelas não pagas</p>
      </CardUI>

      {/* Card 4: Disponível */}
      <CardUI className={`shadow-md hover:shadow-lg transition-shadow ${
        availableMoneyWithDebts >= 0 ? 'border-green-200' : 'border-red-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{availableMoneyWithDebts >= 0 ? '✅' : '⚠️'}</span>
          <h4 className="text-sm font-semibold text-gray-700">Disponível</h4>
        </div>
        <p className={`text-2xl font-bold ${
          availableMoneyWithDebts >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatCurrency(availableMoneyWithDebts)}
        </p>
      </CardUI>

      {/* Card 5: Cartões de Crédito */}
      <Link href="/app/cartoes">
        <CardUI className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">💳</span>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Cartões</h4>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(currentCardsInvoiceTotal)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Fatura atual
          </p>
        </CardUI>
      </Link>

      {/* Card 6: Metas */}
      <CardUI className="shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🎯</span>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Metas</h4>
        </div>
        {activeGoals.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma meta ativa</p>
        ) : (
          <div className="space-y-2">
            {activeGoals.slice(0, 2).map((goal) => {
              const percentage = goal.targetValue > 0 
                ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) 
                : 0;
              
              return (
                <div key={goal.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate flex-1 mr-2">
                      {goal.title}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {activeGoals.length > 2 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">+{activeGoals.length - 2} mais</p>
            )}
          </div>
        )}
      </CardUI>
    </div>
  );
}
