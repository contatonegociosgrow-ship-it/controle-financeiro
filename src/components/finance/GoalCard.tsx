'use client';

import { useState } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { CardUI } from './CardUI';

type GoalCardProps = {
  goal: {
    id: string;
    title: string;
    targetValue: number;
    monthlyContribution: number;
    currentValue: number;
    startDate: string;
    deadline?: string;
    status: 'active' | 'completed';
  };
};

export function GoalCard({ goal }: GoalCardProps) {
  const { updateGoal, removeGoal, contributeToGoal, state } = useFinanceStore();
  const [isEditing, setIsEditing] = useState(false);
  const [contributionValue, setContributionValue] = useState('');
  const [showContribute, setShowContribute] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // Converter diretamente de ISO (YYYY-MM-DD) para BR (DD/MM/YYYY) sem usar Date para evitar problemas de fuso horário
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const percentage = goal.targetValue > 0 
    ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) 
    : 0;

  const handleContribute = () => {
    const value = parseFloat(contributionValue);
    if (value > 0) {
      contributeToGoal(goal.id, value);
      setContributionValue('');
      setShowContribute(false);
    }
  };

  const handleComplete = () => {
    updateGoal(goal.id, { status: 'completed' });
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      removeGoal(goal.id);
    }
  };

  return (
    <CardUI className="shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
      {/* Cabeçalho */}
      <div className="mb-4">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-3">{goal.title}</h3>
        
        {/* Datas */}
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Início: {formatDate(goal.startDate)}</span>
          </div>
          {goal.deadline && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Prazo: {formatDate(goal.deadline)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-5 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-1">
              {formatCurrency(goal.currentValue)} de {formatCurrency(goal.targetValue)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Contribuição mensal: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(goal.monthlyContribution)}</span>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 lg:h-5 overflow-hidden shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              goal.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Formulário de contribuição */}
      {showContribute && goal.status === 'active' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            <input
              type="number"
              step="0.01"
              value={contributionValue}
              onChange={(e) => setContributionValue(e.target.value)}
              placeholder="Digite o valor"
              className="w-full min-h-[44px] px-4 py-2.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-base text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex gap-2">
              <button
                onClick={handleContribute}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all text-sm font-semibold touch-manipulation shadow-md hover:shadow-lg"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowContribute(false);
                  setContributionValue('');
                }}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-500 dark:hover:to-gray-600 active:from-gray-400 active:to-gray-500 dark:active:from-gray-400 dark:active:to-gray-500 transition-all text-sm touch-manipulation shadow-sm hover:shadow-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-2">
          {goal.status === 'active' && (
            <>
              <button
                onClick={() => setShowContribute(!showContribute)}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 transition-all text-sm font-semibold touch-manipulation shadow-md hover:shadow-lg"
              >
                Contribuir
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transition-all text-sm font-semibold touch-manipulation shadow-md hover:shadow-lg"
              >
                Concluir
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="flex-1 min-h-[44px] px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 transition-all text-sm font-semibold touch-manipulation shadow-md hover:shadow-lg"
            aria-label="Excluir meta"
          >
            Excluir
          </button>
        </div>
      </div>
    </CardUI>
  );
}
