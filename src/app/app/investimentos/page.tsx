'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/FinanceProvider';
import { PremiumContentCard } from '@/components/finance/PremiumContentCard';
import { PremiumCard } from '@/components/finance/PremiumCard';
import { PageHeader } from '@/components/finance/PageHeader';
import { TrendingUp, DollarSign, ArrowUpCircle, List, Plus, Edit, Trash2 } from 'lucide-react';
import { AddInvestmentSheet } from '@/components/finance/AddInvestmentSheet';
import { formatDateToBR } from '@/lib/goalUtils';

const INVESTMENT_TYPES = {
  fixed_income: { label: '🏦 Renda Fixa', emoji: '🏦' },
  variable_income: { label: '📈 Renda Variável', emoji: '📈' },
  crypto: { label: '🪙 Criptomoedas', emoji: '🪙' },
  monthly: { label: '🌱 Investimento Mensal', emoji: '🌱' },
  goal_based: { label: '🎯 Investimento por Meta', emoji: '🎯' },
};

export default function InvestimentosPage() {
  const { isInitialized, state, removeInvestment } = useFinanceStore();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado para controlar o mês/ano visualizado
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const now = new Date();
    return now.getMonth();
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (typeof window === 'undefined') return 2024;
    const now = new Date();
    return now.getFullYear();
  });

  const formatCurrency = (value: number) => {
    if (typeof window === 'undefined' || !state?.profile) {
      return 'R$ 0,00';
    }
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: state.profile.currency || 'BRL',
      }).format(numValue);
    } catch (e) {
      return 'R$ 0,00';
    }
  };

  const formatDate = (dateStr: string) => {
    // Usar formatDateToBR para evitar problemas de fuso horário
    return formatDateToBR(dateStr);
  };

  // Filtrar investimentos pelo mês selecionado
  const filteredInvestments = useMemo(() => {
    if (!state.investments || state.investments.length === 0) {
      return [];
    }
    
    return state.investments.filter((inv) => {
      // Validar se o investimento é válido
      if (!inv || typeof inv !== 'object') {
        return false;
      }
      
      // Validar valor
      if (typeof inv.value !== 'number' || isNaN(inv.value) || inv.value <= 0) {
        return false;
      }
      
      // Comparar diretamente pela string ISO (YYYY-MM-DD) para evitar problemas de fuso horário
      if (!inv.applicationDate || !inv.applicationDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return false;
      }
      const [year, month] = inv.applicationDate.split('-');
      return (
        parseInt(month, 10) === selectedMonth + 1 && // month é 0-indexed, mas ISO é 1-indexed
        parseInt(year, 10) === selectedYear
      );
    });
  }, [state.investments, selectedMonth, selectedYear]);

  // Calcular totais
  const totals = useMemo(() => {
    // Verificar se há investimentos
    if (!state.investments || !Array.isArray(state.investments) || state.investments.length === 0) {
      return {
        totalInvested: 0,
        totalReturns: 0,
        monthlyContributions: 0,
        averageReturn: 0,
      };
    }

    // Filtrar investimentos válidos (com valor > 0 e dados válidos)
    const validInvestments = state.investments.filter((inv) => {
      if (!inv || typeof inv !== 'object') {
        return false;
      }
      
      // Validar que value existe e é um número válido maior que 0
      if (typeof inv.value !== 'number' || isNaN(inv.value) || inv.value <= 0) {
        return false;
      }
      
      // Validar que não é um valor infinito ou muito grande
      if (!isFinite(inv.value) || inv.value >= Number.MAX_SAFE_INTEGER) {
        return false;
      }
      
      return true;
    });

    // Se não há investimentos válidos, retornar zeros
    if (validInvestments.length === 0) {
      return {
        totalInvested: 0,
        totalReturns: 0,
        monthlyContributions: 0,
        averageReturn: 0,
      };
    }

    const totalInvested = validInvestments.reduce((sum, inv) => {
      const value = typeof inv.value === 'number' && isFinite(inv.value) ? inv.value : 0;
      return sum + value;
    }, 0);
    
    const totalReturns = validInvestments.reduce((sum, inv) => {
      if (
        inv.estimatedReturn && 
        typeof inv.estimatedReturn === 'number' && 
        !isNaN(inv.estimatedReturn) &&
        isFinite(inv.estimatedReturn) &&
        typeof inv.value === 'number' &&
        isFinite(inv.value)
      ) {
        return sum + (inv.value * inv.estimatedReturn / 100);
      }
      return sum;
    }, 0);

    // Filtrar investimentos válidos do mês
    const validMonthlyInvestments = filteredInvestments.filter((inv) => {
      if (!inv || typeof inv !== 'object') {
        return false;
      }
      
      if (typeof inv.value !== 'number' || isNaN(inv.value) || inv.value <= 0) {
        return false;
      }
      
      if (!isFinite(inv.value) || inv.value >= Number.MAX_SAFE_INTEGER) {
        return false;
      }
      
      return true;
    });

    const monthlyContributions = validMonthlyInvestments.reduce((sum, inv) => {
      const value = typeof inv.value === 'number' && isFinite(inv.value) ? inv.value : 0;
      return sum + value;
    }, 0);

    const averageReturn = totalInvested > 0 
      ? (totalReturns / totalInvested) * 100 
      : 0;

    return {
      totalInvested: Math.max(0, Math.round(totalInvested * 100) / 100), // Arredondar para 2 casas decimais
      totalReturns: Math.max(0, Math.round(totalReturns * 100) / 100),
      monthlyContributions: Math.max(0, Math.round(monthlyContributions * 100) / 100),
      averageReturn: Math.max(0, Math.round(averageReturn * 10) / 10), // Arredondar para 1 casa decimal
    };
  }, [state.investments, filteredInvestments]);

  // Função para navegar entre meses
  const handleMonthChange = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'current') {
      if (typeof window === 'undefined') return;
      const now = new Date();
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
      return;
    }
    
    let newMonth = selectedMonth;
    let newYear = selectedYear;
    
    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
    } else if (direction === 'next') {
      newMonth++;
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
    }
    
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const isCurrentMonth = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const now = new Date();
    return selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  }, [selectedMonth, selectedYear]);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este investimento?')) {
      removeInvestment(id);
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
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
          <PageHeader
            title="📈 Investimentos"
            icon={TrendingUp}
            onFilterChange={() => {}}
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Aqui seu dinheiro começa a trabalhar por você
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
            💡 Investir um pouco todo mês faz seu salário render mais
          </p>
        </div>

        {/* Seletor de Mês/Ano */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleMonthChange('prev')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Mês anterior"
                title="Mês anterior"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-3 text-center min-w-[200px]">
                {/* Ícone SVG de Calendário Moderno */}
                <div className="flex-shrink-0">
                  <svg 
                    className="w-8 h-8 text-blue-600 dark:text-blue-400 drop-shadow-sm" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    <rect 
                      x="4" 
                      y="5" 
                      width="16" 
                      height="16" 
                      rx="2.5" 
                      stroke="url(#calendarGradient)" 
                      strokeWidth="1.8" 
                      fill="none"
                      className="drop-shadow-sm"
                    />
                    <path 
                      d="M4 11h16" 
                      stroke="url(#calendarGradient)" 
                      strokeWidth="1.8" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M8 2v3M16 2v3" 
                      stroke="url(#calendarGradient)" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                    <circle 
                      cx="8" 
                      cy="15.5" 
                      r="1.2" 
                      fill="url(#calendarGradient)"
                      opacity="0.9"
                    />
                    <circle 
                      cx="12" 
                      cy="15.5" 
                      r="1.2" 
                      fill="url(#calendarGradient)"
                      opacity="0.9"
                    />
                    <circle 
                      cx="16" 
                      cy="15.5" 
                      r="1.2" 
                      fill="url(#calendarGradient)"
                      opacity="0.9"
                    />
                    <circle 
                      cx="8" 
                      cy="19" 
                      r="1.2" 
                      fill="url(#calendarGradient)"
                      opacity="0.7"
                    />
                    <circle 
                      cx="12" 
                      cy="19" 
                      r="1.2" 
                      fill="url(#calendarGradient)"
                      opacity="0.7"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {monthNames[selectedMonth]} {selectedYear}
                  </div>
                  {!isCurrentMonth && (
                    <button
                      onClick={() => handleMonthChange('current')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                    >
                      Voltar para mês atual
                    </button>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleMonthChange('next')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Próximo mês"
                title="Próximo mês"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {!isCurrentMonth && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Visualizando mês anterior
              </div>
            )}
          </div>
        </div>

        {/* Cards principais */}
        <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Investido */}
            <PremiumCard
              title="💰 Total Investido"
              value={totals.totalInvested}
              icon={DollarSign}
              gradientFrom="from-blue-600"
              gradientTo="to-blue-700"
              formatCurrency={formatCurrency}
            />

            {/* Rendimentos */}
            <PremiumCard
              title="💹 Rendimentos"
              value={totals.totalReturns}
              percentage={totals.averageReturn}
              icon={ArrowUpCircle}
              gradientFrom="from-green-600"
              gradientTo="to-green-700"
              formatCurrency={formatCurrency}
            />

            {/* Aportes do Mês */}
            <PremiumCard
              title="📊 Aportes do Mês"
              value={totals.monthlyContributions}
              icon={TrendingUp}
              gradientFrom="from-purple-600"
              gradientTo="to-purple-700"
              formatCurrency={formatCurrency}
            />
          </div>
        </div>

        {/* Lista de Investimentos */}
        <div>
          <PremiumContentCard
            title="Meus Investimentos"
            icon={List}
            gradientFrom="from-indigo-600"
            gradientTo="to-indigo-700"
          >
            {state.investments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Nenhum investimento cadastrado</p>
                <p className="text-sm">Comece adicionando seu primeiro investimento</p>
              </div>
            ) : filteredInvestments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Nenhum investimento neste mês</p>
                <p className="text-sm">Os investimentos aparecerão aqui quando aplicados no mês selecionado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvestments.map((investment) => (
                  <div
                    key={investment.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {investment.name}
                          </h3>
                          <span className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                            {INVESTMENT_TYPES[investment.type].label}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Valor:</span>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(investment.value)}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Data:</span>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(investment.applicationDate)}
                            </p>
                          </div>
                          
                          {investment.estimatedReturn && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Rendimento:</span>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                +{investment.estimatedReturn.toFixed(2)}%
                              </p>
                            </div>
                          )}
                          
                          {investment.estimatedReturn && (
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Retorno:</span>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(investment.value * investment.estimatedReturn / 100)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {investment.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {investment.notes}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2 ml-2 sm:ml-4">
                        <button
                          onClick={() => handleEdit(investment.id)}
                          className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 rounded-lg transition-colors touch-manipulation"
                          title="Editar"
                          aria-label="Editar investimento"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(investment.id)}
                          className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 rounded-lg transition-colors touch-manipulation"
                          title="Remover"
                          aria-label="Remover investimento"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PremiumContentCard>
        </div>
      </div>

      {/* Botão flutuante */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => {
            setEditingId(null);
            setIsSheetOpen(true);
          }}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center text-3xl font-light transition-all hover:scale-110"
          aria-label="Adicionar investimento"
        >
          <Plus size={28} />
        </button>
      </div>

      <AddInvestmentSheet
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingId(null);
        }}
        editingId={editingId}
      />
    </div>
  );
}
