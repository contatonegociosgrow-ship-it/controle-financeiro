'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { TransactionList } from '@/components/finance/TransactionList';
import { AddTransactionSheet } from '@/components/finance/AddTransactionSheet';
import { AddGoalSheet } from '@/components/finance/AddGoalSheet';
import { GoalCard } from '@/components/finance/GoalCard';
import { DateFilter } from '@/components/finance/DateFilter';
import { PiggyBank, Wallet, List } from 'lucide-react';

export default function EconomiasPage() {
  const { isInitialized, state, setMonthlyIncome } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isGoalSheetOpen, setIsGoalSheetOpen] = useState(false);
  const [isEditingIncome, setIsEditingIncome] = useState(false);
  const [incomeValue, setIncomeValue] = useState('');
  const [filter, setFilter] = useState('');
  const [dateStart, setDateStart] = useState<string | null>(null);
  const [dateEnd, setDateEnd] = useState<string | null>(null);

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
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <PageHeader
          title="Economias e Metas"
          icon={PiggyBank}
          onFilterChange={setFilter}
        />

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
          
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                {isEditingIncome ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={incomeValue}
                      onChange={(e) => setIncomeValue(e.target.value)}
                      placeholder={formatCurrency(state.profile.monthlyIncome)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveIncome}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingIncome(false);
                        setIncomeValue('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(state.profile.monthlyIncome)}
                    </p>
                    <button
                      onClick={() => {
                        setIsEditingIncome(true);
                        setIncomeValue(state.profile.monthlyIncome.toString());
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Metas Ativas</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                {activeGoals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Metas Concluídas */}
        {completedGoals.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Metas Concluídas</h2>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                {completedGoals.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {/* Transações de Economia */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transações de Economia</h2>
          <div className="mb-4">
            <DateFilter
              pageKey="economias"
              onDateRangeChange={(start, end) => {
                setDateStart(start);
                setDateEnd(end);
              }}
            />
          </div>
          <PremiumContentCard
            title="Transações de Economia"
            icon={List}
            gradientFrom="from-blue-600"
            gradientTo="to-blue-700"
          >
            <TransactionList 
              type="savings" 
              filter={filter} 
              startDate={dateStart}
              endDate={dateEnd}
              showCategory={true} 
              columns={5} 
            />
          </PremiumContentCard>
        </div>
      </div>

      {/* Botões flutuantes */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 sm:gap-3 z-40">
        <button
          onClick={() => setIsGoalSheetOpen(true)}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl font-light transition-all hover:scale-110"
          aria-label="Adicionar meta"
          title="Nova Meta"
        >
          🎯
        </button>
        
        {/* Botões de ação */}
        <div className="flex gap-2">
          {/* Botão Microfone */}
          <button
            onClick={() => {
              setVoiceMode(true);
              setIsSheetOpen(true);
            }}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110"
            aria-label="Falar e registrar"
            title="Falar e registrar transação"
          >
            🎙️
          </button>
          
          {/* Botão Adicionar */}
          <button
            onClick={() => {
              setVoiceMode(false);
              setIsSheetOpen(true);
            }}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110"
            aria-label="Adicionar transação"
            title="Nova Transação"
          >
            +
          </button>
        </div>
      </div>

      <AddTransactionSheet 
        isOpen={isSheetOpen} 
        onClose={() => {
          setIsSheetOpen(false);
          setVoiceMode(false);
        }}
        startWithVoice={voiceMode}
      />
      <AddGoalSheet isOpen={isGoalSheetOpen} onClose={() => setIsGoalSheetOpen(false)} />
    </div>
  );
}
