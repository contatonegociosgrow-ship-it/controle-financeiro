'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PageHeader } from '@/components/finance/PageHeader';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { calculateFinancialHealth } from '@/lib/financialHealthUtils';
import { AnimatedCounter } from '@/components/finance/AnimatedCounter';
import { getCurrentInvoice } from '@/lib/cardUtils';
import { MonthSimulator } from '@/components/finance/MonthSimulator';
import { HeartPulse, TrendingUp, CreditCard, PiggyBank, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function SaudeFinanceiraPage() {
  const { state, isInitialized } = useFinanceStore();

  const health = useMemo(() => {
    return calculateFinancialHealth(state);
  }, [state]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  // Calcular uso de cartão
  const cardUsage = useMemo(() => {
    const totalCardInvoice = state.cards.reduce((sum, card) => {
      const invoice = getCurrentInvoice(card, state.transactions);
      return sum + invoice.total;
    }, 0);
    
    const monthlyIncome = state.profile.monthlyIncome || 0;
    const cardPercentage = monthlyIncome > 0 ? (totalCardInvoice / monthlyIncome) * 100 : 0;
    
    return {
      total: totalCardInvoice,
      percentage: cardPercentage,
    };
  }, [state.cards, state.transactions, state.profile.monthlyIncome]);

  // Calcular percentual poupado
  const savingsPercentage = useMemo(() => {
    const monthlyIncome = state.profile.monthlyIncome || 0;
    if (monthlyIncome === 0) return 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const totalSavings = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          t.type === 'savings' &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);
    
    return (totalSavings / monthlyIncome) * 100;
  }, [state.transactions, state.profile.monthlyIncome]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Boa';
      case 'warning':
        return 'Atenção';
      case 'critical':
        return 'Crítica';
      default:
        return 'Indefinido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'good':
        return 'text-green-500 dark:text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return CheckCircle2;
      case 'good':
        return CheckCircle2;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return TrendingUp;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'excellent':
        return { from: 'from-green-600', to: 'to-green-700' };
      case 'good':
        return { from: 'from-blue-600', to: 'to-blue-700' };
      case 'warning':
        return { from: 'from-yellow-600', to: 'to-yellow-700' };
      case 'critical':
        return { from: 'from-red-600', to: 'to-red-700' };
      default:
        return { from: 'from-gray-600', to: 'to-gray-700' };
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <PageHeader title="Saúde Financeira do Mês" icon={HeartPulse} hideSearch />

        {/* Status Principal */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${getStatusGradient(health.status).from} ${getStatusGradient(health.status).to} rounded-2xl p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all`}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                {(() => {
                  const StatusIcon = getStatusIcon(health.status);
                  return <StatusIcon size={32} strokeWidth={2} className="text-white" />;
                })()}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {getStatusLabel(health.status)}
                </h2>
                <p className="text-sm text-white/90">
                  {health.message}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={health.score} suffix="/100" />
                </div>
                <p className="text-xs text-white/80 mt-1">Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* % Salário Comprometido */}
          <PremiumCard
            title="Salário Comprometido"
            icon={TrendingUp}
            value={health.totalCommitted}
            percentage={health.expensePercentage}
            gradientFrom={health.status === 'excellent' || health.status === 'good' ? 'from-green-600' : health.status === 'warning' ? 'from-yellow-600' : 'from-red-600'}
            gradientTo={health.status === 'excellent' || health.status === 'good' ? 'to-green-700' : health.status === 'warning' ? 'to-yellow-700' : 'to-red-700'}
            formatCurrency={formatCurrency}
            showProgress={true}
            progressValue={health.expensePercentage}
          />

          {/* % Cartão Usado */}
          <PremiumCard
            title="Cartão de Crédito"
            icon={CreditCard}
            value={cardUsage.total}
            percentage={cardUsage.percentage}
            gradientFrom={cardUsage.percentage < 20 ? 'from-green-600' : cardUsage.percentage < 40 ? 'from-yellow-600' : 'from-red-600'}
            gradientTo={cardUsage.percentage < 20 ? 'to-green-700' : cardUsage.percentage < 40 ? 'to-yellow-700' : 'to-red-700'}
            formatCurrency={formatCurrency}
            showProgress={true}
            progressValue={cardUsage.percentage}
          />

          {/* % Poupado */}
          <PremiumCard
            title="Poupado este Mês"
            icon={PiggyBank}
            value={(state.profile.monthlyIncome || 0) * (savingsPercentage / 100)}
            percentage={savingsPercentage}
            gradientFrom={savingsPercentage >= 20 ? 'from-green-600' : savingsPercentage >= 10 ? 'from-blue-600' : 'from-gray-600'}
            gradientTo={savingsPercentage >= 20 ? 'to-green-700' : savingsPercentage >= 10 ? 'to-blue-700' : 'to-gray-700'}
            formatCurrency={formatCurrency}
            showProgress={true}
            progressValue={savingsPercentage}
          />
        </div>

        {/* Simulador */}
        <div className="mb-8">
          <MonthSimulator />
        </div>

        {/* Detalhamento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <PremiumContentCard
            title="Resumo Financeiro"
            icon={TrendingUp}
            gradientFrom="from-indigo-600"
            gradientTo="to-indigo-700"
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Renda Mensal</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(health.monthlyIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Despesas</span>
                <span className="text-base font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(health.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Metas</span>
                <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(health.totalGoals)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Dívidas</span>
                <span className="text-base font-semibold text-orange-600 dark:text-orange-400">
                  {formatCurrency(health.totalDebts)}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">Disponível</span>
                <span className={`text-lg font-bold ${
                  health.availableMoney >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(health.availableMoney)}
                </span>
              </div>
            </div>
          </PremiumContentCard>

          <PremiumContentCard
            title="Recomendações"
            icon={AlertTriangle}
            gradientFrom="from-amber-600"
            gradientTo="to-amber-700"
          >
            <ul className="space-y-2">
              {health.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </PremiumContentCard>
        </div>
      </div>
    </div>
  );
}
