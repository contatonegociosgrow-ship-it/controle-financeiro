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
    const now = new Date();
    return now.getMonth();
  });
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: state.profile.currency || 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    // Usar formatDateToBR para evitar problemas de fuso horário
    return formatDateToBR(dateStr);
  };

  // Filtrar investimentos pelo mês selecionado
  const filteredInvestments = useMemo(() => {
    return state.investments.filter((inv) => {
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
    const totalInvested = state.investments.reduce((sum, inv) => sum + inv.value, 0);
    
    const totalReturns = state.investments.reduce((sum, inv) => {
      if (inv.estimatedReturn) {
        return sum + (inv.value * inv.estimatedReturn / 100);
      }
      return sum;
    }, 0);

    const monthlyContributions = filteredInvestments.reduce((sum, inv) => sum + inv.value, 0);

    const averageReturn = totalInvested > 0 
      ? (totalReturns / totalInvested) * 100 
      : 0;

    return {
      totalInvested,
      totalReturns,
      monthlyContributions,
      averageReturn,
    };
  }, [state.investments, filteredInvestments]);

  // Função para navegar entre meses
  const handleMonthChange = (direction: 'prev' | 'next' | 'current') => {
    if (direction === 'current') {
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
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
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
              
              <div className="text-center min-w-[200px]">
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
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(investment.id)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(investment.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remover"
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
