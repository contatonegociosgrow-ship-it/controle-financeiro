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
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
    <CardUI className="shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{goal.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Início: {formatDate(goal.startDate)}</span>
            {goal.deadline && <span>Prazo: {formatDate(goal.deadline)}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {goal.status === 'active' && (
            <>
              <button
                onClick={() => setShowContribute(!showContribute)}
                className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1 text-sm md:text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation font-medium"
              >
                Contribuir
              </button>
              <button
                onClick={handleComplete}
                className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1 text-sm md:text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors touch-manipulation font-medium"
              >
                Concluir
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="min-h-[44px] px-4 py-2.5 md:px-3 md:py-1 text-sm md:text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation font-medium"
            aria-label="Excluir meta"
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-700 font-medium">
            {formatCurrency(goal.currentValue)} de {formatCurrency(goal.targetValue)}
          </span>
          <span className="text-gray-600">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              goal.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Contribuição mensal */}
      <div className="text-sm text-gray-600 mb-2">
        Contribuição mensal: <span className="font-semibold">{formatCurrency(goal.monthlyContribution)}</span>
      </div>

      {/* Formulário de contribuição */}
      {showContribute && goal.status === 'active' && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={contributionValue}
              onChange={(e) => setContributionValue(e.target.value)}
              placeholder="Valor"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleContribute}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setShowContribute(false);
                setContributionValue('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </CardUI>
  );
}
