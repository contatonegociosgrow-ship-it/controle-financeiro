'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { AddGoalSheet } from '@/components/finance/AddGoalSheet';
import { GoalCard } from '@/components/finance/GoalCard';
import { Wallet } from 'lucide-react';

export default function EconomiasPage() {
  const { isInitialized, state, setMonthlyIncome } = useFinanceStore();
  const [isGoalSheetOpen, setIsGoalSheetOpen] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeValue, setIncomeValue] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const activeGoals = useMemo(() => {
    return state.goals.filter((g) => g.status === 'active');
  }, [state.goals]);

  const completedGoals = useMemo(() => {
    return state.goals.filter((g) => g.status === 'completed');
  }, [state.goals]);

  const handleSaveIncome = () => {
    const value = parseFloat(incomeValue);
    if (!isNaN(value) && value >= 0) {
      setMonthlyIncome(value);
      setIsEditingIncome(false);
      setIncomeValue('');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header com Logo SVG */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            {/* Logo SVG de Metas */}
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 md:w-16 md:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="metasGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6"/>
                    <stop offset="1" stopColor="#2563EB"/>
                  </linearGradient>
                  <linearGradient id="metasGradient2" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA"/>
                    <stop offset="1" stopColor="#3B82F6"/>
                  </linearGradient>
                </defs>
                {/* Círculo de fundo */}
                <circle cx="50" cy="50" r="45" fill="url(#metasGradient)" opacity="0.1"/>
                {/* Anel externo do alvo */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="url(#metasGradient)" strokeWidth="3"/>
                {/* Anel médio */}
                <circle cx="50" cy="50" r="28" fill="none" stroke="url(#metasGradient2)" strokeWidth="2.5"/>
                {/* Anel interno */}
                <circle cx="50" cy="50" r="18" fill="url(#metasGradient2)" opacity="0.3"/>
                {/* Centro do alvo */}
                <circle cx="50" cy="50" r="10" fill="url(#metasGradient)"/>
                {/* Seta/Check no centro */}
                <path d="M45 50 L48 53 L55 46" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Estrela decorativa */}
                <path d="M50 20 L52 28 L60 28 L53 33 L55 41 L50 36 L45 41 L47 33 L40 28 L48 28 Z" fill="#FCD34D" opacity="0.9"/>
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Metas
              </h1>
            </div>
          </div>
        </div>

        {/* Card de Salário Mensal */}
        <div className="mb-6">
          <PremiumCard
            title="Salário Mensal"
            icon={Wallet}
            value={state.profile.monthlyIncome}
            gradientFrom="from-green-600"
            gradientTo="to-green-700"
            formatCurrency={formatCurrency}
          />
          
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {isEditingIncome ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="number"
                      step="0.01"
                      value={incomeValue}
                      onChange={(e) => setIncomeValue(e.target.value)}
                      placeholder={formatCurrency(state.profile.monthlyIncome)}
                      className="flex-1 min-h-[44px] px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveIncome}
                        className="flex-1 sm:flex-none min-h-[44px] px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-semibold touch-manipulation"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingIncome(false);
                          setIncomeValue('');
                        }}
                        className="flex-1 sm:flex-none min-h-[44px] px-6 py-2.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 active:bg-gray-400 dark:active:bg-gray-400 transition-colors text-sm touch-manipulation"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 break-words">
                      {formatCurrency(state.profile.monthlyIncome)}
                    </p>
                    <button
                      onClick={() => {
                        setIsEditingIncome(true);
                        setIncomeValue(state.profile.monthlyIncome.toString());
                      }}
                      className="self-start sm:self-auto min-h-[44px] px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors touch-manipulation font-medium"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metas Ativas */}
        {activeGoals.length > 0 && (
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-2 mb-4 lg:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Metas Ativas</h2>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs lg:text-sm font-semibold">
                {activeGoals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Metas Concluídas */}
        {completedGoals.length > 0 && (
          <div className="mb-6 lg:mb-8">
            <div className="flex items-center gap-2 mb-4 lg:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Metas Concluídas</h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs lg:text-sm font-semibold">
                {completedGoals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => setIsGoalSheetOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl font-light transition-all hover:scale-110"
          aria-label="Adicionar meta"
          title="Nova Meta"
        >
          🎯
        </button>
      </div>

      <AddGoalSheet isOpen={isGoalSheetOpen} onClose={() => setIsGoalSheetOpen(false)} />
    </div>
  );
}
