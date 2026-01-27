'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from './CardUI';
import { AnimatedCounter } from './AnimatedCounter';
import { toast } from './Toast';

export function MonthSimulator() {
  const { state } = useFinanceStore();
  const [expectedSalary, setExpectedSalary] = useState(state.profile.monthlyIncome || 0);
  const [expectedFixedExpenses, setExpectedFixedExpenses] = useState(0);

  const simulation = useMemo(() => {
    const fixedExpenses = expectedFixedExpenses || 0;
    const estimatedBalance = expectedSalary - fixedExpenses;

    return {
      expectedSalary,
      fixedExpenses,
      estimatedBalance,
      percentageUsed: expectedSalary > 0 ? (fixedExpenses / expectedSalary) * 100 : 0,
    };
  }, [expectedSalary, expectedFixedExpenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const handleSimulate = () => {
    if (expectedSalary <= 0) {
      toast.warning('Informe um salário válido');
      return;
    }
    toast.success('Simulação realizada com sucesso!');
  };

  const getStatusColor = (percentage: number) => {
    if (percentage < 60) return 'text-green-600 dark:text-green-400';
    if (percentage < 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBgColor = (percentage: number) => {
    if (percentage < 60) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (percentage < 75) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  return (
    <CardUI className={`shadow-lg border-2 ${getStatusBgColor(simulation.percentageUsed)}`}>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔮</span>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Simulador de Próximo Mês
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Estime seu saldo para o próximo mês
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Salário Esperado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salário Esperado
          </label>
          <input
            type="number"
            value={expectedSalary || ''}
            onChange={(e) => setExpectedSalary(Number(e.target.value))}
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 text-base focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Gastos Fixos Esperados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gastos Fixos Esperados
          </label>
          <input
            type="number"
            value={expectedFixedExpenses || ''}
            onChange={(e) => setExpectedFixedExpenses(Number(e.target.value))}
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-800 dark:text-gray-200 text-base focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Resultado da Simulação */}
        {expectedSalary > 0 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Salário</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(simulation.expectedSalary)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Gastos Fixos</span>
              <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(simulation.fixedExpenses)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">% Comprometido</span>
              <span className={`text-lg font-bold ${getStatusColor(simulation.percentageUsed)}`}>
                <AnimatedCounter value={simulation.percentageUsed} decimals={1} suffix="%" />
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Saldo Estimado
                </span>
                <span className={`text-2xl font-bold ${
                  simulation.estimatedBalance >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(simulation.estimatedBalance)}
                </span>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    simulation.percentageUsed < 60 ? 'bg-green-500' :
                    simulation.percentageUsed < 75 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(simulation.percentageUsed, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSimulate}
          className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md"
        >
          Simular
        </button>
      </div>
    </CardUI>
  );
}
