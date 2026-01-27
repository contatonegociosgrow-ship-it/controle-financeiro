'use client';

import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { AnimatedCounter } from './AnimatedCounter';
import { TrendingUp, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';

export function MonthlyInsight() {
  const { state } = useFinanceStore();

  const insight = useMemo(() => {
    const monthlyIncome = state.profile.monthlyIncome || 0;
    
    // Calcular total gasto no mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const totalSpent = state.transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          ['expense_fixed', 'expense_variable', 'debt'].includes(t.type) &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, t) => sum + t.value, 0);

    const percentage = monthlyIncome > 0 ? (totalSpent / monthlyIncome) * 100 : 0;

    let status: 'excellent' | 'attention' | 'alert';
    let message: string;
    let color: string;

    if (percentage < 60) {
      status = 'excellent';
      message = 'Excelente controle financeiro! Continue assim.';
      color = 'text-green-600 dark:text-green-400';
    } else if (percentage >= 60 && percentage < 75) {
      status = 'attention';
      message = 'Atenção: você está comprometendo uma boa parte do salário.';
      color = 'text-yellow-600 dark:text-yellow-400';
    } else {
      status = 'alert';
      message = 'Alerta: mais de 75% do salário comprometido. Revise seus gastos.';
      color = 'text-red-600 dark:text-red-400';
    }

    return {
      totalSpent,
      percentage,
      status,
      message,
      color,
      monthlyIncome,
    };
  }, [state.transactions, state.profile.monthlyIncome]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const getStatusConfig = () => {
    switch (insight.status) {
      case 'excellent':
        return {
          icon: CheckCircle2,
          gradientFrom: 'from-green-600',
          gradientTo: 'to-green-700',
        };
      case 'attention':
        return {
          icon: AlertTriangle,
          gradientFrom: 'from-yellow-600',
          gradientTo: 'to-yellow-700',
        };
      case 'alert':
        return {
          icon: TrendingUp,
          gradientFrom: 'from-red-600',
          gradientTo: 'to-red-700',
        };
    }
  };

  if (insight.monthlyIncome === 0) {
    const config = {
      icon: Lightbulb,
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-blue-700',
    };
    
    return (
      <div className={`mb-6 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-lg h-[140px] sm:h-[160px]`}>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6" />
        
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <config.icon size={24} strokeWidth={2} className="text-white opacity-90" />
            <h3 className="text-base sm:text-lg font-semibold opacity-90">
              Insight do Mês
            </h3>
          </div>
          <p className="text-sm sm:text-base opacity-90">
            Configure seu salário mensal no perfil para ver insights personalizados
          </p>
        </div>
      </div>
    );
  }

  const config = getStatusConfig();

  return (
    <div className={`mb-6 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all h-[200px] sm:h-[220px]`}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8" />
      <div className="absolute top-1/2 right-6 w-10 h-10 bg-white/5 rounded-full" />
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <config.icon size={24} strokeWidth={2} className="text-white opacity-90" />
            <h3 className="text-base sm:text-lg font-semibold opacity-90">
              Insight do Mês
            </h3>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-bold">
              <AnimatedCounter 
                value={insight.percentage} 
                decimals={1}
                suffix="%"
              />
            </div>
            <p className="text-xs opacity-80 mt-0.5">do salário</p>
          </div>
        </div>
        
        {/* Valores */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm opacity-80">
              Total gasto este mês:
            </span>
            <span className="text-lg sm:text-xl font-bold">
              {formatCurrency(insight.totalSpent)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm opacity-80">
              Salário mensal:
            </span>
            <span className="text-base sm:text-lg font-semibold opacity-90">
              {formatCurrency(insight.monthlyIncome)}
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(insight.percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Mensagem */}
        <p className="text-xs sm:text-sm font-medium opacity-90">
          {insight.message}
        </p>
      </div>
    </div>
  );
}
